import { describe, it, expect } from "vitest";

// Utilitaires pour les catégories
export function validateCategoryName(name: string): boolean {
  return name.length >= 2 && name.length <= 50;
}

export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateCategoryData(data: {
  name: string;
  description?: string;
  bakeryId: string;
}) {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Le nom de la catégorie est requis");
  }

  if (!validateCategoryName(data.name)) {
    errors.push("Le nom doit contenir entre 2 et 50 caractères");
  }

  if (!data.bakeryId) {
    errors.push("L'ID de la boulangerie est requis");
  }

  if (data.description && data.description.length > 500) {
    errors.push("La description ne peut pas dépasser 500 caractères");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Tests
describe("Category Utils", () => {
  describe("validateCategoryName", () => {
    it("should return true for valid names", () => {
      expect(validateCategoryName("Pains")).toBe(true);
      expect(validateCategoryName("Viennoiseries")).toBe(true);
      expect(validateCategoryName("Pâtisseries")).toBe(true);
    });

    it("should return false for invalid names", () => {
      expect(validateCategoryName("")).toBe(false);
      expect(validateCategoryName("A")).toBe(false);
      expect(validateCategoryName("A".repeat(51))).toBe(false);
    });
  });

  describe("generateCategorySlug", () => {
    it("should generate valid slugs", () => {
      expect(generateCategorySlug("Pains")).toBe("pains");
      expect(generateCategorySlug("Viennoiseries")).toBe("viennoiseries");
      expect(generateCategorySlug("Pâtisseries")).toBe("patisseries");
      expect(generateCategorySlug("Pains spéciaux")).toBe("pains-speciaux");
    });

    it("should handle special characters", () => {
      expect(generateCategorySlug("Pain & Viennoiserie")).toBe(
        "pain-viennoiserie",
      );
      expect(generateCategorySlug("Café/Thé")).toBe("cafe-the");
      expect(generateCategorySlug("Éclairs & Choux")).toBe("eclairs-choux");
    });

    it("should handle edge cases", () => {
      expect(generateCategorySlug("   ")).toBe("");
      expect(generateCategorySlug("---")).toBe("");
      expect(generateCategorySlug("A-B-C")).toBe("a-b-c");
    });
  });

  describe("validateCategoryData", () => {
    it("should validate correct category data", () => {
      const validData = {
        name: "Pains",
        description: "Nos pains artisanaux",
        bakeryId: "bakery-123",
      };

      const result = validateCategoryData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should detect missing required fields", () => {
      const invalidData = {
        name: "",
        bakeryId: "",
      };

      const result = validateCategoryData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Le nom de la catégorie est requis");
      expect(result.errors).toContain("L'ID de la boulangerie est requis");
    });

    it("should detect invalid name length", () => {
      const invalidData = {
        name: "A",
        bakeryId: "bakery-123",
      };

      const result = validateCategoryData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Le nom doit contenir entre 2 et 50 caractères",
      );
    });

    it("should detect too long description", () => {
      const invalidData = {
        name: "Pains",
        description: "A".repeat(501),
        bakeryId: "bakery-123",
      };

      const result = validateCategoryData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "La description ne peut pas dépasser 500 caractères",
      );
    });
  });
});
