import { describe, it, expect } from "vitest";

// Utilitaires pour les articles
export function validateArticleName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}

export function validatePrice(price: number): boolean {
  return price > 0 && price <= 999.99;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function generateArticleSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateArticleData(data: {
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  bakeryId: string;
  stockCount?: number;
}) {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Le nom de l'article est requis");
  }

  if (!validateArticleName(data.name)) {
    errors.push("Le nom doit contenir entre 2 et 100 caractères");
  }

  if (!data.price || data.price <= 0) {
    errors.push("Le prix doit être supérieur à 0");
  }

  if (!validatePrice(data.price)) {
    errors.push("Le prix doit être compris entre 0,01€ et 999,99€");
  }

  if (!data.categoryId) {
    errors.push("La catégorie est requise");
  }

  if (!data.bakeryId) {
    errors.push("L'ID de la boulangerie est requis");
  }

  if (data.description && data.description.length > 1000) {
    errors.push("La description ne peut pas dépasser 1000 caractères");
  }

  if (data.stockCount !== undefined && data.stockCount < 0) {
    errors.push("Le stock ne peut pas être négatif");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateDiscountedPrice(
  price: number,
  discountPercentage: number,
): number {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error("Le pourcentage de réduction doit être entre 0 et 100");
  }

  return price * (1 - discountPercentage / 100);
}

export function isArticleAvailable(article: {
  isActive: boolean;
  isAvailable: boolean;
  stockCount?: number;
}): boolean {
  if (!article.isActive || !article.isAvailable) {
    return false;
  }

  if (article.stockCount !== undefined && article.stockCount <= 0) {
    return false;
  }

  return true;
}

// Tests
describe("Article Utils", () => {
  describe("validateArticleName", () => {
    it("should return true for valid names", () => {
      expect(validateArticleName("Croissant")).toBe(true);
      expect(validateArticleName("Pain de campagne")).toBe(true);
      expect(validateArticleName("Éclair au chocolat")).toBe(true);
    });

    it("should return false for invalid names", () => {
      expect(validateArticleName("")).toBe(false);
      expect(validateArticleName("A")).toBe(false);
      expect(validateArticleName("A".repeat(101))).toBe(false);
    });
  });

  describe("validatePrice", () => {
    it("should return true for valid prices", () => {
      expect(validatePrice(1.5)).toBe(true);
      expect(validatePrice(0.5)).toBe(true);
      expect(validatePrice(999.99)).toBe(true);
    });

    it("should return false for invalid prices", () => {
      expect(validatePrice(0)).toBe(false);
      expect(validatePrice(-1)).toBe(false);
      expect(validatePrice(1000)).toBe(false);
    });
  });

  describe("formatPrice", () => {
    it("should format prices correctly", () => {
      expect(formatPrice(1.5)).toBe("1,50 €");
      expect(formatPrice(10)).toBe("10,00 €");
      expect(formatPrice(0.95)).toBe("0,95 €");
    });
  });

  describe("generateArticleSlug", () => {
    it("should generate valid slugs", () => {
      expect(generateArticleSlug("Croissant")).toBe("croissant");
      expect(generateArticleSlug("Pain de campagne")).toBe("pain-de-campagne");
      expect(generateArticleSlug("Éclair au chocolat")).toBe(
        "eclair-au-chocolat",
      );
    });

    it("should handle special characters", () => {
      expect(generateArticleSlug("Café & Thé")).toBe("cafe-the");
      expect(generateArticleSlug("Tarte aux pommes")).toBe("tarte-aux-pommes");
      expect(generateArticleSlug("Religieuse café")).toBe("religieuse-cafe");
    });
  });

  describe("validateArticleData", () => {
    it("should validate correct article data", () => {
      const validData = {
        name: "Croissant",
        price: 1.5,
        description: "Croissant au beurre artisanal",
        categoryId: "cat-123",
        bakeryId: "bakery-123",
        stockCount: 50,
      };

      const result = validateArticleData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should detect missing required fields", () => {
      const invalidData = {
        name: "",
        price: 0,
        categoryId: "",
        bakeryId: "",
      };

      const result = validateArticleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Le nom de l'article est requis");
      expect(result.errors).toContain("Le prix doit être supérieur à 0");
      expect(result.errors).toContain("La catégorie est requise");
      expect(result.errors).toContain("L'ID de la boulangerie est requis");
    });

    it("should detect invalid price", () => {
      const invalidData = {
        name: "Croissant",
        price: -1,
        categoryId: "cat-123",
        bakeryId: "bakery-123",
      };

      const result = validateArticleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Le prix doit être supérieur à 0");
    });

    it("should detect negative stock", () => {
      const invalidData = {
        name: "Croissant",
        price: 1.5,
        categoryId: "cat-123",
        bakeryId: "bakery-123",
        stockCount: -5,
      };

      const result = validateArticleData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Le stock ne peut pas être négatif");
    });
  });

  describe("calculateDiscountedPrice", () => {
    it("should calculate discounted price correctly", () => {
      expect(calculateDiscountedPrice(10, 20)).toBe(8);
      expect(calculateDiscountedPrice(5, 10)).toBe(4.5);
      expect(calculateDiscountedPrice(100, 50)).toBe(50);
    });

    it("should throw error for invalid discount percentage", () => {
      expect(() => calculateDiscountedPrice(10, -5)).toThrow(
        "Le pourcentage de réduction doit être entre 0 et 100",
      );
      expect(() => calculateDiscountedPrice(10, 101)).toThrow(
        "Le pourcentage de réduction doit être entre 0 et 100",
      );
    });
  });

  describe("isArticleAvailable", () => {
    it("should return true for available article", () => {
      const article = {
        isActive: true,
        isAvailable: true,
        stockCount: 10,
      };

      expect(isArticleAvailable(article)).toBe(true);
    });

    it("should return false for inactive article", () => {
      const article = {
        isActive: false,
        isAvailable: true,
        stockCount: 10,
      };

      expect(isArticleAvailable(article)).toBe(false);
    });

    it("should return false for unavailable article", () => {
      const article = {
        isActive: true,
        isAvailable: false,
        stockCount: 10,
      };

      expect(isArticleAvailable(article)).toBe(false);
    });

    it("should return false for out of stock article", () => {
      const article = {
        isActive: true,
        isAvailable: true,
        stockCount: 0,
      };

      expect(isArticleAvailable(article)).toBe(false);
    });

    it("should return true for article without stock count", () => {
      const article = {
        isActive: true,
        isAvailable: true,
      };

      expect(isArticleAvailable(article)).toBe(true);
    });
  });
});
