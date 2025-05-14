"use server";
import { action } from "@/lib/actions/safe-actions";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

// Schéma pour la mise à jour du stock
const UpdateStockSchema = z.object({
  articleId: z.string().min(1, "L'ID de l'article est requis"),
  stockCount: z.number().nullable(),
});

export const updateStockAction = action
  .schema(UpdateStockSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { articleId, stockCount } = parsedInput;

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error("Article non trouvé");
    }

    // Mettre à jour le stock
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { stockCount },
    });

    return serializeData(updatedArticle);
  });
