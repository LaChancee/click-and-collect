import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { ArticleDetailForm } from "./_components/ArticleDetailForm";

export default async function ArticleDetailPage(props: PageParams<{ slug: string, orgSlug: string }>) {
  const { slug, orgSlug } = await props.params;

  // Fetch the article with its category and allergens
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      allergens: {
        include: {
          allergen: true
        }
      }
    }
  });

  if (!article) {
    return notFound();
  }

  // Convert Decimal price to number for the component
  const articleWithNumberPrice = {
    ...article,
    price: Number(article.price)
  };

  // Fetch all available allergens
  const allergens = await prisma.allergen.findMany({
    orderBy: { name: 'asc' }
  });

  // Get organization
  const org = await prisma.organization.findFirst({
    where: {
      slug: orgSlug,
    },
  });

  if (!org) {
    return notFound();
  }

  // Get all categories for the organization
  const categories = await prisma.category.findMany({
    where: {
      bakeryId: org.id,
    },
    orderBy: { position: "asc" },
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Détails du produit</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Informations produit</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <Card className="p-6">
              <ArticleDetailForm
                article={articleWithNumberPrice}
                allergens={allergens}
                categories={categories}
                orgSlug={orgSlug}
                orgId={org.id}
              />
            </Card>
          </TabsContent>
          <TabsContent value="stats">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-2">Statistiques du produit</h3>
              <p className="text-muted-foreground">
                Fonctionnalité à venir : statistiques de vente, popularité, etc.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </LayoutContent>
    </Layout>
  );
}