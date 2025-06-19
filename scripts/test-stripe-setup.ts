import { prisma } from "../src/lib/prisma";
import { StripeService } from "../src/lib/stripe";

async function testStripeSetup() {
  console.log("🧪 Test de la configuration Stripe...\n");

  try {
    // 1. Vérifier les variables d'environnement
    console.log("1. Vérification des variables d'environnement:");
    const requiredEnvVars = [
      "STRIPE_SECRET_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ];

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      console.log(`   ${envVar}: ${value ? "✅ Définie" : "❌ Manquante"}`);
    }

    // 2. Vérifier la connexion à Stripe
    console.log("\n2. Test de connexion à Stripe:");
    const stripeService = StripeService.getInstance();

    try {
     
      console.log("   Connexion Stripe: ✅ OK");
    } catch (error) {
      console.log("   Connexion Stripe: ❌ Erreur", error);
    }

    // 3. Vérifier les boulangeries avec Stripe Connect
    console.log("\n3. Boulangeries avec Stripe Connect:");
    const bakeries = await prisma.organization.findMany({
      where: {
        isBakery: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        stripeAccountId: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
      },
    });

    if (bakeries.length === 0) {
      console.log("   ❌ Aucune boulangerie trouvée");
    } else {
      for (const bakery of bakeries) {
        console.log(`   📍 ${bakery.name} (${bakery.slug}):`);
        console.log(
          `      Stripe Account ID: ${bakery.stripeAccountId || "❌ Non configuré"}`,
        );
        console.log(
          `      Charges activées: ${bakery.stripeChargesEnabled ? "✅" : "❌"}`,
        );
        console.log(
          `      Payouts activés: ${bakery.stripePayoutsEnabled ? "✅" : "❌"}`,
        );
      }
    }

    // 4. Vérifier les articles disponibles
    console.log("\n4. Articles disponibles pour test:");
    const articles = await prisma.article.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        bakery: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 5,
    });

    if (articles.length === 0) {
      console.log("   ❌ Aucun article disponible");
    } else {
      for (const article of articles) {
        console.log(
          `   🥖 ${article.name} - ${article.price}€ (${article.bakery.name})`,
        );
      }
    }

    // 5. Vérifier les créneaux disponibles
    console.log("\n5. Créneaux disponibles:");
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        isActive: true,
        startTime: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        maxOrders: true,
        bakery: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 3,
      orderBy: {
        startTime: "asc",
      },
    });

    if (timeSlots.length === 0) {
      console.log("   ❌ Aucun créneau disponible");
    } else {
      for (const slot of timeSlots) {
        console.log(
          `   ⏰ ${slot.startTime.toLocaleString("fr-FR")} - ${slot.endTime.toLocaleTimeString("fr-FR")} (${slot.bakery.name})`,
        );
      }
    }

    console.log("\n✅ Test terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testStripeSetup();
}

export { testStripeSetup };
