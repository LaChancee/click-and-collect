import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { ArticleDetailForm } from "./_components/ArticleDetailForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ArticleDetailPage(props: PageParams<{ slug: string, orgSlug: string }>) {
  const { slug, orgSlug } = await props.params;

  // Get organization ID first
  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true }
  });

  if (!organization) {
    return notFound();
  }

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
    orderBy: {
      name: 'asc'
    }
  });

  // Fetch all categories
  const categories = await prisma.category.findMany({
    where: {
      bakeryId: organization.id,
      isActive: true
    },
    orderBy: {
      position: 'asc'
    }
  });

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center gap-4">
          <Link
            href={`/orgs/${orgSlug}/articles`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
          <LayoutTitle>
            Détails du produit: {article.name}
          </LayoutTitle>
        </div>
      </LayoutHeader>
      <LayoutContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Détails du produit</TabsTrigger>
            <TabsTrigger value="stats" disabled>Statistiques</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <ArticleDetailForm
              article={articleWithNumberPrice}
              allergens={allergens}
              categories={categories}
              orgSlug={orgSlug}
              orgId={organization.id}
            />
          </TabsContent>
        </Tabs>
      </LayoutContent>
    </Layout>
  );
}