"use server";

import { z } from "zod";

const CreateStripeCheckoutSchema = z.object({
  timeSlotId: z.string(),
  items: z.array(
    z.object({
      articleId: z.string(),
      quantity: z.number().min(1),
    }),
  ),
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  notes: z.string().optional(),
});

export async function createStripeCheckoutAction(
  data: z.infer<typeof CreateStripeCheckoutSchema>,
) {
  try {
    // Valider les données
    const validatedData = CreateStripeCheckoutSchema.parse(data);

    // Appeler l'API de checkout Stripe
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stripe/checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          result.error ||
          "Erreur lors de la création de la session de paiement",
      };
    }

    return {
      success: true,
      sessionId: result.sessionId,
      url: result.url,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Données invalides",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Erreur interne du serveur",
    };
  }
}
