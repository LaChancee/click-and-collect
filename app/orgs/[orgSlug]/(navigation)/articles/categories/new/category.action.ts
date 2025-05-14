"use server";
import { action } from "@/lib/actions/safe-actions";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Déplacer la définition du schéma dans un fichier séparé (nous allons le créer)
// et importer le schéma ici
import { CategorySchemaForm } from "./category.schema";

// Fonction pour sérialiser les objets avec Decimal
function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "object" &&
      value !== null &&
      typeof value.toJSON === "function"
        ? value.toJSON()
        : value,
    ),
  );
}

export const getCategoriesAction = action
  .schema(z.object({ bakeryId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const { bakeryId } = parsedInput;
    const categories = await prisma.category.findMany({
      where: { bakeryId },
    });
    return serializeData(categories);
  });

export const seedBakeryCategoriesAction = action
  .schema(z.object({ bakeryId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const { bakeryId } = parsedInput;

    // Vérifier si des catégories existent déjà pour cette boulangerie
    const existingCategories = await prisma.category.findMany({
      where: { bakeryId },
    });

    if (existingCategories.length > 0) {
      return serializeData(existingCategories); // Éviter les doublons
    }

    // Catégories standards pour une boulangerie
    const defaultCategories = [
      { name: "Pains", slug: "pains", position: 0, isActive: true },
      {
        name: "Viennoiseries",
        slug: "viennoiseries",
        position: 1,
        isActive: true,
      },
      { name: "Pâtisseries", slug: "patisseries", position: 2, isActive: true },
      { name: "Sandwichs", slug: "sandwichs", position: 3, isActive: true },
      { name: "Boissons", slug: "boissons", position: 4, isActive: true },
    ];

    // Créer toutes les catégories en une seule opération
    const createdCategories = await prisma.$transaction(
      defaultCategories.map((category) =>
        prisma.category.create({
          data: {
            ...category,
            bakeryId,
          },
        }),
      ),
    );

    return serializeData(createdCategories);
  });

// Pour la compatibilité avec l'ancienne implémentation
export const seedBakeryCategories = async (bakeryId: string) => {
  return seedBakeryCategoriesAction({ bakeryId });
};

export async function createCategoryAction(
  data: z.infer<typeof CategorySchemaForm>,
) {
  // Utiliser l'action de manière fonctionnelle
  return action
    .schema(CategorySchemaForm)
    .action(async ({ parsedInput, ctx }) => {
      const { orgId, ...categoryData } = parsedInput;

      // Créer la catégorie avec un slug basé sur le nom
      const result = await prisma.category.create({
        data: {
          ...categoryData,
          bakeryId: orgId,
          slug: parsedInput.name.toLowerCase().replace(/ /g, "-"),
        },
      });
      return serializeData(result);
    })(data); // Appliquer l'action avec les données immédiatement
}

// Pour la compatibilité avec l'ancienne implémentation
export const createCategory = createCategoryAction;
