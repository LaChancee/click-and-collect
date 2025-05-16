import { z } from "zod";

export const PromotionSchemaForm = z.object({
  name: z.string().min(1, "Le nom de la promotion est requis"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"], {
    required_error: "Le type de remise est requis",
  }),
  discountValue: z.coerce
    .number()
    .min(0, "La valeur de la remise doit être positive"),
  startDate: z.coerce.date({
    required_error: "La date de début est requise",
    invalid_type_error: "Format de date invalide",
  }),
  endDate: z.coerce.date({
    required_error: "La date de fin est requise",
    invalid_type_error: "Format de date invalide",
  }),
  isActive: z.boolean().default(true),
  minimumOrderValue: z
    .union([
      z.coerce
        .number()
        .min(0, "Le montant minimum doit être un nombre positif"),
      z.literal("").transform(() => null),
      z.null(),
    ])
    .optional()
    .nullable(),
  articleIds: z.array(z.string()).default([]).optional(),
  orgId: z.string(),
});

export type PromotionFormSchemaType = z.infer<typeof PromotionSchemaForm>;

export const defaultPromotionValues: Partial<PromotionFormSchemaType> = {
  name: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  isActive: true,
  minimumOrderValue: null,
  articleIds: [],
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
};
