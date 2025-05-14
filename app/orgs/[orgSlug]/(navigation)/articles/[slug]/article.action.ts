"use server";


import { prisma } from "@/lib/prisma";
;
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { action } from "@/lib/actions/safe-actions";

const updateArticleSchema = z.object({
  id: z.string().min(1, "L'ID du produit est requis"),
  name: z.string().min(1, "Le nom du produit est requis"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  stockCount: z
    .union([
      z.coerce.number().int().min(0, "Le stock doit être un nombre positif"),
      z.literal("").transform(() => null),
      z.null(),
    ])
    .optional()
    .nullable(),
  position: z.coerce.number().int().min(0).optional(),
  allergenIds: z.array(z.string()).default([]),
  imageUrl: z
    .string()
    .url("L'URL de l'image est invalide")
    .optional()
    .nullable(),
  orgId: z.string().optional(),
});

export const updateArticleAction = action
  .schema(updateArticleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, allergenIds, orgId, ...articleData } = parsedInput;

    // 1. Mettre à jour les informations de base de l'article
    const article = await prisma.article.update({
      where: { id },
      data: articleData,
    });

    // 2. Gérer les allergènes (supprimer les associations existantes puis créer les nouvelles)
    if (allergenIds && allergenIds.length > 0) {
      // Supprimer toutes les associations d'allergènes existantes
      await prisma.productAllergen.deleteMany({
        where: { articleId: id },
      });

      // Créer les nouvelles associations
      const allergenConnections = allergenIds.map((allergenId) => ({
        articleId: id,
        allergenId,
      }));

      await prisma.productAllergen.createMany({
        data: allergenConnections,
      });
    } else {
      // Si aucun allergène sélectionné, supprimer toutes les associations
      await prisma.productAllergen.deleteMany({
        where: { articleId: id },
      });
    }

    // Récupérer l'article mis à jour avec ses allergènes
    const updatedArticle = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });

    // Revalider le chemin pour que les changements apparaissent immédiatement
    revalidatePath(`/orgs/${orgId}/articles`);

    return updatedArticle;
  });
