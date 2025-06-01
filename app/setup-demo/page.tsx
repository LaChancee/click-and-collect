import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

async function setupDemoBakery() {
  "use server";

  try {
    // Vérifier si la boulangerie de démo existe déjà
    const existingBakery = await prisma.organization.findFirst({
      where: {
        slug: "les-delices-derwann",
      },
    });

    if (existingBakery) {
      console.log("La boulangerie de démo existe déjà");
      redirect("/?bakery=les-delices-derwann");
      return;
    }

    // Créer la boulangerie
    const bakery = await prisma.organization.create({
      data: {
        id: "demo-bakery-id",
        name: "Les délices d'Erwann",
        slug: "les-delices-derwann",
        description: "Boulangerie artisanale traditionnelle",
        address: "123 Rue de la Boulangerie, 75001 Paris",
        phone: "01 23 45 67 89",
        openingHours: "7h00 - 19h30",
        email: "contact@delices-erwann.fr",
        isBakery: true,
        createdAt: new Date(),
      },
    });

    // Créer les catégories
    const categories = await prisma.$transaction([
      prisma.category.create({
        data: {
          name: "Pains",
          slug: "pains",
          bakeryId: bakery.id,
          position: 0,
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: "Viennoiseries",
          slug: "viennoiseries",
          bakeryId: bakery.id,
          position: 1,
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: "Pâtisseries",
          slug: "patisseries",
          bakeryId: bakery.id,
          position: 2,
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: "Sandwichs",
          slug: "sandwichs",
          bakeryId: bakery.id,
          position: 3,
          isActive: true,
        },
      }),
    ]);

    // Créer les articles
    await prisma.$transaction([
      prisma.article.create({
        data: {
          name: "Croissant au beurre",
          slug: "croissant-au-beurre-demo",
          description: "Délicieux croissant pur beurre, croustillant à l'extérieur, moelleux à l'intérieur",
          price: 1.20,
          imageUrl: "https://images.unsplash.com/photo-1549312195-99d891b2ecbb?w=400",
          isActive: true,
          isAvailable: true,
          stockCount: 15,
          position: 0,
          categoryId: categories[1].id, // Viennoiseries
          bakeryId: bakery.id,
        },
      }),
      prisma.article.create({
        data: {
          name: "Pain de campagne",
          slug: "pain-de-campagne-demo",
          description: "Pain traditionnel au levain, cuit au feu de bois",
          price: 3.50,
          imageUrl: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400",
          isActive: true,
          isAvailable: true,
          stockCount: 8,
          position: 0,
          categoryId: categories[0].id, // Pains
          bakeryId: bakery.id,
        },
      }),
      prisma.article.create({
        data: {
          name: "Éclair au chocolat",
          slug: "eclair-au-chocolat-demo",
          description: "Pâte à choux garnie de crème pâtissière au chocolat",
          price: 2.80,
          imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
          isActive: true,
          isAvailable: true,
          stockCount: 12,
          position: 0,
          categoryId: categories[2].id, // Pâtisseries
          bakeryId: bakery.id,
        },
      }),
      prisma.article.create({
        data: {
          name: "Sandwich jambon-beurre",
          slug: "sandwich-jambon-beurre-demo",
          description: "Pain traditionnel, jambon de pays, beurre salé",
          price: 4.50,
          imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400",
          isActive: true,
          isAvailable: true,
          stockCount: 6,
          position: 0,
          categoryId: categories[3].id, // Sandwichs
          bakeryId: bakery.id,
        },
      }),
    ]);

    console.log("Boulangerie de démo créée avec succès");
    redirect("/?bakery=les-delices-derwann");

  } catch (error) {
    console.error("Erreur lors de la création de la boulangerie de démo:", error);
    throw error;
  }
}

export default function SetupDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Configuration de la démo
        </h1>
        <p className="text-gray-600 mb-6">
          Cliquez sur le bouton ci-dessous pour créer une boulangerie de démonstration
          avec des articles d'exemple.
        </p>
        <form action={setupDemoBakery}>
          <Button type="submit" size="lg">
            Créer la boulangerie de démo
          </Button>
        </form>
      </div>
    </div>
  );
} 