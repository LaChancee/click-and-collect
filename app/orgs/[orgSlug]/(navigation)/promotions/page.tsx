import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import { Button } from "@/components/ui/button";
import { Layout, LayoutActions, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";

import { PromotionsDataTable } from "./promotions-data-table";

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

export default async function PromotionsPage(props: PageParams<{ orgSlug: string }>) {
  const { orgSlug } = await props.params;

  // Get organization ID first
  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true }
  });

  if (!organization) {
    return notFound();
  }

  // Fetch all promotions for this bakery
  const promotions = await prisma.promotion.findMany({
    where: {
      bakeryId: organization.id
    },
    include: {
      _count: {
        select: {
          articles: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Serialize the promotions data
  const serializedPromotions = serializeData(promotions);

  return (
    <Layout>
      <LayoutHeader>
          <LayoutTitle>Promotions</LayoutTitle>
          <LayoutActions>
            <Link href={`/orgs/${orgSlug}/promotions/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
              Créer une promotion
            </Button>
          </Link>
          </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        <PromotionsDataTable
          data={serializedPromotions}
          orgSlug={orgSlug}
        />
      </LayoutContent>
    </Layout>
  );
} 