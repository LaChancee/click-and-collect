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

// Schéma pour les actions par lot
const BatchActionSchema = z.object({
  articleIds: z.array(z.string()).min(1, "Sélectionnez au moins un article"),
  action: z.enum([
    "delete",
    "activate",
    "deactivate",
    "makeAvailable",
    "makeUnavailable",
  ]),
});

export const batchArticleAction = action
  .schema(BatchActionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { articleIds, action } = parsedInput;

    // Vérifier que les articles existent
    const articlesCount = await prisma.article.count({
      where: { id: { in: articleIds } },
    });

    if (articlesCount !== articleIds.length) {
      throw new Error("Certains articles n'ont pas été trouvés");
    }

    let result;

    // Exécuter l'action appropriée
    switch (action) {
      case "delete":
        result = await prisma.article.deleteMany({
          where: { id: { in: articleIds } },
        });
        return {
          success: true,
          message: `${result.count} article(s) supprimé(s)`,
        };

      case "activate":
        result = await prisma.article.updateMany({
          where: { id: { in: articleIds } },
          data: { isActive: true },
        });
        return {
          success: true,
          message: `${result.count} article(s) activé(s)`,
        };

      case "deactivate":
        result = await prisma.article.updateMany({
          where: { id: { in: articleIds } },
          data: { isActive: false },
        });
        return {
          success: true,
          message: `${result.count} article(s) désactivé(s)`,
        };

      case "makeAvailable":
        result = await prisma.article.updateMany({
          where: { id: { in: articleIds } },
          data: { isAvailable: true },
        });
        return {
          success: true,
          message: `${result.count} article(s) disponible(s)`,
        };

      case "makeUnavailable":
        result = await prisma.article.updateMany({
          where: { id: { in: articleIds } },
          data: { isAvailable: false },
        });
        return {
          success: true,
          message: `${result.count} article(s) indisponible(s)`,
        };

      default:
        throw new Error("Action non valide");
    }
  });
