import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Edit, Package, Euro } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout, LayoutActions, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";

export default async function MealDealsPage(props: PageParams<{ orgSlug: string }>) {
  const { orgSlug } = await props.params;

  // Get organization
  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true }
  });

  if (!organization) {
    return notFound();
  }

  // Fetch meal deals
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

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Formules ({mealDeals.length})</LayoutTitle>
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
        {mealDeals.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune formule</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première formule pour commencer
            </p>
            <Link href={`/orgs/${orgSlug}/meal-deals/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer une formule
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealDeals.map((mealDeal) => (
              <Card key={mealDeal.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{mealDeal.name}</CardTitle>
                    <Link href={`/orgs/${orgSlug}/meal-deals/${mealDeal.slug}`}>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  {mealDeal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mealDeal.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-lg font-medium">
                        {Number(mealDeal.price).toFixed(2)}€
                      </span>
                    </div>
                    <Badge variant={mealDeal.isActive ? "default" : "destructive"}>
                      {mealDeal.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {mealDeal._count.items} produit{mealDeal._count.items > 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </LayoutContent>
    </Layout>
  );
} 