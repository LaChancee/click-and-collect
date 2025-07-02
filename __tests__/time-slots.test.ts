import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { addDays, startOfDay, setHours, setMinutes, getDay } from "date-fns";

// Mock Prisma
const mockPrisma = {
  timeSlot: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  settings: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  order: {
    count: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Utility functions for time slot generation
const generateTimeSlots = (params: {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  maxOrders: number;
  daysOfWeek: number[];
  bakeryId: string;
}) => {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    duration,
    maxOrders,
    daysOfWeek,
    bakeryId,
  } = params;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  const timeSlotsToCreate = [];
  let currentDate = startOfDay(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = getDay(currentDate);

    if (daysOfWeek.includes(dayOfWeek)) {
      let currentMinutes = startMinutes;

      while (currentMinutes + duration <= endMinutes) {
        const slotStartTime = setMinutes(
          setHours(startOfDay(currentDate), Math.floor(currentMinutes / 60)),
          currentMinutes % 60,
        );

        const slotEndTime = setMinutes(
          setHours(
            startOfDay(currentDate),
            Math.floor((currentMinutes + duration) / 60),
          ),
          (currentMinutes + duration) % 60,
        );

        timeSlotsToCreate.push({
          startTime: slotStartTime,
          endTime: slotEndTime,
          maxOrders,
          isActive: true,
          bakeryId,
        });

        currentMinutes += duration;
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return timeSlotsToCreate;
};

const validateTimeSlotAvailability = (timeSlot: {
  maxOrders: number;
  currentOrders: number;
}) => {
  return timeSlot.currentOrders < timeSlot.maxOrders;
};

const calculateTimeSlotOccupancy = (timeSlot: {
  maxOrders: number;
  currentOrders: number;
}) => {
  return (timeSlot.currentOrders / timeSlot.maxOrders) * 100;
};

describe("Time Slots Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Time slot generation", () => {
    it("should generate time slots correctly for a single day", () => {
      const today = new Date("2024-01-15T00:00:00Z");
      const params = {
        startDate: today,
        endDate: today,
        startTime: "08:00",
        endTime: "12:00",
        duration: 30, // 30 minutes
        maxOrders: 5,
        daysOfWeek: [1], // Monday
        bakeryId: "bakery-123",
      };

      const slots = generateTimeSlots(params);

      // 4 hours * 2 slots per hour = 8 slots
      expect(slots).toHaveLength(8);

      // Check first slot
      expect(slots[0].maxOrders).toBe(5);
      expect(slots[0].bakeryId).toBe("bakery-123");
      expect(slots[0].isActive).toBe(true);
    });

    it("should generate time slots for multiple days", () => {
      const startDate = new Date("2024-01-15T00:00:00Z"); // Monday
      const endDate = new Date("2024-01-19T00:00:00Z"); // Friday
      const params = {
        startDate,
        endDate,
        startTime: "08:00",
        endTime: "10:00",
        duration: 30,
        maxOrders: 5,
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        bakeryId: "bakery-123",
      };

      const slots = generateTimeSlots(params);

      // 5 days * 2 hours * 2 slots per hour = 20 slots
      expect(slots).toHaveLength(20);
    });

    it("should skip days not in daysOfWeek", () => {
      const startDate = new Date("2024-01-15T00:00:00Z"); // Monday
      const endDate = new Date("2024-01-16T00:00:00Z"); // Tuesday
      const params = {
        startDate,
        endDate,
        startTime: "08:00",
        endTime: "10:00",
        duration: 30,
        maxOrders: 5,
        daysOfWeek: [1], // Only Monday
        bakeryId: "bakery-123",
      };

      const slots = generateTimeSlots(params);

      // Only Monday should be included: 2 hours * 2 slots = 4 slots
      expect(slots).toHaveLength(4);
    });

    it("should handle 15-minute intervals", () => {
      const today = new Date("2024-01-15T00:00:00Z");
      const params = {
        startDate: today,
        endDate: today,
        startTime: "08:00",
        endTime: "09:00",
        duration: 15, // 15 minutes
        maxOrders: 3,
        daysOfWeek: [1],
        bakeryId: "bakery-123",
      };

      const slots = generateTimeSlots(params);

      // 1 hour / 15 minutes = 4 slots
      expect(slots).toHaveLength(4);
    });

    it("should handle edge case with no valid days", () => {
      const today = new Date("2024-01-15T00:00:00Z"); // Monday
      const params = {
        startDate: today,
        endDate: today,
        startTime: "08:00",
        endTime: "10:00",
        duration: 30,
        maxOrders: 5,
        daysOfWeek: [0], // Sunday only, but date is Monday
        bakeryId: "bakery-123",
      };

      const slots = generateTimeSlots(params);

      expect(slots).toHaveLength(0);
    });
  });

  describe("Time slot validation", () => {
    it("should validate available time slots", () => {
      const availableSlot = {
        maxOrders: 10,
        currentOrders: 5,
      };

      const fullSlot = {
        maxOrders: 10,
        currentOrders: 10,
      };

      expect(validateTimeSlotAvailability(availableSlot)).toBe(true);
      expect(validateTimeSlotAvailability(fullSlot)).toBe(false);
    });

    it("should calculate occupancy rate correctly", () => {
      const slot1 = { maxOrders: 10, currentOrders: 5 };
      const slot2 = { maxOrders: 10, currentOrders: 8 };
      const emptySlot = { maxOrders: 10, currentOrders: 0 };
      const fullSlot = { maxOrders: 10, currentOrders: 10 };

      expect(calculateTimeSlotOccupancy(slot1)).toBe(50);
      expect(calculateTimeSlotOccupancy(slot2)).toBe(80);
      expect(calculateTimeSlotOccupancy(emptySlot)).toBe(0);
      expect(calculateTimeSlotOccupancy(fullSlot)).toBe(100);
    });
  });

  describe("Time slot database operations", () => {
    it("should find time slots for organization", async () => {
      const mockTimeSlots = [
        {
          id: "slot-1",
          startTime: new Date("2024-01-15T08:00:00Z"),
          endTime: new Date("2024-01-15T08:30:00Z"),
          maxOrders: 5,
          currentOrders: 2,
          bakeryId: "bakery-123",
          isActive: true,
        },
        {
          id: "slot-2",
          startTime: new Date("2024-01-15T08:30:00Z"),
          endTime: new Date("2024-01-15T09:00:00Z"),
          maxOrders: 5,
          currentOrders: 0,
          bakeryId: "bakery-123",
          isActive: true,
        },
      ];

      mockPrisma.timeSlot.findMany.mockResolvedValue(mockTimeSlots);

      const findTimeSlotsForBakery = async (bakeryId: string) => {
        return await mockPrisma.timeSlot.findMany({
          where: { bakeryId },
          orderBy: { startTime: "asc" },
        });
      };

      const result = await findTimeSlotsForBakery("bakery-123");

      expect(mockPrisma.timeSlot.findMany).toHaveBeenCalledWith({
        where: { bakeryId: "bakery-123" },
        orderBy: { startTime: "asc" },
      });

      expect(result).toEqual(mockTimeSlots);
      expect(result).toHaveLength(2);
    });

    it("should create multiple time slots", async () => {
      const timeSlotsData = [
        {
          startTime: new Date("2024-01-15T08:00:00Z"),
          endTime: new Date("2024-01-15T08:30:00Z"),
          maxOrders: 5,
          isActive: true,
          bakeryId: "bakery-123",
        },
        {
          startTime: new Date("2024-01-15T08:30:00Z"),
          endTime: new Date("2024-01-15T09:00:00Z"),
          maxOrders: 5,
          isActive: true,
          bakeryId: "bakery-123",
        },
      ];

      mockPrisma.timeSlot.createMany.mockResolvedValue({ count: 2 });

      const createTimeSlots = async (data: typeof timeSlotsData) => {
        return await mockPrisma.timeSlot.createMany({
          data,
          skipDuplicates: true,
        });
      };

      const result = await createTimeSlots(timeSlotsData);

      expect(mockPrisma.timeSlot.createMany).toHaveBeenCalledWith({
        data: timeSlotsData,
        skipDuplicates: true,
      });

      expect(result.count).toBe(2);
    });

    it("should update time slot occupancy", async () => {
      const mockUpdatedSlot = {
        id: "slot-1",
        currentOrders: 3,
        updatedAt: new Date(),
      };

      mockPrisma.timeSlot.update.mockResolvedValue(mockUpdatedSlot);

      const updateTimeSlotOccupancy = async (
        slotId: string,
        increment: number,
      ) => {
        return await mockPrisma.timeSlot.update({
          where: { id: slotId },
          data: {
            currentOrders: { increment },
            updatedAt: new Date(),
          },
        });
      };

      const result = await updateTimeSlotOccupancy("slot-1", 1);

      expect(mockPrisma.timeSlot.update).toHaveBeenCalledWith({
        where: { id: "slot-1" },
        data: {
          currentOrders: { increment: 1 },
          updatedAt: expect.any(Date),
        },
      });

      expect(result).toEqual(mockUpdatedSlot);
    });
  });

  describe("Time slot settings", () => {
    it("should retrieve bakery time slot settings", async () => {
      const mockSettings = {
        id: "settings-1",
        bakeryId: "bakery-123",
        storeOpenTime: "08:00",
        storeCloseTime: "18:00",
        timeSlotDuration: 30,
        maxOrdersPerSlot: 5,
        preOrderDaysAhead: 7,
      };

      mockPrisma.settings.findUnique.mockResolvedValue(mockSettings);

      const getTimeSlotSettings = async (bakeryId: string) => {
        return await mockPrisma.settings.findUnique({
          where: { bakeryId },
        });
      };

      const result = await getTimeSlotSettings("bakery-123");

      expect(mockPrisma.settings.findUnique).toHaveBeenCalledWith({
        where: { bakeryId: "bakery-123" },
      });

      expect(result).toEqual(mockSettings);
    });

    it("should update time slot settings", async () => {
      const updatedSettings = {
        timeSlotDuration: 15,
        maxOrdersPerSlot: 8,
        preOrderDaysAhead: 14,
      };

      const mockUpdatedSettings = {
        id: "settings-1",
        bakeryId: "bakery-123",
        ...updatedSettings,
        updatedAt: new Date(),
      };

      mockPrisma.settings.update.mockResolvedValue(mockUpdatedSettings);

      const updateTimeSlotSettings = async (
        bakeryId: string,
        data: typeof updatedSettings,
      ) => {
        return await mockPrisma.settings.update({
          where: { bakeryId },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      };

      const result = await updateTimeSlotSettings(
        "bakery-123",
        updatedSettings,
      );

      expect(mockPrisma.settings.update).toHaveBeenCalledWith({
        where: { bakeryId: "bakery-123" },
        data: {
          ...updatedSettings,
          updatedAt: expect.any(Date),
        },
      });

      expect(result).toEqual(mockUpdatedSettings);
    });
  });

  describe("Time slot filtering and sorting", () => {
    it("should filter available time slots", () => {
      const timeSlots = [
        { id: "1", maxOrders: 5, currentOrders: 2, isActive: true },
        { id: "2", maxOrders: 5, currentOrders: 5, isActive: true }, // Full
        { id: "3", maxOrders: 5, currentOrders: 1, isActive: false }, // Inactive
        { id: "4", maxOrders: 5, currentOrders: 3, isActive: true },
      ];

      const filterAvailableSlots = (slots: typeof timeSlots) => {
        return slots.filter(
          (slot) => slot.isActive && slot.currentOrders < slot.maxOrders,
        );
      };

      const availableSlots = filterAvailableSlots(timeSlots);

      expect(availableSlots).toHaveLength(2);
      expect(availableSlots.map((s) => s.id)).toEqual(["1", "4"]);
    });

    it("should sort time slots by occupancy rate", () => {
      const timeSlots = [
        { id: "1", maxOrders: 10, currentOrders: 8 }, // 80%
        { id: "2", maxOrders: 10, currentOrders: 2 }, // 20%
        { id: "3", maxOrders: 10, currentOrders: 5 }, // 50%
      ];

      const sortByOccupancy = (slots: typeof timeSlots) => {
        return slots.sort((a, b) => {
          const occupancyA = (a.currentOrders / a.maxOrders) * 100;
          const occupancyB = (b.currentOrders / b.maxOrders) * 100;
          return occupancyA - occupancyB;
        });
      };

      const sortedSlots = sortByOccupancy([...timeSlots]);

      expect(sortedSlots.map((s) => s.id)).toEqual(["2", "3", "1"]);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle invalid time ranges", () => {
      const params = {
        startDate: new Date("2024-01-15T00:00:00Z"),
        endDate: new Date("2024-01-15T00:00:00Z"),
        startTime: "10:00",
        endTime: "08:00", // End before start
        duration: 30,
        maxOrders: 5,
        daysOfWeek: [1],
        bakeryId: "bakery-123",
      };

      const slots = generateTimeSlots(params);

      expect(slots).toHaveLength(0);
    });

    it("should handle duration longer than time range", () => {
      const params = {
        startDate: new Date("2024-01-15T00:00:00Z"),
        endDate: new Date("2024-01-15T00:00:00Z"),
        startTime: "08:00",
        endTime: "08:30", // 30 minutes total
        duration: 60, // 60 minutes duration
        maxOrders: 5,
        daysOfWeek: [1],
        bakeryId: "bakery-123",
      };

      const slots = generateTimeSlots(params);

      expect(slots).toHaveLength(0);
    });

    it("should handle zero max orders", () => {
      const slot = { maxOrders: 0, currentOrders: 0 };

      expect(validateTimeSlotAvailability(slot)).toBe(false);
    });

    it("should handle database errors gracefully", async () => {
      mockPrisma.timeSlot.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      const findTimeSlotsForBakery = async (bakeryId: string) => {
        try {
          return await mockPrisma.timeSlot.findMany({
            where: { bakeryId },
          });
        } catch (error) {
          console.error("Error fetching time slots:", error);
          return [];
        }
      };

      const result = await findTimeSlotsForBakery("bakery-123");

      expect(result).toEqual([]);
    });
  });
});
