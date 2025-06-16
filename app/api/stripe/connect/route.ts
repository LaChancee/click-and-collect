import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredBakeryUser } from "@/lib/auth/auth-user";
import { StripeService } from "@/lib/stripe/stripe-service";

export async function POST(request: NextRequest) {
  try {
    const { bakery } = await getRequiredBakeryUser();

    // Vérifier si la boulangerie a déjà un compte Stripe
    if (bakery.stripeAccountId) {
      return NextResponse.json(
        { error: "Cette boulangerie a déjà un compte Stripe connecté" },
        { status: 400 },
      );
    }

    const stripeService = StripeService.getInstance();

    // Créer un compte Stripe Connect
    const account = await stripeService.createConnectAccount({
      email: bakery.email || "",
      name: bakery.name,
      country: "FR",
    });

    // Mettre à jour l'organisation avec l'ID du compte Stripe
    await prisma.organization.update({
      where: { id: bakery.id },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: "pending",
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
      },
    });

    // Créer le lien d'onboarding
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const refreshUrl = `${baseUrl}/orgs/${bakery.slug}/settings/stripe/refresh`;
    const returnUrl = `${baseUrl}/orgs/${bakery.slug}/settings/stripe/success`;

    const accountLink = await stripeService.createAccountLink(
      account.id,
      refreshUrl,
      returnUrl,
    );

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      accountId: account.id,
    });
  } catch (error: any) {
    console.error("Erreur lors de la création du compte Stripe:", error);

    // Gestion spécifique de l'erreur de profil de plateforme
    if (
      error.message &&
      error.message.includes("responsibilities of managing losses")
    ) {
      return NextResponse.json(
        {
          error: "Configuration Stripe Connect incomplète",
          details:
            "Veuillez configurer votre profil de plateforme dans le Stripe Dashboard (Paramètres > Connect > Profil de plateforme) avant de créer des comptes connectés.",
          dashboardUrl:
            "https://dashboard.stripe.com/settings/connect/platform-profile",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du compte Stripe" },
      { status: 500 },
    );
  }
}
