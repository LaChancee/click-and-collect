import { action, authAction } from "@/lib/actions/safe-actions";

import { prisma } from "@/lib/prisma";
import { ProductSchemaForm } from "./product.schema";

export const createProduct = action
  .schema(ProductSchemaForm)
  .action(async ({ parsedInput, ctx }) => {
    const result = await prisma.product.create({
      data: {
        ...parsedInput,
        bakeryId: parsedInput.orgId,
        slug: parsedInput.name.toLowerCase().replace(/ /g, '-'),
      },
    });
    return result;
  });
