import { Suspense } from "react";
import { ShopClient } from "./shop/_components/ShopClient";
import { getBakeryDataAction } from "./shop/_actions/get-bakery-data.action";
import { getBakeryUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import Link from "next/link";

export default async function HomePage(props: PageParams) {
  // Vérifier si l'utilisateur connecté est une boulangerie
  const bakeryUser = await getBakeryUser();

  if (bakeryUser) {
    // Rediriger les boulangeries vers leur espace d'administration
    redirect(`/orgs/${bakeryUser.bakery.slug}`);
  }

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
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Aucune boulangerie disponible
            </h1>
            <p className="text-gray-600 mb-6">
              Aucune boulangerie n'est encore inscrite sur notre plateforme.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Vous souhaitez vous connecter ou vous inscrire ?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth">
                  <Button variant="outline" className="flex items-center gap-2">
                    Se connecter / S'inscrire
                  </Button>
                </Link>
                <Link href="/auth/bakery">
                  <Button className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    Créer un compte boulangerie
                  </Button>
                </Link>
                <Link href="/setup-demo">
                  <Button variant="secondary" className="flex items-center gap-2">
                    Créer une démo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    bakerySlug = firstBakery.slug;
  }

  try {
    const { bakery, categories, articles } = await getBakeryDataAction(bakerySlug);

    return (
      <ShopClient
        bakery={bakery}
        categories={categories}
        articles={articles}
      />
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de charger les données de la boulangerie.
          </p>
          <div className="space-y-3">
            <Link href="/setup-demo">
              <Button variant="secondary">
                Créer une boulangerie de démo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
