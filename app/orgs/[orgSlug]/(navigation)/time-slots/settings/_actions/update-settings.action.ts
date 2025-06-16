"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TimeSlotSettingsSchema } from "../_schemas/time-slot-settings.schema";

const UpdateSettingsSchema = TimeSlotSettingsSchema.extend({
  settingsId: z.string(),
});

export const updateTimeSlotSettingsAction = orgAction
  .metadata({
    roles: ["OWNER", "ADMIN"],
  })
  .schema(UpdateSettingsSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const { settingsId, ...settingsData } = input;

    // Vérifier que les paramètres appartiennent à l'organisation
    const existingSettings = await prisma.settings.findUnique({
      where: {
        id: settingsId,
        bakeryId: ctx.org.id,
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
        paymentThreshold: settingsData.paymentThreshold,
      },
    });

    return {
      success: true,
      settings: updatedSettings,
    };
  });
