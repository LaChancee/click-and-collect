import { Suspense } from "react";
import { ShopHeader } from "./shop/_components/ShopHeader";
import { CategoryTabs } from "./shop/_components/CategoryTabs";
import { ArticleGrid } from "./shop/_components/ArticleGrid";
import { CartSidebar } from "./shop/_components/CartSidebar";
import { LoadingSpinner } from "./shop/_components/LoadingSpinner";
import { getBakeryDataAction } from "./shop/_actions/get-bakery-data.action";
import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";

export default async function HomePage(props: PageParams) {
  // Essayer de récupérer un slug de boulangerie depuis les query params
  const searchParams = await props.searchParams;
  let bakerySlug = searchParams?.bakery as string;

  // Si aucun slug fourni, prendre la première boulangerie disponible
  if (!bakerySlug) {
    const firstBakery = await prisma.organization.findFirst({
      where: {
        isBakery: true,
      },
      select: {
        slug: true,
      },
    });

    if (!firstBakery?.slug) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Aucune boulangerie disponible
            </h1>
            <p className="text-gray-600">
              Veuillez créer une boulangerie depuis l'interface d'administration.
            </p>
          </div>
        </div>
      );
    }

    bakerySlug = firstBakery.slug;
  }

  try {
    const data = await getBakeryDataAction(bakerySlug);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <ShopHeader bakery={data.bakery} />

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {/* Content Area */}
            <div className="flex-1 py-8">
              <Suspense fallback={<LoadingSpinner />}>
                <CategoryTabs categories={data.categories} />
                <ArticleGrid articles={data.articles} categories={data.categories} />
              </Suspense>
            </div>

            {/* Cart Sidebar - Fixed on desktop, drawer on mobile */}
            <CartSidebar />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600">
            Impossible de charger les données de la boulangerie.
          </p>
        </div>
      </div>
    );
  }
}
