"use server";

import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay } from "date-fns";

export async function getAvailableTimeSlotsAction(bakerySlug: string) {
  // Récupérer la boulangerie
  const bakery = await prisma.organization.findUnique({
    where: { slug: bakerySlug },
  });

  if (!bakery) {
    throw new Error("Boulangerie non trouvée");
  }

  // Récupérer les créneaux des 3 prochains jours
  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);

  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      bakeryId: bakery.id,
      isActive: true,
      startTime: {
        gte: startOfDay(today),
        lte: endOfDay(threeDaysFromNow),
      },
    },
    include: {
      _count: {
        select: {
          orders: {
            where: {
              status: {
                not: "CANCELLED",
              },
            },
          },
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // Filtrer les créneaux disponibles (pas complets)
  const availableTimeSlots = timeSlots.filter(
    (slot) => slot._count.orders < slot.maxOrders,
  );

  return availableTimeSlots.map((slot) => ({
    id: slot.id,
    startTime: slot.startTime.toISOString(),
    endTime: slot.endTime.toISOString(),
    maxOrders: slot.maxOrders,
    currentOrders: slot._count.orders,
    availableSpots: slot.maxOrders - slot._count.orders,
  }));
}
