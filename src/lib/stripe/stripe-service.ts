import { stripe } from "../stripe";

// Réexporter stripe pour les autres modules
export { stripe };

export class StripeService {
  private static instance: StripeService;

  private constructor() {}

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  // Créer un compte Stripe Connect pour une boulangerie
  async createConnectAccount(bakeryData: {
    email: string;
    name: string;
    country?: string;
  }) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: bakeryData.country || "FR",
        email: bakeryData.email,
        business_profile: {
          name: bakeryData.name,
          product_description: "Boulangerie artisanale - Click & Collect",
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      return account;
    } catch (error) {
      console.error("Erreur création compte Stripe:", error);
      throw error;
    }
  }

  // Créer un lien d'onboarding pour finaliser la configuration du compte
  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });

      return accountLink;
    } catch (error) {
      console.error("Erreur création lien onboarding:", error);
      throw error;
    }
  }

  // Vérifier le statut d'un compte Stripe Connect
  async getAccountStatus(accountId: string) {
    try {
      const account = await stripe.accounts.retrieve(accountId);

      return {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      };
    } catch (error) {
      console.error("Erreur récupération statut compte:", error);
      throw error;
    }
  }

  // Créer une session de paiement avec Stripe Connect
  async createCheckoutSession({
    priceData,
    successUrl,
    cancelUrl,
    customerEmail,
    stripeAccountId,
    applicationFeeAmount = 0, // Commission en centimes
    metadata = {},
  }: {
    priceData: {
      currency: string;
      product_data: {
        name: string;
        description?: string;
      };
      unit_amount: number;
    };
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    stripeAccountId: string;
    applicationFeeAmount?: number;
    metadata?: Record<string, string>;
  }) {
    try {
      const sessionParams: any = {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: priceData,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      };

      // Ajouter l'email client si fourni
      if (customerEmail) {
        sessionParams.customer_email = customerEmail;
      }

      // Ajouter la commission si spécifiée
      if (applicationFeeAmount > 0) {
        sessionParams.payment_intent_data = {
          application_fee_amount: applicationFeeAmount,
        };
      }

      const session = await stripe.checkout.sessions.create(sessionParams, {
        stripeAccount: stripeAccountId, // Paiement vers le compte de la boulangerie
      });

      return session;
    } catch (error) {
      console.error("Erreur création session checkout:", error);
      throw error;
    }
  }

  // Créer un paiement direct (pour les paiements en magasin)
  async createPaymentIntent({
    amount,
    currency = "eur",
    stripeAccountId,
    applicationFeeAmount = 0,
    metadata = {},
  }: {
    amount: number;
    currency?: string;
    stripeAccountId: string;
    applicationFeeAmount?: number;
    metadata?: Record<string, string>;
  }) {
    try {
      const paymentIntentParams: any = {
        amount,
        currency,
        metadata,
      };

      if (applicationFeeAmount > 0) {
        paymentIntentParams.application_fee_amount = applicationFeeAmount;
      }

      const paymentIntent = await stripe.paymentIntents.create(
        paymentIntentParams,
        {
          stripeAccount: stripeAccountId,
        },
      );

      return paymentIntent;
    } catch (error) {
      console.error("Erreur création PaymentIntent:", error);
      throw error;
    }
  }

  // Calculer la commission (par exemple 3% du montant)
  calculateApplicationFee(amount: number, feePercentage: number = 3): number {
    return Math.round((amount * feePercentage) / 100);
  }

  // Créer une Account Session pour les composants embedded
  async createAccountSession({
    account,
    components,
  }: {
    account: string;
    components: {
      account_onboarding?: { enabled: boolean };
      account_management?: {
        enabled: boolean;
        features?: { external_account_collection?: boolean };
      };
    };
  }) {
    try {
      const accountSession = await stripe.accountSessions.create({
        account,
        components,
      });

      return accountSession;
    } catch (error) {
      console.error("Erreur création Account Session:", error);
      throw error;
    }
  }
}
