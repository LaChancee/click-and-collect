import { z } from "zod";

export const ProductSchemaForm = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  stockCount: z
    .union([
      z.coerce.number().int().min(0, "Le stock doit être un nombre positif"),
      z.literal("").transform(() => null),
      z.null(),
    ])
    .optional()
    .nullable(),
  position: z.coerce.number().int().min(0).optional(),
  allergenIds: z.array(z.string()).default([]),
  image: z.any().optional(),
  orgId: z.string().min(1, "L'organisation est requise"),
});

export type ProductFormSchemaType = z.infer<typeof ProductSchemaForm>;

export const defaultProductValues: Partial<ProductFormSchemaType> = {
  name: "",
  description: "",
  price: 0,
  categoryId: "",
  isActive: true,
  isAvailable: true,
  stockCount: null,
  position: 0,
  allergenIds: [],
};
