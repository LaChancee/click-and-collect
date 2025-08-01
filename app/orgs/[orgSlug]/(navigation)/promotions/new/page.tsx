import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";

import PromotionForm from "../PromotionForm";

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

export default async function NewPromotionPage(props: PageParams<{ orgSlug: string }>) {
  const { orgSlug } = await props.params;

  // Get organization ID first
  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true }
  });

  if (!organization) {
    return notFound();
  }

  // Fetch all articles for this bakery
  const articles = await prisma.article.findMany({
    where: {
      bakeryId: organization.id,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      categoryId: true,
      category: {
        select: {
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

  // Serialize the articles data
  const serializedArticles = serializeData(articles);

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center gap-4">
          <Link
            href={`/orgs/${orgSlug}/promotions`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
          <LayoutTitle>
            Nouvelle promotion
          </LayoutTitle>
        </div>
      </LayoutHeader>
      <LayoutContent>
        <div className="max-w-4xl mx-auto">
          <PromotionForm
            orgId={organization.id}
            orgSlug={orgSlug}
            articles={serializedArticles}
          />
        </div>
      </LayoutContent>
    </Layout>
  );
} 