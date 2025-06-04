import { Loader } from "@/components/nowts/loader";
import { Typography } from "@/components/nowts/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth/auth-user";
import { SiteConfig } from "@/site-config";
import { ArrowLeft, ChefHat } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BakerySignUpForm } from "./bakery-signup-form";

export default async function BakerySignUpPage() {
  const user = await getUser();

  if (user) {
    redirect("/orgs");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg mx-auto px-4">
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
          <CardHeader className="flex flex-col items-center justify-center gap-1">
            <div className="p-3 bg-orange-100 rounded-lg mb-4">
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle>Créer un compte boulangerie</CardTitle>
            <CardDescription className="text-center">
              Rejoignez notre plateforme et proposez vos produits en Click & Collect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Loader />}>
              <BakerySignUpForm />
            </Suspense>

            <Typography variant="muted" className="mt-4 text-xs text-center">
              Vous avez déjà un compte boulangerie ?{" "}
              <Typography variant="link" as={Link} href="/auth/signin">
                Se connecter
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 