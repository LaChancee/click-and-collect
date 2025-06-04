import { RefreshPage } from "@/components/utils/refresh-page";
import { auth } from "@/lib/auth";
import { orgMetadata } from "@/lib/metadata";
import { getCurrentOrg } from "@/lib/organizations/get-org";
import type { LayoutParams } from "@/types/next";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { InjectCurrentOrgStore } from "./use-current-org";
import { getRequiredBakeryUser } from "@/lib/auth/auth-user";
import { redirect } from "next/navigation";

export async function generateMetadata(
  props: LayoutParams<{ orgSlug: string }>,
): Promise<Metadata> {
  const params = await props.params;
  return orgMetadata(params.orgSlug);
}

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  const params = await props.params;

  try {
    // Vérifier que l'utilisateur connecté est bien une boulangerie
    const bakeryUser = await getRequiredBakeryUser();

    // Vérifier que l'utilisateur a accès à cette organisation
    if (bakeryUser.bakery.slug !== params.orgSlug) {
      // L'utilisateur n'a pas accès à cette organisation
      redirect(`/orgs/${bakeryUser.bakery.slug}`);
    }
  } catch (error) {
    // L'utilisateur n'est pas une boulangerie ou n'est pas connecté
    // Le rediriger vers la page d'authentification
    redirect("/auth?message=bakery-access-required");
  }

  const org = await getCurrentOrg();

  // The user try to go to another organization, we must sync with the URL
  if (org?.slug !== params.orgSlug) {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationSlug: params.orgSlug,
      },
    });
    // Make a full refresh of the page
    return <RefreshPage />;
  }

  return (
    <InjectCurrentOrgStore
      org={{
        id: org.id,
        slug: org.slug,
        name: org.name,
        image: org.logo ?? null,
        subscription: null,
      }}
    >
      {props.children}
    </InjectCurrentOrgStore>
  );
}
