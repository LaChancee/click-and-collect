import { z } from "zod";

export const GenerateTimeSlotsSchema = z
  .object({
    startDate: z.string().min(1, "Date de début requise"),
    endDate: z.string().min(1, "Date de fin requise"),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Format d'heure invalide (HH:MM)",
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Format d'heure invalide (HH:MM)",
      ),
    duration: z
      .number()
      .min(15, "Durée minimum de 15 minutes")
      .max(120, "Durée maximum de 2 heures"),
    maxOrders: z
      .number()
      .min(1, "Au moins 1 commande par créneau")
      .max(50, "Maximum 50 commandes par créneau"),
    daysOfWeek: z
      .array(z.number().min(0).max(6))
      .min(1, "Sélectionnez au moins un jour"),
    replaceExisting: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Vérifier que la date de fin est après la date de début
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "La date de fin doit être après ou égale à la date de début",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      // Vérifier que l'heure de fin est après l'heure de début
      const [startHour, startMinute] = data.startTime.split(":").map(Number);
      const [endHour, endMinute] = data.endTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return endMinutes > startMinutes;
    },
    {
      message: "L'heure de fin doit être après l'heure de début",
      path: ["endTime"],
    },
  );

export type GenerateTimeSlotsSchemaType = z.infer<
  typeof GenerateTimeSlotsSchema
>;
