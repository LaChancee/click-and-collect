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
    console.log("Données reçues dans l'action:", parsedInput);

    // Supprimer allergenIds et orgId qui n'existent pas dans le modèle Prisma
    // Attention: on conserve imageUrl qui doit être sauvegardé en BDD
    const { allergenIds, orgId, image, ...articleData } = parsedInput;

    // Vérifier si orgId existe
    if (!orgId) {
      throw new Error("L'ID de l'organisation est requis");
    }

    // Générer un slug unique en ajoutant un timestamp
    const timestamp = Date.now();
    const baseSlug = parsedInput.name.toLowerCase().replace(/ /g, "-");
    const slug = `${baseSlug}-${timestamp}`;

    // S'assurer que l'URL de l'image est bien prise en compte
    const dataToSave = {
      ...articleData,
      bakeryId: orgId,
      slug: slug,
      // Explicitement inclure imageUrl s'il est présent
      ...(parsedInput.imageUrl ? { imageUrl: parsedInput.imageUrl } : {}),
    };

    console.log("Données à enregistrer en BDD:", dataToSave);

    const result = await prisma.article.create({
      data: dataToSave,
    });

    return serializeData(result);
  });

// Exportation de l'ancienne fonction pour compatibilité
export const createArticle = createArticleAction;
