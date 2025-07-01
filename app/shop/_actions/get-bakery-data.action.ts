"use server";

import { prisma } from "@/lib/prisma";

// Fonction pour sérialiser les objets avec Decimal
function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "object" &&
      value !== null &&
      typeof value.toJSON === "function"
        ? value.toJSON()
        : value,
    ),
  );
}

export async function getBakeryDataAction(bakerySlug: string) {
  try {
    // Récupérer la boulangerie par son slug
    const bakery = await prisma.organization.findUnique({
      where: {
        slug: bakerySlug,
        isBakery: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        phone: true,
        openingHours: true,
        email: true,
        logo: true,
      },
    });

    if (!bakery) {
      throw new Error("Boulangerie non trouvée");
    }

    // Récupérer les catégories actives
    const categories = await prisma.category.findMany({
      where: {
        bakeryId: bakery.id,
        isActive: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    // Récupérer les articles actifs et disponibles
    const articles = await prisma.article.findMany({
      where: {
        bakeryId: bakery.id,
        isActive: true,
        isAvailable: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        allergens: {
          include: {
            allergen: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          category: {
            position: "asc",
          },
        },
        { position: "asc" },
      ],
    });

    return serializeData({
      bakery,
      categories,
      articles,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    throw new Error("Impossible de récupérer les données de la boulangerie");
  }
}
