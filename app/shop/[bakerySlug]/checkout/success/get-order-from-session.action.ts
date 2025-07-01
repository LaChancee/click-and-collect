"use server";

import { prisma } from "@/lib/prisma";
import { StripeService } from "@/lib/stripe";

export async function getOrderFromStripeSessionAction(sessionId: string) {
  try {
    const stripeService = StripeService.getInstance();
    const session = await stripeService.retrieveCheckoutSession(sessionId);

    if (session.metadata?.timeSlotId) {
      // Rechercher la commande créée par le webhook
      const order = await prisma.order.findFirst({
        where: {
          stripeSessionId: sessionId,
          timeSlotId: session.metadata.timeSlotId,
        },
        select: {
          orderNumber: true,
        },
      });

      return order;
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    return null;
  }
}
