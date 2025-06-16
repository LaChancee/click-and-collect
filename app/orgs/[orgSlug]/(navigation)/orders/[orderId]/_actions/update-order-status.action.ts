"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendOrderEmail } from "../_lib/send-order-email";

const UpdateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ]),
  sendEmail: z.boolean().default(false),
});

export const updateOrderStatusAction = orgAction
  .metadata({
    roles: ["owner", "admin", "member"],
  })
  .schema(UpdateOrderStatusSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      // Récupérer la commande avec toutes les informations nécessaires
      const order = await prisma.order.findFirst({
        where: {
          id: input.orderId,
          timeSlot: {
            bakeryId: ctx.id,
          },
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          timeSlot: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
          items: {
            include: {
              article: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error("Commande non trouvée");
      }

      // Mettre à jour le statut de la commande
      const updatedOrder = await prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          status: input.status,
        },
      });

      // Envoyer un email de confirmation si demandé
      if (input.sendEmail) {
        const customerEmail = order.isGuestOrder
          ? order.guestEmail
          : order.customer?.email;
        const customerName = order.isGuestOrder
          ? order.guestName
          : order.customer?.name;

        if (customerEmail) {
          await sendOrderEmail({
            to: customerEmail,
            customerName: customerName || "Client",
            orderNumber: order.orderNumber,
            status: input.status,
            items: order.items,
            totalAmount: order.totalAmount,
            timeSlot: order.timeSlot,
            bakeryName: ctx.name,
          });
        }
      }

      revalidatePath(`/orgs/${ctx.slug}/orders`);
      revalidatePath(`/orgs/${ctx.slug}/orders/${input.orderId}`);

      return {
        success: true,
        message: `Commande ${getStatusLabel(input.status).toLowerCase()}${input.sendEmail ? " et email envoyé" : ""}`,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande:", error);
      throw new Error("Impossible de mettre à jour la commande");
    }
  });

function getStatusLabel(status: string): string {
  const statusLabels = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    PREPARING: "En préparation",
    READY: "Prête",
    COMPLETED: "Récupérée",
    CANCELLED: "Annulée",
  };
  return statusLabels[status as keyof typeof statusLabels] || status;
}
