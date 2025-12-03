import { redirect } from "next/navigation";

export default async function AuthPage() {
  // Rediriger directement vers la page de connexion
  redirect("/auth/signin");
} 