const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestTimeSlots() {
  try {
    console.log("🔍 Recherche des boulangeries...");

    // Récupérer toutes les organisations (boulangeries)
    const bakeries = await prisma.organization.findMany();

    if (bakeries.length === 0) {
      console.log("❌ Aucune boulangerie trouvée");
      return;
    }

    console.log(`✅ ${bakeries.length} boulangerie(s) trouvée(s)`);

    for (const bakery of bakeries) {
      console.log(
        `📅 Création de créneaux pour: ${bakery.name} (${bakery.slug})`,
      );

      // Créer des créneaux pour aujourd'hui et demain
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dates = [today, tomorrow];

      for (const date of dates) {
        // Créer des créneaux de 9h à 17h par tranches de 30 minutes
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const startTime = new Date(date);
            startTime.setHours(hour, minute, 0, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + 30);

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
                  maxOrders: 5,
                  isActive: true,
                  bakeryId: bakery.id,
                },
              });

              console.log(
                `  ✅ Créneau créé: ${startTime.toLocaleString()} - ${endTime.toLocaleString()}`,
              );
            }
          }
        }
      }
    }

    console.log("🎉 Tous les créneaux de test ont été créés !");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTimeSlots();
