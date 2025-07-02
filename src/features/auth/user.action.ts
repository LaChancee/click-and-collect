"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { z } from "zod";

export const getCurrentUserAction = authAction
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const user = ctx.user;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  });

export const getUserSessionAction = authAction
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const user = ctx.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
      },
      isAuthenticated: true,
    };
  });
