"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TimeSlotSettingsSchema } from "../_schemas/time-slot-settings.schema";

const UpdateSettingsSchema = TimeSlotSettingsSchema.and(
  z.object({
    settingsId: z.string(),
  }),
);

export const updateTimeSlotSettingsAction = orgAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(UpdateSettingsSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const { settingsId, ...settingsData } = input;

    // Vérifier que les paramètres appartiennent à l'organisation
    const existingSettings = await prisma.settings.findUnique({
      where: {
        id: settingsId,
        bakeryId: ctx.user.id,
      },
    });

    if (!existingSettings) {
      throw new Error("Paramètres non trouvés");
    }

    // Mettre à jour les paramètres
    const updatedSettings = await prisma.settings.update({
      where: {
        id: settingsId,
      },
      data: {
        storeOpenTime: settingsData.storeOpenTime,
        storeCloseTime: settingsData.storeCloseTime,
        timeSlotDuration: settingsData.timeSlotDuration,
        maxOrdersPerSlot: settingsData.maxOrdersPerSlot,
        preOrderDaysAhead: settingsData.preOrderDaysAhead,
        minOrderValue: settingsData.minOrderValue,
      },
    });

    return {
      success: true,
      settings: updatedSettings,
    };
  });
