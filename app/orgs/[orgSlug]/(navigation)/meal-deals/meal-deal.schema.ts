import { z } from "zod";

export const MealDealSchemaForm = z.object({
  name: z.string().min(1, "Le nom de la formule est requis"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  isActive: z.boolean().default(true),
  position: z.coerce.number().int().min(0).optional(),
  imageUrl: z
    .string()
    .url("L'URL de l'image est invalide")
    .optional()
    .nullable(),
  orgId: z.string(),
});

export type MealDealFormSchemaType = z.infer<typeof MealDealSchemaForm>;

export const defaultMealDealValues: Partial<MealDealFormSchemaType> = {
  name: "",
  description: "",
  price: 0,
  isActive: true,
  position: 0,
  imageUrl: null,
};

// Schema for meal deal items
export const MealDealItemSchema = z.object({
  articleId: z.string().min(1, "L'article est requis"),
  quantity: z.coerce.number().int().min(1, "La quantité doit être au moins 1"),
  required: z.boolean().default(false),
  groupName: z.string().optional(),
});

export type MealDealItemType = z.infer<typeof MealDealItemSchema>;

// Schema for the complete meal deal with items
export const MealDealWithItemsSchema = MealDealSchemaForm.extend({
  items: z
    .array(MealDealItemSchema)
    .min(1, "Une formule doit contenir au moins un produit"),
});
