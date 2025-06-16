import { PrismaClient } from "@prisma/client";
import { addDays, setHours, setMinutes, startOfDay } from "date-fns";

const prisma = new PrismaClient();

async function seedTimeSlots() {
  try {
    // Récupérer toutes les organisations (boulangeries)
    const bakeries = await prisma.organization.findMany({
      where: {
        // Vous pouvez ajouter des filtres si nécessaire
      },
    });

    if (bakeries.length === 0) {
      console.log("Aucune boulangerie trouvée");
      return;
    }

    console.log(`Création de créneaux pour ${bakeries.length} boulangerie(s)`);

    for (const bakery of bakeries) {
      console.log(`Création de créneaux pour: ${bakery.name}`);

      // Créer des créneaux pour les 7 prochains jours
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = addDays(startOfDay(new Date()), dayOffset);

        // Créer des créneaux de 8h à 18h par tranches de 30 minutes
        for (let hour = 8; hour < 18; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const startTime = setMinutes(setHours(currentDate, hour), minute);
            const endTime = setMinutes(
              setHours(currentDate, hour),
              minute + 30,
            );

            // Vérifier si le créneau existe déjà
            const existingSlot = await prisma.timeSlot.findFirst({
              where: {
                bakeryId: bakery.id,
                startTime: startTime,
                endTime: endTime,
              },
            });

            if (!existingSlot) {
              await prisma.timeSlot.create({
                data: {
                  startTime: startTime,
                  endTime: endTime,
                  maxOrders: 5, // 5 commandes max par créneau
                  isActive: true,
                  bakeryId: bakery.id,
                },
              });
            }
          }
        }
      }

      console.log(`✅ Créneaux créés pour ${bakery.name}`);
    }

    console.log("🎉 Tous les créneaux ont été créés avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la création des créneaux:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTimeSlots();
