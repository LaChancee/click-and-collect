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
    // Attention: on conserve imageUrl qui doit être sauvegardé en BDD
    const { allergenIds, orgId, image, ...articleData } = parsedInput;

    
    // Générer un slug unique en ajoutant un timestamp
    const timestamp = Date.now();
    const baseSlug = parsedInput.name.toLowerCase().replace(/ /g, "-");
    const slug = `${baseSlug}-${timestamp}`;

    // Préparer les données à enregistrer, en s'assurant que imageUrl est inclus
    const dataToSave = {
      ...articleData,
      bakeryId: orgId || "",
      slug: slug,
      imageUrl: parsedInput.imageUrl, // Assigner directement l'URL de l'image
    };

    const result = await prisma.article.create({
      data: dataToSave,
    });

    return serializeData(result);
  });

// Exportation de l'ancienne fonction pour compatibilité
export const createArticle = createArticleAction;
