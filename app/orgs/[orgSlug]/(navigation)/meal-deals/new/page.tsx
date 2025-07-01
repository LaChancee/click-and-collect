import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";

import MealDealForm from "../MealDealForm";

// Fonction pour sérialiser les objets avec Decimal
function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "object" &&
        value !== null &&
        typeof value.toJSON === "function"
        ? value.toJSON()
        : value,
    ),
  );
}

export default async function NewMealDealPage(props: PageParams<{ orgSlug: string }>) {
  const { orgSlug } = await props.params;

  // Get organization ID first
  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true }
  });

  if (!organization) {
    return notFound();
  }

  // Fetch all active articles for this bakery
  const articles = await prisma.article.findMany({
    where: {
      bakeryId: organization.id,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      price: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      {
        category: {
          position: 'asc'
        }
      },
      { position: 'asc' }
    ]
  });

  // Fetch all active categories for this bakery
  const categories = await prisma.category.findMany({
    where: {
      bakeryId: organization.id,
      isActive: true
    },
    select: {
      id: true,
      name: true
    },
    orderBy: {
      position: 'asc'
    }
  });

  // Serialize the data
  const serializedArticles = serializeData(articles);
  const serializedCategories = serializeData(categories);

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center gap-4">
          <Link
            href={`/orgs/${orgSlug}/meal-deals`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
          <LayoutTitle>
            Nouvelle formule
          </LayoutTitle>
        </div>
      </LayoutHeader>
      <LayoutContent>
        <div className="max-w-7xl mx-auto">
          <MealDealForm
            orgId={organization.id}
            orgSlug={orgSlug}
            articles={serializedArticles}
            categories={serializedCategories}
          />
        </div>
      </LayoutContent>
    </Layout>
  );
} 