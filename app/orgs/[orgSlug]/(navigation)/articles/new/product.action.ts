import {  orgAction } from "@/lib/actions/safe-actions";

import { prisma } from "@/lib/prisma";
import { ProductSchemaForm } from "./product.schema";

export const createProduct = orgAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(ProductSchemaForm)
  .action(async ({ parsedInput, ctx }) => {
    const result = await prisma.product.create({
      data: {
        ...parsedInput,
        bakeryId: ctx.id,
        slug: parsedInput.name.toLowerCase().replace(/ /g, "-"),
      },
    });
    return result;
  });
