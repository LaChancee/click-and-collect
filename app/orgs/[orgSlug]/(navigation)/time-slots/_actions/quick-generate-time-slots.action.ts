"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addDays, setHours, setMinutes, startOfDay, getDay } from "date-fns";

const QuickGenerateTimeSlotsSchema = z.object({
  orgId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  maxOrders: z.number(),
  days: z.number(),
  weekendOnly: z.boolean().optional(),
});

export const quickGenerateTimeSlotsAction = orgAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(QuickGenerateTimeSlotsSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const {
      orgId,
      startTime,
      endTime,
      duration,
      maxOrders,
      days,
      weekendOnly,
    } = input;

    // Récupérer l'organisation à partir du slug pour obtenir l'ID réel
    console.log(
      `[QuickTimeSlots] Recherche de l'organisation avec le slug: ${orgId}`,
    );

    const organization = await prisma.organization.findFirst({
      where: {
        slug: orgId,
      },
      select: {
        id: true,
        name: true,
        isBakery: true,
      },
    });

    if (!organization) {
      throw new Error(`Organisation non trouvée avec le slug: ${orgId}`);
    }

    console.log(
      `[QuickTimeSlots] Organisation trouvée: ${organization.name} (${organization.id}) - isBakery: ${organization.isBakery}`,
    );

    // Vérifier que l'organisation existe bien dans la base
    const orgExists = await prisma.organization.findUnique({
      where: {
        id: organization.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log(
      `[QuickTimeSlots] Vérification existence org: ${orgExists ? "OK" : "ERREUR"}`,
    );

    if (!orgExists) {
      throw new Error(
        `L'organisation avec l'ID ${organization.id} n'existe pas`,
      );
    }

    const bakeryId = organization.id;

    // Dates de début et fin
    const startDate = startOfDay(new Date());
    const endDate = addDays(startDate, days);

    // Convertir les heures en minutes
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    const timeSlotsToCreate = [];
    let currentDate = startDate;

    console.log(
      `[QuickTimeSlots] Génération de créneaux du ${startDate.toISOString()} au ${endDate.toISOString()}`,
    );
    console.log(
      `[QuickTimeSlots] Configuration: ${startTime}-${endTime}, durée: ${duration}min, max: ${maxOrders}, weekendOnly: ${weekendOnly}`,
    );

    // Générer les créneaux pour chaque jour
    while (currentDate <= endDate) {
      const dayOfWeek = getDay(currentDate);

      // Logique pour les jours de la semaine
      let shouldCreateSlot = true;

      if (weekendOnly) {
        // Seulement samedi (6) et dimanche (0)
        shouldCreateSlot = dayOfWeek === 0 || dayOfWeek === 6;
      } else {
        // Tous les jours (lundi à dimanche)
        shouldCreateSlot = true;
      }

      if (shouldCreateSlot) {
        // Générer les créneaux pour cette journée
        let currentMinutes = startMinutes;
        console.log(
          `[QuickTimeSlots] Génération créneaux pour ${currentDate.toDateString()} (jour ${dayOfWeek})`,
        );

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

          // Vérifier si le créneau n'existe pas déjà
          const existingSlot = await prisma.timeSlot.findFirst({
            where: {
              bakeryId: bakeryId,
              startTime: slotStartTime,
              endTime: slotEndTime,
            },
          });

          if (!existingSlot) {
            timeSlotsToCreate.push({
              startTime: slotStartTime,
              endTime: slotEndTime,
              maxOrders,
              isActive: true,
              bakeryId: bakeryId,
            });
          }

          currentMinutes += duration;
        }
      }

      currentDate = addDays(currentDate, 1);
    }

    console.log(
      `[QuickTimeSlots] ${timeSlotsToCreate.length} créneaux à créer pour la boulangerie ${bakeryId}`,
    );

    if (timeSlotsToCreate.length === 0) {
      return {
        success: true,
        createdCount: 0,
        totalSlots: 0,
        message: "Aucun créneau à créer (tous existent déjà)",
      };
    }

    // Test : créer un seul créneau d'abord pour diagnostiquer
    console.log(
      `[QuickTimeSlots] Test création du premier créneau:`,
      timeSlotsToCreate[0],
    );

    try {
      const testSlot = await prisma.timeSlot.create({
        data: timeSlotsToCreate[0],
      });
      console.log(
        `[QuickTimeSlots] Premier créneau créé avec succès:`,
        testSlot.id,
      );

      // Si le premier fonctionne, créer le reste
      if (timeSlotsToCreate.length > 1) {
        const remainingSlots = await prisma.timeSlot.createMany({
          data: timeSlotsToCreate.slice(1),
          skipDuplicates: true,
        });
        console.log(
          `[QuickTimeSlots] ${remainingSlots.count + 1} créneaux créés avec succès`,
        );
        return {
          success: true,
          createdCount: remainingSlots.count + 1,
          totalSlots: timeSlotsToCreate.length,
        };
      } else {
        return {
          success: true,
          createdCount: 1,
          totalSlots: 1,
        };
      }
    } catch (error) {
      console.error(
        `[QuickTimeSlots] Erreur lors de la création du premier créneau:`,
        error,
      );
      throw error;
    }
  });
