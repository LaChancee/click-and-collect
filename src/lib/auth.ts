import { stripe as stripePlugin } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink, organization } from "better-auth/plugins";
import { ac, roles } from "./auth/auth-permissions";

import { sendEmail } from "@/lib/mail/send-email";
import { SiteConfig } from "@/site-config";
import MarkdownEmail from "@email/markdown.email";
import type Stripe from "stripe";
import {
  setupDefaultOrganizationsOrInviteUser,
  setupResendCustomer,
} from "./auth/auth-config-setup";
import { AUTH_PLANS } from "./auth/auth-plans";
import { env } from "./env";
import { logger } from "./logger";
import { prisma } from "./prisma";
import { getServerUrl } from "./server-url";
import { stripe } from "./stripe";

type SocialProvidersType = Parameters<typeof betterAuth>[0]["socialProviders"];

export const SocialProviders: SocialProvidersType = {};

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  SocialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  };
}

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  SocialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: getServerUrl(),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await setupDefaultOrganizationsOrInviteUser(user);
          await setupResendCustomer(user);
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: MarkdownEmail({
          preview: `Reset your password for ${SiteConfig.title}`,
          markdown: `
          Hello,

          You requested to reset your password.

          [Click here to reset your password](${url})
          `,
        }),
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }) => {
        await sendEmail({
          to: newEmail,
          subject: "Change email address",
          react: MarkdownEmail({
            preview: `Change your email address for ${SiteConfig.title}`,
            markdown: `
            Hello,

            You requested to change your email address.

            [Click here to verify your new email address](${url})
            `,
          }),
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, token }) => {
        const url = `${getServerUrl()}/auth/confirm-delete?token=${token}&callbackUrl=/auth/goodbye`;
        await sendEmail({
          to: user.email,
          subject: "Delete your account",
          react: MarkdownEmail({
            preview: `Delete your account from ${SiteConfig.title}`,
            markdown: `
            Hello,

            You requested to delete your account.

            [Click here to confirm account deletion](${url})
            `,
          }),
        });
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        react: MarkdownEmail({
          preview: `Verify your email for ${SiteConfig.title}`,
          markdown: `
          Hello,

          Welcome to ${SiteConfig.title}! Please verify your email address.

          [Click here to verify your email](${url})
          `,
        }),
      });
    },
  },
  socialProviders: SocialProviders,
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to your account",
          react: MarkdownEmail({
            preview: `Sign in to ${SiteConfig.title}`,
            markdown: `
            Hello,

            Click the link below to sign in to your account.

            [Sign in](${url})
            `,
          }),
        });
      },
    }),
    organization({
      ac: ac,
      roles: roles,
      // Définit la limit d'organization à 1
      organizationLimit: 1,
      // Définit la limit de membership à 1
      membershipLimit: 1,
      schema: {
        organization: {
          fields: {
            email: "string",
          },
        },
      },
    }),
    stripePlugin({
      stripe: stripe,
      paymentPlans: AUTH_PLANS,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      async onCustomerCreated(customer, user) {
        logger.info("Customer created", { customer, user });
      },
      async onSubscriptionCreated(subscription, user) {
        logger.info("Subscription created", { subscription, user });
      },
      async onSubscriptionUpdated(subscription, user) {
        logger.info("Subscription updated", { subscription, user });
      },
      async onInvoicePaid(invoice, subscription, user) {
        logger.info("Invoice paid", { invoice, subscription, user });
      },
    }),
  ],
});
