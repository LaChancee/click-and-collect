import { redirect } from "next/navigation";
import type { PageParams } from "@/types/next";

export default async function AuthSignUpPage(props: PageParams) {
  // Rediriger vers /auth/signin car le formulaire unifié gère maintenant connexion ET inscription
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl as string;

  redirect(`/auth/signin${callbackUrl ? `?callbackUrl=${callbackUrl}` : ""}`);
}
