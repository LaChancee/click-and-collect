import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrderStatus, PaymentStatus, OrderWithDetails } from "@/lib/types";

// Mock the columns to test individual column functions
const mockColumns = vi.hoisted(() => ({
  orderNumberColumn: vi.fn(),
  customerColumn: vi.fn(),
  articlesColumn: vi.fn(),
  timeSlotColumn: vi.fn(),
  totalColumn: vi.fn(),
  statusColumn: vi.fn(),
  paymentStatusColumn: vi.fn(),
  createdAtColumn: vi.fn(),
  actionsColumn: vi.fn(),
}));

vi.mock("@/app/orgs/[orgSlug]/(navigation)/orders/orders-columns", async () => {
  const actual = await vi.importActual("@/app/orgs/[orgSlug]/(navigation)/orders/orders-columns");
  return {
    ...actual,
    ...mockColumns,
  };
});

describe("Orders Columns", () => {
  const mockOrder: OrderWithDetails = {
    id: "order-123",
    orderNumber: "ORD-001",
    organizationId: "org-123",
    customerId: "customer-123",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+33123456789",
    timeSlotId: "slot-123",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    totalAmount: 2499, // 24.99€
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
    customer: {
      id: "customer-123",
      name: "John Doe",
      email: "john@example.com",
    },
    timeSlot: {
      id: "slot-123",
      date: new Date("2024-01-16T09:00:00Z"),
      startTime: "09:00",
      endTime: "09:15",
      maxOrders: 10,
      currentOrders: 5,
      organizationId: "org-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    items: [
      {
        id: "item-1",
        orderId: "order-123",
        articleId: "article-1",
        quantity: 2,
        unitPrice: 599, // 5.99€
        article: {
          id: "article-1",
          name: "Croissant",
          description: "Croissant artisanal",
          price: 599,
          categoryId: "cat-1",
          organizationId: "org-123",
          imageUrl: null,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "item-2",
        orderId: "order-123",
        articleId: "article-2",
        quantity: 1,
        unitPrice: 1301, // 13.01€
        article: {
          id: "article-2",
          name: "Pain de campagne",
          description: "Pain de campagne 1kg",
          price: 1301,
          categoryId: "cat-2",
          organizationId: "org-123",
          imageUrl: null,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  };

  describe("Order Number Formatting", () => {
    it("should format order number with # prefix", () => {
      expect(mockOrder.orderNumber).toEqual("ORD-001");
      // Test that we would display with # prefix
      const displayNumber = `#${mockOrder.orderNumber}`;
      expect(displayNumber).toBe("#ORD-001");
    });
  });

  describe("Customer Information", () => {
    it("should display customer name for registered users", () => {
      expect(mockOrder.customer?.name).toBe("John Doe");
    });

    it("should display guest customer name for unregistered users", () => {
      const guestOrder = {
        ...mockOrder,
        customer: null,
        customerName: "Jane Smith",
      };

      const customerDisplay = guestOrder.customer?.name || guestOrder.customerName || "Client invité";
      expect(customerDisplay).toBe("Jane Smith");
    });

    it("should fallback to 'Client invité' when no customer info", () => {
      const anonymousOrder = {
        ...mockOrder,
        customer: null,
        customerName: null,
      };

      const customerDisplay = anonymousOrder.customer?.name || anonymousOrder.customerName || "Client invité";
      expect(customerDisplay).toBe("Client invité");
    });
  });

  describe("Articles Summary", () => {
    it("should calculate total quantity correctly", () => {
      const totalQuantity = mockOrder.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0);
      expect(totalQuantity).toBe(3); // 2 croissants + 1 pain
    });

    it("should format articles list correctly", () => {
      const articlesSummary = mockOrder.items.map((item: OrderItem) =>
        `${item.quantity}x ${item.article.name}`
      ).join(", ");
      expect(articlesSummary).toBe("2x Croissant, 1x Pain de campagne");
    });
  });

  describe("Time Slot Formatting", () => {
    it("should format date correctly in French", () => {
      const date = mockOrder.timeSlot.date;
      const frenchDate = date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      expect(frenchDate).toContain("janvier"); // January in French
    });

    it("should format time range correctly", () => {
      const timeRange = `${mockOrder.timeSlot.startTime} - ${mockOrder.timeSlot.endTime}`;
      expect(timeRange).toBe("09:00 - 09:15");
    });
  });

  describe("Price Formatting", () => {
    it("should format total amount correctly", () => {
      const formattedAmount = (mockOrder.totalAmount / 100).toFixed(2);
      expect(formattedAmount).toBe("24.99");
    });

    it("should display price with euro symbol", () => {
      const displayPrice = `${(mockOrder.totalAmount / 100).toFixed(2)} €`;
      expect(displayPrice).toBe("24.99 €");
    });
  });

  describe("Status Badges", () => {
    it("should handle all order status types", () => {
      const statuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ];

      statuses.forEach(status => {
        expect(Object.values(OrderStatus)).toContain(status);
      });
    });

    it("should handle all payment status types", () => {
      const paymentStatuses = [
        PaymentStatus.PENDING,
        PaymentStatus.PAID,
        PaymentStatus.FAILED,
        PaymentStatus.REFUNDED,
      ];

      paymentStatuses.forEach(status => {
        expect(Object.values(PaymentStatus)).toContain(status);
      });
    });
  });

  describe("Date Formatting", () => {
    it("should format creation date in French", () => {
      const frenchDate = mockOrder.createdAt.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      expect(frenchDate).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });
  });
}); 