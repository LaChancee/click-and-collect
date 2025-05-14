import { z } from "zod";

export const CategorySchemaForm = z.object({
  name: z.string().min(1, "Le nom de la catégorie est requis"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  position: z.coerce.number().int().min(0).optional(),
  image: z.any().optional(),
  orgId: z.string().min(1, "L'organisation est requise"),
});
