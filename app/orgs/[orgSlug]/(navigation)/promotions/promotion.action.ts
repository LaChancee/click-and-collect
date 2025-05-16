"use server";
import { action } from "@/lib/actions/safe-actions";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { PromotionSchemaForm } from "./promotion.schema";

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

export const createPromotionAction = action
  .schema(PromotionSchemaForm)
  .action(async ({ parsedInput, ctx }) => {
    const { articleIds, orgId, ...promotionData } = parsedInput;

    // Générer un slug unique en ajoutant un timestamp
    const timestamp = Date.now();
    const baseSlug = parsedInput.name.toLowerCase().replace(/ /g, "-");
    const slug = `${baseSlug}-${timestamp}`;

    // Créer la promotion
    const result = await prisma.promotion.create({
      data: {
        ...promotionData,
        bakeryId: orgId,
        slug: slug,
        // Connecter les articles sélectionnés si fournis
        ...(articleIds && articleIds.length > 0
          ? {
              articles: {
                connect: articleIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });

    return serializeData(result);
  });

export const updatePromotionAction = action
  .schema(
    PromotionSchemaForm.extend({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { articleIds, orgId, id, ...promotionData } = parsedInput;

    // D'abord, déconnecter tous les articles existants
    await prisma.promotion.update({
      where: { id },
      data: {
        articles: {
          set: [],
        },
      },
    });

    // Ensuite, mettre à jour la promotion avec les nouvelles données
    const result = await prisma.promotion.update({
      where: { id },
      data: {
        ...promotionData,
        // Reconnecter les articles sélectionnés si fournis
        ...(articleIds && articleIds.length > 0
          ? {
              articles: {
                connect: articleIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });

    return serializeData(result);
  });

// Exportation de l'ancienne fonction pour compatibilité
export const createPromotion = createPromotionAction;
