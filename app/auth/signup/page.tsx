import { redirect } from "next/navigation";
import type { PageParams } from "@/types/next";

export default async function AuthSignUpPage(props: PageParams) {
  // Rediriger vers /auth/signin avec le paramètre mode=signup
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl as string;

  const params = new URLSearchParams();
  params.set("mode", "signup");
  if (callbackUrl) {
    params.set("callbackUrl", callbackUrl);
  }

  redirect(`/auth/signin?${params.toString()}`);
}
