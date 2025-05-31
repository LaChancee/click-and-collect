"use server";
import { action } from "@/lib/actions/safe-actions";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  MealDealSchemaForm,
  MealDealWithItemsSchema,
} from "./meal-deal.schema";

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

export const createMealDealAction = action
  .schema(MealDealWithItemsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { items, orgId, ...mealDealData } = parsedInput;

    // Générer un slug unique
    const timestamp = Date.now();
    const baseSlug = parsedInput.name.toLowerCase().replace(/ /g, "-");
    const slug = `${baseSlug}-${timestamp}`;

    // Créer la formule avec ses éléments
    const result = await prisma.mealDeal.create({
      data: {
        name: mealDealData.name,
        description: mealDealData.description || null,
        price: mealDealData.price,
        isActive: mealDealData.isActive,
        position: mealDealData.position || 0,
        imageUrl: mealDealData.imageUrl,
        bakeryId: orgId,
        slug: slug,
        items: {
          create: items.map((item) => ({
            articleId: item.articleId,
            quantity: item.quantity,
            required: item.required,
            groupName: null,
          })),
        },
      },
      include: {
        items: {
          include: {
            article: true,
          },
        },
      },
    });

    return serializeData(result);
  });

export const updateMealDealAction = action
  .schema(
    MealDealWithItemsSchema.extend({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { items, orgId, id, ...mealDealData } = parsedInput;

    // D'abord, supprimer tous les anciens éléments de la formule
    await prisma.mealDealItem.deleteMany({
      where: { mealDealId: id },
    });

    // Ensuite, mettre à jour la formule avec les nouvelles données
    const result = await prisma.mealDeal.update({
      where: { id },
      data: {
        ...mealDealData,
        items: {
          create: items.map((item) => ({
            articleId: item.articleId,
            quantity: item.quantity,
            required: item.required,
            groupName: null,
          })),
        },
      },
      include: {
        items: {
          include: {
            article: true,
          },
        },
      },
    });

    return serializeData(result);
  });
