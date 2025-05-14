import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import { CategoryForm } from "../CategoryForm";
import { prisma } from "@/lib/prisma";

export default async function RoutePage(props: PageParams<{ orgSlug: string }>) {
  const params = await props.params;
  const orgSlug = params.orgSlug;

  const org = await prisma.organization.findUnique({
    where: {
      slug: orgSlug,
    },
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Créer une catégorie</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <CategoryForm orgSlug={orgSlug} orgId={org?.id} />
      </LayoutContent>
    </Layout>
  );
} 