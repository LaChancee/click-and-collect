import Stripe from "stripe";
import { env } from "./env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});

// Exporter StripeService depuis le dossier stripe
export { StripeService } from "./stripe/stripe-service";
