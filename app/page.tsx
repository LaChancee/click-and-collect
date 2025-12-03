import { Suspense } from "react";
import { ShopClient } from "./shop/_components/ShopClient";
import { getBakeryDataAction } from "./shop/_actions/get-bakery-data.action";
import { getBakeryUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Store, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function HomePage(props: PageParams) {
  // Vérifier si l'utilisateur connecté est une boulangerie
  const bakeryUser = await getBakeryUser();

  if (bakeryUser) {
    // Rediriger les boulangeries vers leur espace d'administration
    redirect(`/orgs/${bakeryUser.bakery.slug}`);
  }

  // Récupérer LA boulangerie unique (il ne peut y en avoir qu'une)
  const bakery = await prisma.organization.findFirst({
    where: {
      isBakery: true,
    },
    select: {
      slug: true,
      name: true,
      description: true,
      address: true,
    },
  });

  if (!bakery?.slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="text-center max-w-lg bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Store className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bientôt disponible !
            </h1>
            <p className="text-gray-600 mb-6">
              Notre service Click & Collect sera bientôt en ligne.
              Créez votre compte dès maintenant pour être prêt dès l'ouverture !
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/signin">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Créer mon compte
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Vous avez déjà un compte ?
              <Link href="/auth/signin" className="text-blue-600 hover:underline ml-1">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Charger les données de LA boulangerie
  try {
    const { bakery: bakeryData, categories, articles } = await getBakeryDataAction(bakery.slug);

    return (
      <ShopClient
        bakery={bakeryData}
        categories={categories}
        articles={articles}
      />
    );
  } catch (error) {
    console.error("Erreur lors du chargement de la boulangerie:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Service temporairement indisponible
          </h1>
          <p className="text-gray-600 mb-6">
            Nous rencontrons actuellement des difficultés techniques. Veuillez réessayer dans quelques instants.
          </p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
}
