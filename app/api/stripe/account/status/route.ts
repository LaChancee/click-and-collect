import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredBakeryUser } from "@/lib/auth/auth-user";
import { z } from "zod";
import { stripe } from "@/lib/stripe";

const StatusSchema = z.object({
  accountId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { bakery } = await getRequiredBakeryUser();

    const body = await request.json();
    const { accountId } = StatusSchema.parse(body);

    // Vérifier que l'accountId correspond à l'organisation
    if (bakery.stripeAccountId !== accountId) {
      return NextResponse.json(
        { error: "ID de compte non autorisé" },
        { status: 403 },
      );
    }

    // Récupérer le statut depuis Stripe
    const accountStatus = await stripe.accounts.retrieve(accountId);

    // Mettre à jour la base de données
    await prisma.organization.update({
      where: { id: bakery.id },
      data: {
        stripeChargesEnabled: accountStatus.charges_enabled,
        stripePayoutsEnabled: accountStatus.payouts_enabled,
        stripeAccountStatus: accountStatus.details_submitted
          ? "enabled"
          : "pending",
      },
    });

    return NextResponse.json({
      success: true,
      status: accountStatus,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du statut:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la vérification du statut" },
      { status: 500 },
    );
  }
}
