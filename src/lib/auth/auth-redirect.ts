import { redirect } from "next/navigation";
import { getBakeryUser, getUser } from "./auth-user";

/**
 * Redirige l'utilisateur vers la bonne page selon son type
 * @param fallbackUrl URL par défaut si aucune redirection spécifique
 */
export const redirectUserByType = async (fallbackUrl: string = "/account") => {
  const user = await getUser();

  if (!user) {
    return; // Pas d'utilisateur connecté
  }

  const bakeryUser = await getBakeryUser();

  if (bakeryUser) {
    // L'utilisateur est une boulangerie, rediriger vers son espace
    redirect(`/orgs/${bakeryUser.bakery.slug}`);
  }

  // L'utilisateur est un client, rediriger vers son espace client
  redirect(fallbackUrl);
};

/**
 * Vérifie si l'utilisateur connecté est autorisé à accéder à une page boulangerie
 */
export const requireBakeryAccess = async () => {
  const bakeryUser = await getBakeryUser();

  if (!bakeryUser) {
    // Rediriger vers la page de connexion boulangerie ou d'accueil
    redirect("/auth?message=bakery-access-required");
  }

  return bakeryUser;
};

/**
 * Obtient l'URL de redirection appropriée après connexion selon le type d'utilisateur
 */
export const getPostLoginRedirectUrl = async (
  defaultUrl: string = "/account",
): Promise<string> => {
  const bakeryUser = await getBakeryUser();

  if (bakeryUser) {
    return `/orgs/${bakeryUser.bakery.slug}`;
  }

  return defaultUrl;
};
