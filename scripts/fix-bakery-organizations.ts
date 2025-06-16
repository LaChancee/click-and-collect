import { prisma } from "../src/lib/prisma";

async function fixBakeryOrganizations() {
  console.log("🔍 Vérification des organisations...");

  // Récupérer toutes les organisations
  const organizations = await prisma.organization.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  console.log(`📊 ${organizations.length} organisations trouvées`);

  // Mettre à jour toutes les organisations pour qu'elles soient des boulangeries
  // (vous pouvez ajuster cette logique selon vos besoins)
  for (const org of organizations) {
    if (!org.isBakery) {
      console.log(
        `🏪 Mise à jour de l'organisation: ${org.name} (${org.slug})`,
      );

      await prisma.organization.update({
        where: { id: org.id },
        data: {
          isBakery: true,
        },
      });

      console.log(`✅ Organisation ${org.name} mise à jour comme boulangerie`);
    } else {
      console.log(`✅ Organisation ${org.name} est déjà une boulangerie`);
    }
  }

  // Afficher un résumé
  const bakeries = await prisma.organization.findMany({
    where: { isBakery: true },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  console.log("\n📋 Résumé des boulangeries:");
  for (const bakery of bakeries) {
    console.log(`🏪 ${bakery.name} (${bakery.slug})`);
    console.log(`   Membres: ${bakery.members.length}`);
    for (const member of bakery.members) {
      console.log(
        `   - ${member.user.name} (${member.user.email}) - ${member.role}`,
      );
    }
    console.log("");
  }

  console.log("🎉 Correction terminée!");
}

fixBakeryOrganizations()
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
