import { NextRequest, NextResponse } from "next/server";
import { getRequiredBakeryUser } from "@/lib/auth/auth-user";
import { StripeService } from "@/lib/stripe/stripe-service";
import { z } from "zod";

const AccountSessionSchema = z.object({
  accountId: z.string(),
  components: z.object({
    account_onboarding: z
      .object({
        enabled: z.boolean(),
      })
      .optional(),
    account_management: z
      .object({
        enabled: z.boolean(),
        features: z
          .object({
            external_account_collection: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const { bakery } = await getRequiredBakeryUser();
    const body = await request.json();
    const { accountId, components } = AccountSessionSchema.parse(body);

    // Vérifier que l'accountId correspond à la boulangerie
    if (bakery.stripeAccountId !== accountId) {
      return NextResponse.json(
        { error: "ID de compte non autorisé" },
        { status: 403 },
      );
    }

    const stripeService = StripeService.getInstance();

    // Créer une Account Session
    const accountSession = await stripeService.createAccountSession({
      account: accountId,
      components,
    });

    return NextResponse.json({
      success: true,
      client_secret: accountSession.client_secret,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'Account Session:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'Account Session" },
      { status: 500 },
    );
  }
}
