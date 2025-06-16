import { NextRequest, NextResponse } from "next/server";
import { StripeService } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrg } from "@/lib/organizations/get-org";
import { z } from "zod";

const StatusSchema = z.object({
  accountId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const organization = await getRequiredCurrentOrg();

    if (!organization.isBakery) {
      return NextResponse.json(
        {
          error: "Seules les boulangeries peuvent vérifier leur statut Stripe",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { accountId } = StatusSchema.parse(body);

    // Vérifier que l'accountId correspond à l'organisation
    if (organization.stripeAccountId !== accountId) {
      return NextResponse.json(
        { error: "ID de compte non autorisé" },
        { status: 403 },
      );
    }

    const stripeService = StripeService.getInstance();

    // Récupérer le statut depuis Stripe
    const accountStatus = await stripeService.getAccountStatus(accountId);

    // Mettre à jour la base de données
    await prisma.organization.update({
      where: { id: organization.id },
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
