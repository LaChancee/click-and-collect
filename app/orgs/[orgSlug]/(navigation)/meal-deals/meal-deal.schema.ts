import { z } from "zod";

export const MealDealSchemaForm = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
  position: z.coerce.number().default(0),
  imageUrl: z.string().optional().nullable(),
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

// Schema for meal deal items (ULTRA SIMPLIFIÉ)
export const MealDealItemSchema = z
  .object({
    articleId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    quantity: z.coerce.number().min(1),
    required: z.boolean().default(false),
    groupName: z.string().optional().nullable(),
  })
  .refine((data) => Boolean(data.articleId) !== Boolean(data.categoryId), {
    message:
      "Soit articleId, soit categoryId doit être renseigné, mais pas les deux",
    path: ["articleId"],
  });

export type MealDealItemType = z.infer<typeof MealDealItemSchema>;

// Schema for the complete meal deal with items (ULTRA SIMPLE)
export const MealDealWithItemsSchema = MealDealSchemaForm.extend({
  items: z.array(MealDealItemSchema),
});
