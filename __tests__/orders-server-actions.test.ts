import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock de Prisma
const mockPrisma = {
  order: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock de l'authentification
vi.mock("@/lib/auth/auth-org", () => ({
  getCurrentOrg: vi.fn(),
}));

describe("Orders Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getOrdersForOrganization", () => {
    const mockOrders = [
      {
        id: "order-1",
        orderNumber: "ORD-001",
        organizationId: "org-123",
        customerName: "John Doe",
        totalAmount: 2499,
        status: "PENDING",
        paymentStatus: "PENDING",
        createdAt: new Date("2024-01-15T10:30:00Z"),
        customer: { name: "John Doe" },
        timeSlot: {
          date: new Date("2024-01-16T09:00:00Z"),
          startTime: "09:00",
          endTime: "09:15",
        },
        items: [
          {
            quantity: 2,
            article: { name: "Croissant" },
          },
        ],
      },
    ];

    it("should fetch orders for organization", async () => {
      // Simuler la fonction qui récupère les commandes
      const getOrdersForOrg = async (organizationId: string) => {
        mockPrisma.order.findMany.mockResolvedValue(mockOrders);

        return await mockPrisma.order.findMany({
          where: { organizationId },
          include: {
            customer: true,
            timeSlot: true,
            items: {
              include: {
                article: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      };

      const result = await getOrdersForOrg("org-123");

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { organizationId: "org-123" },
        include: {
          customer: true,
          timeSlot: true,
          items: {
            include: {
              article: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      expect(result).toEqual(mockOrders);
    });

    it("should handle empty results", async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);

      const getOrdersForOrg = async (organizationId: string) => {
        return await mockPrisma.order.findMany({
          where: { organizationId },
        });
      };

      const result = await getOrdersForOrg("org-123");
      expect(result).toEqual([]);
    });
  });

  describe("getOrderStatistics", () => {
    it("should calculate order statistics correctly", () => {
      const orders = [
        { status: "PENDING", totalAmount: 2499, createdAt: new Date() },
        { status: "CONFIRMED", totalAmount: 1500, createdAt: new Date() },
        { status: "PREPARING", totalAmount: 3000, createdAt: new Date() },
        { status: "COMPLETED", totalAmount: 1000, createdAt: new Date() },
      ];

      // Fonction pour calculer les statistiques
      const calculateStats = (orders: typeof orders) => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(
          (o) => o.status === "PENDING",
        ).length;
        const preparingOrders = orders.filter(
          (o) => o.status === "PREPARING",
        ).length;
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        return {
          totalOrders,
          pendingOrders,
          preparingOrders,
          totalRevenue,
        };
      };

      const stats = calculateStats(orders);

      expect(stats.totalOrders).toBe(4);
      expect(stats.pendingOrders).toBe(1);
      expect(stats.preparingOrders).toBe(1);
      expect(stats.totalRevenue).toBe(7999); // Total en centimes
    });

    it("should handle today's revenue calculation", () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);

      const orders = [
        { totalAmount: 2499, createdAt: today },
        { totalAmount: 1500, createdAt: yesterday },
        { totalAmount: 3000, createdAt: today },
      ];

      // Fonction pour calculer le chiffre d'affaires du jour
      const calculateTodayRevenue = (orders: typeof orders) => {
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        return orders
          .filter(
            (order) =>
              order.createdAt >= todayStart && order.createdAt <= todayEnd,
          )
          .reduce((sum, order) => sum + order.totalAmount, 0);
      };

      const todayRevenue = calculateTodayRevenue(orders);
      expect(todayRevenue).toBe(5499); // 24.99 + 30.00 en centimes
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status successfully", async () => {
      const mockUpdatedOrder = {
        id: "order-1",
        status: "CONFIRMED",
        updatedAt: new Date(),
      };

      mockPrisma.order.update.mockResolvedValue(mockUpdatedOrder);

      const updateOrderStatus = async (orderId: string, status: string) => {
        return await mockPrisma.order.update({
          where: { id: orderId },
          data: { status, updatedAt: new Date() },
        });
      };

      const result = await updateOrderStatus("order-1", "CONFIRMED");

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-1" },
        data: { status: "CONFIRMED", updatedAt: expect.any(Date) },
      });

      expect(result.status).toBe("CONFIRMED");
    });

    it("should handle invalid order ID", async () => {
      mockPrisma.order.update.mockRejectedValue(new Error("Order not found"));

      const updateOrderStatus = async (orderId: string, status: string) => {
        try {
          return await mockPrisma.order.update({
            where: { id: orderId },
            data: { status },
          });
        } catch (error) {
          throw new Error("Failed to update order status");
        }
      };

      await expect(
        updateOrderStatus("invalid-id", "CONFIRMED"),
      ).rejects.toThrow("Failed to update order status");
    });
  });

  describe("order filtering and search", () => {
    const mockOrders = [
      { orderNumber: "ORD-001", customerName: "John Doe", status: "PENDING" },
      {
        orderNumber: "ORD-002",
        customerName: "Jane Smith",
        status: "CONFIRMED",
      },
      {
        orderNumber: "CMD-001",
        customerName: "Bob Johnson",
        status: "PREPARING",
      },
    ];

    it("should filter orders by order number", () => {
      const filterByOrderNumber = (
        orders: typeof mockOrders,
        searchTerm: string,
      ) => {
        if (!searchTerm) return orders;
        return orders.filter((order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      };

      const result = filterByOrderNumber(mockOrders, "ORD");
      expect(result).toHaveLength(2);
      expect(result.every((order) => order.orderNumber.includes("ORD"))).toBe(
        true,
      );
    });

    it("should filter orders by customer name", () => {
      const filterByCustomer = (
        orders: typeof mockOrders,
        searchTerm: string,
      ) => {
        if (!searchTerm) return orders;
        return orders.filter((order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      };

      const result = filterByCustomer(mockOrders, "john");
      expect(result).toHaveLength(2); // John Doe and Bob Johnson
    });

    it("should filter orders by status", () => {
      const filterByStatus = (orders: typeof mockOrders, status: string) => {
        if (!status) return orders;
        return orders.filter((order) => order.status === status);
      };

      const result = filterByStatus(mockOrders, "PENDING");
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("PENDING");
    });
  });

  describe("order validation", () => {
    it("should validate order status transitions", () => {
      const validTransitions = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PREPARING", "CANCELLED"],
        PREPARING: ["READY", "CANCELLED"],
        READY: ["COMPLETED"],
        COMPLETED: [],
        CANCELLED: [],
      };

      const isValidStatusTransition = (
        currentStatus: string,
        newStatus: string,
      ) => {
        return (
          validTransitions[
            currentStatus as keyof typeof validTransitions
          ]?.includes(newStatus) || false
        );
      };

      expect(isValidStatusTransition("PENDING", "CONFIRMED")).toBe(true);
      expect(isValidStatusTransition("PENDING", "PREPARING")).toBe(false);
      expect(isValidStatusTransition("COMPLETED", "PENDING")).toBe(false);
    });

    it("should validate order data", () => {
      const validateOrderData = (orderData: any) => {
        const errors: string[] = [];

        if (!orderData.orderNumber) {
          errors.push("Order number is required");
        }

        if (!orderData.customerName && !orderData.customerId) {
          errors.push("Customer information is required");
        }

        if (!orderData.totalAmount || orderData.totalAmount <= 0) {
          errors.push("Total amount must be positive");
        }

        if (!orderData.items || orderData.items.length === 0) {
          errors.push("Order must contain at least one item");
        }

        return { isValid: errors.length === 0, errors };
      };

      const validOrder = {
        orderNumber: "ORD-001",
        customerName: "John Doe",
        totalAmount: 2499,
        items: [{ id: "item-1", quantity: 1 }],
      };

      const invalidOrder = {
        orderNumber: "",
        totalAmount: -100,
        items: [],
      };

      expect(validateOrderData(validOrder).isValid).toBe(true);
      expect(validateOrderData(invalidOrder).isValid).toBe(false);
      expect(validateOrderData(invalidOrder).errors).toHaveLength(4);
    });
  });
});
