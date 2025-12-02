import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Divider } from "@/components/nowts/divider";
import { SocialProviders } from "@/lib/auth";
import { getUser } from "@/lib/auth/auth-user";
import { SiteConfig } from "@/site-config";
import type { PageParams } from "@/types/next";
import { ArrowLeft, ChefHat, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProviderButton } from "./provider-button";
import { UnifiedAuthForm } from "./unified-auth-form";

export default async function AuthSignInPage(props: PageParams) {
  const user = await getUser();

  if (user) {
    redirect("/orgs");
  }

  const providers = Object.keys(SocialProviders ?? {});
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl as string;

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
            <CardTitle className="text-xl">Espace Client</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour commander
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <UnifiedAuthForm callbackUrl={callbackUrl} />

            {providers.length > 0 && (
              <>
                <Divider>ou</Divider>
                <div className="flex flex-col gap-2">
                  {providers.includes("github") ? (
                    <ProviderButton providerId="github" callbackUrl={callbackUrl} />
                  ) : null}
                  {providers.includes("google") ? (
                    <ProviderButton providerId="google" callbackUrl={callbackUrl} />
                  ) : null}
                </div>
              </>
            )}
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
