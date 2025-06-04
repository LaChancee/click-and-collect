"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { action } from "@/lib/actions/safe-actions";
import { redirect } from "next/navigation";

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

const UpdateArticleSchema = z.object({
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

const DeleteArticleSchema = z.object({
  id: z.string().min(1, "L'ID du produit est requis"),
  orgSlug: z.string().min(1, "Le slug de l'organisation est requis"),
});

export type UpdateArticleSchemaType = z.infer<typeof UpdateArticleSchema>;
export type DeleteArticleSchemaType = z.infer<typeof DeleteArticleSchema>;

export const updateArticleAction = action
  .schema(UpdateArticleSchema)
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

    // Sérialiser les données avant de les retourner
    return serializeData(updatedArticle);
  });

export const deleteArticleAction = action
  .schema(DeleteArticleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, orgSlug } = parsedInput;

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!article) {
      throw new Error("Article non trouvé");
    }

    // Supprimer d'abord les associations d'allergènes
    await prisma.productAllergen.deleteMany({
      where: { articleId: id },
    });

    // Supprimer l'article
    await prisma.article.delete({
      where: { id },
    });

    // Revalider les chemins
    revalidatePath(`/orgs/${orgSlug}/articles`);

    // Rediriger vers la liste des articles
    redirect(`/orgs/${orgSlug}/articles`);
  });
