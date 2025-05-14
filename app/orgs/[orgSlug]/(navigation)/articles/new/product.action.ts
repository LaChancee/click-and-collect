"use server";
import { action } from "@/lib/actions/safe-actions";

import { prisma } from "@/lib/prisma";
import { ArticleSchemaForm } from "./product.schema";

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

export const createArticleAction = action
  .schema(ArticleSchemaForm)
  .action(async ({ parsedInput, ctx }) => {
    // Supprimer allergenIds et orgId qui n'existent pas dans le modèle Prisma
    const { allergenIds, orgId, ...articleData } = parsedInput;

    // Vérifier si orgId existe
    if (!orgId) {
      throw new Error("L'ID de l'organisation est requis");
    }

    // Générer un slug unique en ajoutant un timestamp
    const timestamp = Date.now();
    const baseSlug = parsedInput.name.toLowerCase().replace(/ /g, "-");
    const slug = `${baseSlug}-${timestamp}`;

    const result = await prisma.article.create({
      data: {
        ...articleData,
        bakeryId: orgId, // Maintenant orgId ne peut pas être undefined
        slug: slug,
      },
    });
    return serializeData(result);
  });

// Exportation de l'ancienne fonction pour compatibilité
export const createArticle = createArticleAction;
