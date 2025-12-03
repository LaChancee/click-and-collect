import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ShoppingBag } from "lucide-react";
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
  const mode = searchParams?.mode as string;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto px-4">
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
            <UnifiedAuthForm callbackUrl={callbackUrl} defaultMode={mode === "signup" ? "signup" : "signin"} />

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

      </div>
    </div>
  );
}
