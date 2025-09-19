import { getRequiredUser, getBakeryUser } from "@/lib/auth/auth-user";
import type { LayoutParams } from "@/types/next";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNavigation } from "./account-navigation";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account settings.",
};

export default async function RouteLayout(props: LayoutParams) {
  await getRequiredUser();

  // Vérifier si l'utilisateur est une boulangerie
  const bakeryUser = await getBakeryUser();

  if (bakeryUser) {
    // Les boulangeries doivent être redirigées vers leur espace
    redirect(`/orgs/${bakeryUser.bakery.slug}`);
  }

  return <AccountNavigation>{props.children}</AccountNavigation>;
}
