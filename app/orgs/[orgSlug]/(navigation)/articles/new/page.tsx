import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import { ProductForm } from "./ProductForm";

export default async function RoutePage(props: PageParams<{ orgSlug: string }>) {
  const params = await props.params;
  const orgSlug = params.orgSlug;

  
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Créer un article</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <ProductForm orgSlug={orgSlug} />
      </LayoutContent>
    </Layout>
  );
}