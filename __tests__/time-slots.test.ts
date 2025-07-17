import { describe, it, expect, vi } from "vitest";

// Types pour les créneaux horaires
interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  maxOrders: number;
  currentOrders: number;
  isActive: boolean;
}

// Utilitaires pour les créneaux horaires
export function isTimeSlotAvailable(slot: TimeSlot): boolean {
  return slot.isActive && slot.currentOrders < slot.maxOrders;
}

export function isTimeSlotInFuture(
  slot: TimeSlot,
  currentTime: Date = new Date(),
): boolean {
  return slot.startTime > currentTime;
}

export function formatTimeSlot(slot: TimeSlot): string {
  const startTime = slot.startTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = slot.endTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startTime} - ${endTime}`;
}

export function getRemainingCapacity(slot: TimeSlot): number {
  return Math.max(0, slot.maxOrders - slot.currentOrders);
}

export function getSlotCapacityPercentage(slot: TimeSlot): number {
  return (slot.currentOrders / slot.maxOrders) * 100;
}

export function canBookSlot(
  slot: TimeSlot,
  additionalOrders: number = 1,
): boolean {
  return (
    isTimeSlotAvailable(slot) &&
    isTimeSlotInFuture(slot) &&
    slot.currentOrders + additionalOrders <= slot.maxOrders
  );
}

export function generateTimeSlots(
  date: Date,
  startHour: number,
  endHour: number,
  intervalMinutes: number,
  maxOrdersPerSlot: number,
): Omit<TimeSlot, "id" | "currentOrders" | "isActive">[] {
  const slots: Omit<TimeSlot, "id" | "currentOrders" | "isActive">[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + intervalMinutes);

      // Ne pas créer de créneaux qui dépassent l'heure de fin
      if (endTime.getHours() > endHour) {
        break;
      }

      slots.push({
        startTime,
        endTime,
        maxOrders: maxOrdersPerSlot,
      });
    }
  }

  return slots;
}

export function filterAvailableSlots(slots: TimeSlot[]): TimeSlot[] {
  const now = new Date();
  return slots.filter(
    (slot) => isTimeSlotAvailable(slot) && isTimeSlotInFuture(slot, now),
  );
}

export function groupSlotsByDate(
  slots: TimeSlot[],
): Record<string, TimeSlot[]> {
  return slots.reduce(
    (groups, slot) => {
      const dateKey = slot.startTime.toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
      return groups;
    },
    {} as Record<string, TimeSlot[]>,
  );
}

export function getSlotDuration(slot: TimeSlot): number {
  return slot.endTime.getTime() - slot.startTime.getTime();
}

export function isSlotDurationValid(
  slot: TimeSlot,
  minDurationMinutes: number = 15,
): boolean {
  const durationMs = getSlotDuration(slot);
  const minDurationMs = minDurationMinutes * 60 * 1000;
  return durationMs >= minDurationMs;
}

// Tests
describe("Time Slot Utils", () => {
  const baseDate = new Date("2024-01-15T10:00:00");

  const sampleSlot: TimeSlot = {
    id: "slot-1",
    startTime: new Date("2024-01-15T10:00:00"),
    endTime: new Date("2024-01-15T10:15:00"),
    maxOrders: 10,
    currentOrders: 5,
    isActive: true,
  };

  describe("isTimeSlotAvailable", () => {
    it("should return true for available slot", () => {
      expect(isTimeSlotAvailable(sampleSlot)).toBe(true);
    });

    it("should return false for inactive slot", () => {
      const inactiveSlot = { ...sampleSlot, isActive: false };
      expect(isTimeSlotAvailable(inactiveSlot)).toBe(false);
    });

    it("should return false for full slot", () => {
      const fullSlot = { ...sampleSlot, currentOrders: 10 };
      expect(isTimeSlotAvailable(fullSlot)).toBe(false);
    });
  });

  describe("isTimeSlotInFuture", () => {
    it("should return true for future slot", () => {
      const futureSlot = {
        ...sampleSlot,
        startTime: new Date("2024-01-15T15:00:00"),
      };
      const currentTime = new Date("2024-01-15T10:00:00");

      expect(isTimeSlotInFuture(futureSlot, currentTime)).toBe(true);
    });

    it("should return false for past slot", () => {
      const pastSlot = {
        ...sampleSlot,
        startTime: new Date("2024-01-15T09:00:00"),
      };
      const currentTime = new Date("2024-01-15T10:00:00");

      expect(isTimeSlotInFuture(pastSlot, currentTime)).toBe(false);
    });
  });

  describe("formatTimeSlot", () => {
    it("should format time slot correctly", () => {
      const result = formatTimeSlot(sampleSlot);
      expect(result).toBe("10:00 - 10:15");
    });
  });

  describe("getRemainingCapacity", () => {
    it("should calculate remaining capacity correctly", () => {
      expect(getRemainingCapacity(sampleSlot)).toBe(5);
    });

    it("should return 0 for full slot", () => {
      const fullSlot = { ...sampleSlot, currentOrders: 10 };
      expect(getRemainingCapacity(fullSlot)).toBe(0);
    });

    it("should return 0 for overbooked slot", () => {
      const overbookedSlot = { ...sampleSlot, currentOrders: 15 };
      expect(getRemainingCapacity(overbookedSlot)).toBe(0);
    });
  });

  describe("getSlotCapacityPercentage", () => {
    it("should calculate capacity percentage correctly", () => {
      expect(getSlotCapacityPercentage(sampleSlot)).toBe(50);
    });

    it("should return 0 for empty slot", () => {
      const emptySlot = { ...sampleSlot, currentOrders: 0 };
      expect(getSlotCapacityPercentage(emptySlot)).toBe(0);
    });

    it("should return 100 for full slot", () => {
      const fullSlot = { ...sampleSlot, currentOrders: 10 };
      expect(getSlotCapacityPercentage(fullSlot)).toBe(100);
    });
  });

  describe("canBookSlot", () => {
    it("should return true for bookable slot", () => {
      const futureSlot = {
        ...sampleSlot,
        startTime: new Date("2024-01-15T15:00:00"),
        endTime: new Date("2024-01-15T15:15:00"),
      };

      expect(canBookSlot(futureSlot)).toBe(true);
    });

    it("should return false for full slot", () => {
      const fullSlot = {
        ...sampleSlot,
        currentOrders: 10,
        startTime: new Date("2024-01-15T15:00:00"),
        endTime: new Date("2024-01-15T15:15:00"),
      };

      expect(canBookSlot(fullSlot)).toBe(false);
    });

    it("should return false for past slot", () => {
      const pastSlot = {
        ...sampleSlot,
        startTime: new Date("2024-01-15T09:00:00"),
        endTime: new Date("2024-01-15T09:15:00"),
      };

      expect(canBookSlot(pastSlot)).toBe(false);
    });

    it("should check additional orders capacity", () => {
      const nearFullSlot = {
        ...sampleSlot,
        currentOrders: 8,
        startTime: new Date("2024-01-15T15:00:00"),
        endTime: new Date("2024-01-15T15:15:00"),
      };

      expect(canBookSlot(nearFullSlot, 1)).toBe(true);
      expect(canBookSlot(nearFullSlot, 2)).toBe(true);
      expect(canBookSlot(nearFullSlot, 3)).toBe(false);
    });
  });

  describe("generateTimeSlots", () => {
    it("should generate time slots correctly", () => {
      const date = new Date("2024-01-15");
      const slots = generateTimeSlots(date, 9, 11, 30, 10);

      expect(slots).toHaveLength(4);
      expect(slots[0].startTime.getHours()).toBe(9);
      expect(slots[0].startTime.getMinutes()).toBe(0);
      expect(slots[1].startTime.getHours()).toBe(9);
      expect(slots[1].startTime.getMinutes()).toBe(30);
      expect(slots[2].startTime.getHours()).toBe(10);
      expect(slots[2].startTime.getMinutes()).toBe(0);
      expect(slots[3].startTime.getHours()).toBe(10);
      expect(slots[3].startTime.getMinutes()).toBe(30);
    });

    it("should generate slots with correct duration", () => {
      const date = new Date("2024-01-15");
      const slots = generateTimeSlots(date, 9, 10, 15, 10);

      slots.forEach((slot) => {
        const duration = slot.endTime.getTime() - slot.startTime.getTime();
        expect(duration).toBe(15 * 60 * 1000); // 15 minutes in milliseconds
      });
    });
  });

  describe("filterAvailableSlots", () => {
    it("should filter only available and future slots", () => {
      const now = new Date("2024-01-15T10:00:00");
      const slots: TimeSlot[] = [
        {
          // Available and future
          ...sampleSlot,
          id: "slot-1",
          startTime: new Date("2024-01-15T15:00:00"),
          currentOrders: 5,
        },
        {
          // Past slot
          ...sampleSlot,
          id: "slot-2",
          startTime: new Date("2024-01-15T09:00:00"),
          currentOrders: 5,
        },
        {
          // Full slot
          ...sampleSlot,
          id: "slot-3",
          startTime: new Date("2024-01-15T16:00:00"),
          currentOrders: 10,
        },
        {
          // Inactive slot
          ...sampleSlot,
          id: "slot-4",
          startTime: new Date("2024-01-15T17:00:00"),
          isActive: false,
        },
      ];

      // Mock Date.now() to return our test time
      const originalNow = Date.now;
      Date.now = vi.fn(() => now.getTime());

      const availableSlots = filterAvailableSlots(slots);
      expect(availableSlots).toHaveLength(1);
      expect(availableSlots[0].id).toBe("slot-1");

      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe("groupSlotsByDate", () => {
    it("should group slots by date", () => {
      const slots: TimeSlot[] = [
        {
          ...sampleSlot,
          id: "slot-1",
          startTime: new Date("2024-01-15T10:00:00"),
        },
        {
          ...sampleSlot,
          id: "slot-2",
          startTime: new Date("2024-01-15T11:00:00"),
        },
        {
          ...sampleSlot,
          id: "slot-3",
          startTime: new Date("2024-01-16T10:00:00"),
        },
      ];

      const grouped = groupSlotsByDate(slots);

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped["2024-01-15"]).toHaveLength(2);
      expect(grouped["2024-01-16"]).toHaveLength(1);
    });
  });

  describe("getSlotDuration", () => {
    it("should calculate slot duration correctly", () => {
      const duration = getSlotDuration(sampleSlot);
      expect(duration).toBe(15 * 60 * 1000); // 15 minutes in milliseconds
    });
  });

  describe("isSlotDurationValid", () => {
    it("should return true for valid duration", () => {
      expect(isSlotDurationValid(sampleSlot, 15)).toBe(true);
    });

    it("should return false for invalid duration", () => {
      expect(isSlotDurationValid(sampleSlot, 30)).toBe(false);
    });

    it("should use default minimum duration", () => {
      expect(isSlotDurationValid(sampleSlot)).toBe(true);
    });
  });
});
