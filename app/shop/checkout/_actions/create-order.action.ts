"use server";

import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { sendOrderConfirmationEmail } from "../../../../lib/email/send-order-confirmation";

interface CreateOrderData {
  timeSlotId: string;
  paymentMethod: "CARD_ONLINE" | "CARD_INSTORE" | "CASH_INSTORE";
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  items: Array<{
    articleId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
}

export async function createOrderAction(data: CreateOrderData) {
  try {
    // Vérifier que le créneau existe et est disponible
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: data.timeSlotId },
      include: {
        bakery: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            orders: {
              where: {
                status: { not: "CANCELLED" },
              },
            },
          },
        },
      },
    });

    if (!timeSlot) {
      return { success: false, error: "Créneau non trouvé" };
    }

    if (timeSlot._count.orders >= timeSlot.maxOrders) {
      return { success: false, error: "Créneau complet" };
    }

    // Vérifier que tous les articles existent
    const articleIds = data.items.map((item) => item.articleId);
    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
        isActive: true,
        isAvailable: true,
      },
    });

    if (articles.length !== articleIds.length) {
      return {
        success: false,
        error: "Certains articles ne sont plus disponibles",
      };
    }

    // Générer un numéro de commande unique
    const orderNumber = `CMD-${nanoid(8).toUpperCase()}`;

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: data.totalAmount,
        status: "PENDING",
        paymentStatus:
          data.paymentMethod === "CARD_ONLINE" ? "PENDING" : "PENDING",
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        isGuestOrder: true,
        guestName: data.customerInfo.name,
        guestEmail: data.customerInfo.email,
        guestPhone: data.customerInfo.phone,
        timeSlotId: data.timeSlotId,
        items: {
          create: data.items.map((item) => ({
            articleId: item.articleId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            article: {
              select: {
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
            bakery: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Envoyer l'email de confirmation automatiquement
    try {
      const paymentMethodLabels = {
        CARD_ONLINE: "Carte en ligne",
        CARD_INSTORE: "Carte en magasin",
        CASH_INSTORE: "Espèces en magasin",
      };

      await sendOrderConfirmationEmail({
        to: data.customerInfo.email,
        orderNumber: order.orderNumber,
        customerName: data.customerInfo.name,
        bakeryName: order.timeSlot.bakery.name,
        items: order.items.map((item) => ({
          name: item.article.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          image: item.article.image || undefined,
        })),
        totalAmount: Number(order.totalAmount),
        pickupDate: new Date(order.timeSlot.startTime).toLocaleDateString(
          "fr-FR",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        ),
        pickupTime: `${order.timeSlot.startTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${order.timeSlot.endTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        paymentMethod: paymentMethodLabels[data.paymentMethod],
        notes: data.notes,
      });

      console.log(
        `Email de confirmation envoyé pour la commande #${order.orderNumber}`,
      );
    } catch (emailError) {
      // Ne pas faire échouer la création de commande si l'email échoue
      console.error(
        "Erreur lors de l'envoi de l'email de confirmation:",
        emailError,
      );
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return { success: false, error: "Erreur interne du serveur" };
  }
}
