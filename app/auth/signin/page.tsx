import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SocialProviders } from "@/lib/auth";
import { getUser } from "@/lib/auth/auth-user";
import { SiteConfig } from "@/site-config";
import type { PageParams } from "@/types/next";
import { ArrowLeft, ChefHat, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInProviders } from "./sign-in-providers";

export default async function AuthSignInPage(props: PageParams) {
  const user = await getUser();

  if (user) {
    redirect("/orgs");
  }

  const providers = Object.keys(SocialProviders ?? {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Back to choice button */}
        <div className="mb-6">
          <Link
            href="/auth"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au choix
          </Link>
        </div>

        <Card className="lg:p-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Connexion Client</CardTitle>
            <CardDescription>
              Connectez-vous pour commander en Click & Collect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SignInProviders providers={providers} />

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Vous n'avez pas encore de compte client ?
              </p>
              <p className="text-xs text-gray-500">
                L'inscription se fait automatiquement lors de votre première commande
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bakery section */}
        <Card className="mt-6 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-center">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  Vous êtes une boulangerie ?
                </p>
                <p className="text-xs text-gray-600">
                  Créez votre espace professionnel
                </p>
              </div>
              <Link
                href="/auth/bakery"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                S'inscrire
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
