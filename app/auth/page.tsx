import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUser } from "@/lib/auth/auth-user";
import { SiteConfig } from "@/site-config";
import { ChefHat, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { PageParams } from "@/types/next";

export default async function AuthChoicePage(props: PageParams) {
  const user = await getUser();

  if (user) {
    redirect("/orgs");
  }

  const searchParams = await props.searchParams;
  const message = searchParams?.message as string;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Avatar className="size-16 rounded-md">
              <AvatarImage src={SiteConfig.appIcon} alt="app logo" />
              <AvatarFallback>
                {SiteConfig.title.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur {SiteConfig.title}
          </h1>
          <p className="text-lg text-gray-600">
            Choisissez votre type de compte pour continuer
          </p>
        </div>

        {/* Message d'alerte si accès refusé */}
        {message === "bakery-access-required" && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Vous devez être connecté en tant que boulangerie pour accéder à cette page.
              Veuillez vous connecter avec votre compte boulangerie ou créer un compte.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Client Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/auth/signin">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Je suis un client</CardTitle>
                <CardDescription className="text-sm">
                  Je souhaite commander en Click & Collect
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Commander des produits frais
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Choisir un créneau de retrait
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Payer en ligne ou sur place
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Éviter les files d'attente
                  </li>
                </ul>
                <Button className="w-full" variant="default">
                  Se connecter en tant que client
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Bakery Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/auth/bakery">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <ChefHat className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Je suis une boulangerie</CardTitle>
                <CardDescription className="text-sm">
                  Je veux proposer mes produits en Click & Collect
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Gérer mon catalogue de produits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Suivre les commandes en temps réel
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Gérer les créneaux de retrait
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Optimiser mes ventes
                  </li>
                </ul>
                <Button className="w-full" variant="default">
                  Créer un compte boulangerie
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Vous avez déjà un compte ?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Se connecter directement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 