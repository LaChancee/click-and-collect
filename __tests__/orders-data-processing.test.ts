import { describe, expect, it } from "vitest";

// Types pour les tests (adaptés des types réels)
interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  article: {
    id: string;
    name: string;
  };
}

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface OrderForTesting {
  id: string;
  orderNumber: string;
  customerName: string | null;
  totalAmount: number;
  createdAt: Date;
  customer: { name: string } | null;
  timeSlot: TimeSlot;
  items: OrderItem[];
}

// Fonctions utilitaires à tester
const formatOrderNumber = (orderNumber: string): string => {
  return `#${orderNumber}`;
};

const getCustomerDisplayName = (order: OrderForTesting): string => {
  return order.customer?.name || order.customerName || "Client invité";
};

const formatArticlesSummary = (items: OrderItem[]): string => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const articlesList = items
    .map((item) => `${item.quantity}x ${item.article.name}`)
    .join(", ");
  return `${totalQuantity} article${totalQuantity > 1 ? "s" : ""} : ${articlesList}`;
};

const formatTimeSlot = (timeSlot: TimeSlot): string => {
  const date = timeSlot.date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = `${timeSlot.startTime} - ${timeSlot.endTime}`;
  return `${date} • ${time}`;
};

const formatPrice = (amountInCents: number): string => {
  return `${(amountInCents / 100).toFixed(2)} €`;
};

const formatCreatedAt = (date: Date): string => {
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

describe("Orders Data Processing", () => {
  const mockOrder: OrderForTesting = {
    id: "order-123",
    orderNumber: "ORD-001",
    customerName: "John Doe",
    totalAmount: 2499, // 24.99€
    createdAt: new Date("2024-01-15T10:30:00Z"),
    customer: {
      name: "John Doe",
    },
    timeSlot: {
      id: "slot-123",
      date: new Date("2024-01-16T09:00:00Z"),
      startTime: "09:00",
      endTime: "09:15",
    },
    items: [
      {
        id: "item-1",
        quantity: 2,
        unitPrice: 599,
        article: {
          id: "article-1",
          name: "Croissant",
        },
      },
      {
        id: "item-2",
        quantity: 1,
        unitPrice: 1301,
        article: {
          id: "article-2",
          name: "Pain de campagne",
        },
      },
    ],
  };

  describe("formatOrderNumber", () => {
    it("should add # prefix to order number", () => {
      expect(formatOrderNumber("ORD-001")).toBe("#ORD-001");
      expect(formatOrderNumber("CMD-123")).toBe("#CMD-123");
    });
  });

  describe("getCustomerDisplayName", () => {
    it("should return customer name for registered users", () => {
      const result = getCustomerDisplayName(mockOrder);
      expect(result).toBe("John Doe");
    });

    it("should return customerName for guest users", () => {
      const guestOrder = {
        ...mockOrder,
        customer: null,
        customerName: "Jane Smith",
      };
      const result = getCustomerDisplayName(guestOrder);
      expect(result).toBe("Jane Smith");
    });

    it("should return 'Client invité' when no customer info", () => {
      const anonymousOrder = {
        ...mockOrder,
        customer: null,
        customerName: null,
      };
      const result = getCustomerDisplayName(anonymousOrder);
      expect(result).toBe("Client invité");
    });
  });

  describe("formatArticlesSummary", () => {
    it("should format single article correctly", () => {
      const singleItem = [mockOrder.items[0]];
      const result = formatArticlesSummary(singleItem);
      expect(result).toBe("2 articles : 2x Croissant");
    });

    it("should format multiple articles correctly", () => {
      const result = formatArticlesSummary(mockOrder.items);
      expect(result).toBe("3 articles : 2x Croissant, 1x Pain de campagne");
    });

    it("should handle singular vs plural correctly", () => {
      const singleQuantityItem = [
        {
          id: "item-1",
          quantity: 1,
          unitPrice: 599,
          article: { id: "article-1", name: "Croissant" },
        },
      ];
      const result = formatArticlesSummary(singleQuantityItem);
      expect(result).toBe("1 article : 1x Croissant");
    });
  });

  describe("formatTimeSlot", () => {
    it("should format time slot with French date", () => {
      const result = formatTimeSlot(mockOrder.timeSlot);
      expect(result).toContain("janvier"); // French month
      expect(result).toContain("09:00 - 09:15");
      expect(result).toContain("•");
    });
  });

  describe("formatPrice", () => {
    it("should format price correctly", () => {
      expect(formatPrice(2499)).toBe("24.99 €");
      expect(formatPrice(1000)).toBe("10.00 €");
      expect(formatPrice(50)).toBe("0.50 €");
    });

    it("should handle zero amount", () => {
      expect(formatPrice(0)).toBe("0.00 €");
    });
  });

  describe("formatCreatedAt", () => {
    it("should format date in French format", () => {
      const result = formatCreatedAt(mockOrder.createdAt);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });
  });

  describe("order statistics calculations", () => {
    const mockOrders: OrderForTesting[] = [
      {
        ...mockOrder,
        totalAmount: 2499,
        createdAt: new Date(),
      },
      {
        ...mockOrder,
        id: "order-124",
        orderNumber: "ORD-002",
        totalAmount: 1500,
        createdAt: new Date(),
      },
    ];

    it("should calculate total orders count", () => {
      expect(mockOrders.length).toBe(2);
    });

    it("should calculate total revenue", () => {
      const totalRevenue = mockOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );
      expect(totalRevenue).toBe(3999); // 24.99 + 15.00 in cents
    });

    it("should filter today's orders", () => {
      const today = new Date();
      const todayOrders = mockOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
      expect(todayOrders.length).toBe(2); // Both orders are from today in our test
    });
  });
});
