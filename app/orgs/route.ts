import { getBakeryUser, getUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { NextResponse } from "next/server";

/**
 * If a user arrive to `/orgs` we redirect them to the first organization they are part of.
 *
 * 💡 If you want to redirect user to organization page, redirect them to `/orgs`
 * 💡 If you want them to redirect to a specific organization, redirect them to `/orgs/orgSlug`
 */
export const GET = async () => {
  const user = await getUser();

  if (!user) {
    return NextResponse.redirect(`${getServerUrl()}/auth/signin`);
  }

  // Vérifier si l'utilisateur est une boulangerie
  const bakeryUser = await getBakeryUser();

  if (bakeryUser) {
    // Rediriger vers l'espace boulangerie
    return NextResponse.redirect(`${getServerUrl()}/orgs/${bakeryUser.bakery.slug}`);
  }

  // Pour les clients normaux, vérifier s'ils ont une organisation
  const organization = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (organization) {
    return NextResponse.redirect(`${getServerUrl()}/orgs/${organization.slug}`);
  }

  // Les clients sans organisation sont redirigés vers la page d'accueil (boutique)
  return NextResponse.redirect(`${getServerUrl()}/`);
};
