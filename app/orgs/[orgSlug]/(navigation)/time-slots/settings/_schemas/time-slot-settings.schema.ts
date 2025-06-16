import { z } from "zod";

export const TimeSlotSettingsSchema = z
  .object({
    storeOpenTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Format d'heure invalide (HH:MM)",
      ),
    storeCloseTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Format d'heure invalide (HH:MM)",
      ),
    timeSlotDuration: z
      .number()
      .min(15, "La durée minimum est de 15 minutes")
      .max(120, "La durée maximum est de 2 heures"),
    maxOrdersPerSlot: z
      .number()
      .min(1, "Au moins 1 commande par créneau")
      .max(50, "Maximum 50 commandes par créneau"),
    preOrderDaysAhead: z
      .number()
      .min(1, "Au moins 1 jour à l'avance")
      .max(30, "Maximum 30 jours à l'avance"),
    minOrderValue: z.number().min(0).optional(),
    paymentThreshold: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      // Vérifier que l'heure de fermeture est après l'heure d'ouverture
      const [openHour, openMinute] = data.storeOpenTime.split(":").map(Number);
      const [closeHour, closeMinute] = data.storeCloseTime
        .split(":")
        .map(Number);

      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;

      return closeTime > openTime;
    },
    {
      message: "L'heure de fermeture doit être après l'heure d'ouverture",
      path: ["storeCloseTime"],
    },
  );

export type TimeSlotSettingsSchemaType = z.infer<typeof TimeSlotSettingsSchema>;
