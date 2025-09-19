"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { GenerateTimeSlotsSchema } from "../_schemas/generate-time-slots.schema";
import { addDays, setHours, setMinutes, startOfDay, getDay } from "date-fns";

export const generateTimeSlotsAction = orgAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(GenerateTimeSlotsSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const {
      startDate,
      endDate,
      startTime,
      endTime,
      duration,
      maxOrders,
      daysOfWeek,
      replaceExisting,
    } = input;

    // Convertir les dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Convertir les heures en minutes
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Si replaceExisting est true, supprimer les créneaux existants dans la période
    if (replaceExisting) {
      await prisma.timeSlot.deleteMany({
        where: {
          bakeryId: ctx.id,
          startTime: {
            gte: startOfDay(start),
            lte: addDays(startOfDay(end), 1),
          },
        },
      });
    }

    const timeSlotsToCreate = [];
    let currentDate = start;

    // Générer les créneaux pour chaque jour dans la période
    while (currentDate <= end) {
      const dayOfWeek = getDay(currentDate);

      // Vérifier si ce jour de la semaine est sélectionné
      if (daysOfWeek.includes(dayOfWeek)) {
        // Générer les créneaux pour cette journée
        let currentMinutes = startMinutes;

        while (currentMinutes + duration <= endMinutes) {
          const slotStartTime = setMinutes(
            setHours(startOfDay(currentDate), Math.floor(currentMinutes / 60)),
            currentMinutes % 60,
          );

          const slotEndTime = setMinutes(
            setHours(
              startOfDay(currentDate),
              Math.floor((currentMinutes + duration) / 60),
            ),
            (currentMinutes + duration) % 60,
          );

          // Vérifier si le créneau n'existe pas déjà (si replaceExisting est false)
          if (!replaceExisting) {
            const existingSlot = await prisma.timeSlot.findFirst({
              where: {
                bakeryId: ctx.id,
                startTime: slotStartTime,
                endTime: slotEndTime,
              },
            });

            if (existingSlot) {
              currentMinutes += duration;
              continue;
            }
          }

          timeSlotsToCreate.push({
            startTime: slotStartTime,
            endTime: slotEndTime,
            maxOrders,
            isActive: true,
            bakeryId: ctx.id,
          });

          currentMinutes += duration;
        }
      }

      currentDate = addDays(currentDate, 1);
    }

    // Créer tous les créneaux en une seule transaction
    const createdSlots = await prisma.timeSlot.createMany({
      data: timeSlotsToCreate,
      skipDuplicates: true,
    });

    return {
      success: true,
      createdCount: createdSlots.count,
      totalSlots: timeSlotsToCreate.length,
    };
  });
