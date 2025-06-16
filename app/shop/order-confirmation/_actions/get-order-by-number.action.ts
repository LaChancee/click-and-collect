"use server";

import { prisma } from "@/lib/prisma";

export async function getOrderByNumberAction(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          article: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              image: true,
            },
          },
        },
      },
      timeSlot: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          bakery: {
            select: {
              name: true,
              address: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Commande non trouvée");
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
    guestName: order.guestName,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,
    createdAt: order.createdAt.toISOString(),
    timeSlot: {
      id: order.timeSlot.id,
      startTime: order.timeSlot.startTime.toISOString(),
      endTime: order.timeSlot.endTime.toISOString(),
      bakery: order.timeSlot.bakery,
    },
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      article: {
        id: item.article.id,
        name: item.article.name,
        price: Number(item.article.price),
        imageUrl: item.article.imageUrl || item.article.image,
      },
    })),
  };
}
