import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import { Button } from "@/components/ui/button";
import { Layout, LayoutActions, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";

import { MealDealsDataTable } from "./meal-deals-data-table";

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

export default async function MealDealsPage(props: PageParams<{ orgSlug: string }>) {
  const { orgSlug } = await props.params;

  // Get organization ID first
  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true }
  });

  if (!organization) {
    return notFound();
  }

  // Fetch all meal deals for this bakery
  const mealDeals = await prisma.mealDeal.findMany({
    where: {
      bakeryId: organization.id
    },
    include: {
      _count: {
        select: {
          items: true
        }
      }
    },
    orderBy: {
      position: "asc"
    }
  });

  // Serialize the meal deals data
  const serializedMealDeals = serializeData(mealDeals);

  return (
    <Layout>
      <LayoutHeader>
          <LayoutTitle>Formules</LayoutTitle>
          <LayoutActions>
            <Link href={`/orgs/${orgSlug}/meal-deals/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer une formule
            </Button>
          </Link>
          </LayoutActions>
      </LayoutHeader>
      <LayoutContent>
        <MealDealsDataTable
          data={serializedMealDeals}
          orgSlug={orgSlug}
        />
      </LayoutContent>
    </Layout>
  );
} 