import React from "react";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProductColumns, type ProductTableItem } from "./_components/columns";

import { prisma } from "@/lib/prisma";
// Composants qui seront à créer séparément
const DataTable = ({ columns, data, filterColumn, searchPlaceholder, categoriesMap, baseUrl }: any) => {
  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full max-w-sm p-2 border rounded-md"
        />
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column: any) => (
              <th key={column.id || column.accessorKey} className="p-2 text-left">
                {typeof column.header === 'function'
                  ? column.header({ column })
                  : column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <tr key={i} className="border-t">
              {columns.map((column: any) => (
                <td key={column.id || column.accessorKey} className="p-2">
                  {column.cell ? column.cell({ row: { original: row, getValue: (key: string) => row[key] } }) : row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Heading = ({ title, description }: { title: string, description: string }) => (
  <div>
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-gray-500">{description}</p>
  </div>
);

const EmptyState = ({ title, description, action }: { title: string, description: string, action: React.ReactNode }) => (
  <div className="text-center p-8 border rounded-lg">
    <h3 className="font-medium text-lg">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    {action}
  </div>
);

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ArticlesPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const { orgSlug } = await params;
   const currentOrg = await prisma.organization.findUnique({
    where: {
      slug: orgSlug,
    },
   })

  ;

  if (!currentOrg) {
    redirect("/orgs");
  }

  // Vérifier la boulangerie en une seule étape
  if (!currentOrg?.metadata || !JSON.parse(currentOrg.metadata as string).isBakery) {
    redirect(`/orgs/${orgSlug}`);
  }

  // Récupérer les catégories pour le filtrage
  const categories = await prisma.category.findMany({
    where: {
      bakeryId: currentOrg.id,
      isActive: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  // Récupérer tous les produits
  const products = await prisma.product.findMany({
    where: {
      bakeryId: currentOrg.id,
    },
    include: {
      category: true,
      allergens: {
        include: {
          allergen: true,
        },
      },
    },
    orderBy: [
      {
        isActive: "desc",
      },
      {
        position: "asc",
      },
    ],
  });

  // Préparation pour le DataTable
  const formattedProducts: ProductTableItem[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price.toString(),
    category: product.category.name,
    categoryId: product.categoryId,
    isActive: product.isActive,
    isAvailable: product.isAvailable,
    stockCount: product.stockCount,
    allergens: product.allergens.map((pa) => pa.allergen.name).join(", "),
    createdAt: product.createdAt,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Gestion des articles"
          description="Gérez les produits proposés par votre boulangerie"
        />
        <Button asChild>
          <a href={`/orgs/${orgSlug}/articles/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </a>
        </Button>
      </div>
      <Separator />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous les produits</TabsTrigger>
          <TabsTrigger value="active">Produits actifs</TabsTrigger>
          <TabsTrigger value="inactive">Produits inactifs</TabsTrigger>
          <TabsTrigger value="stock">Stock faible</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {formattedProducts.length === 0 ? (
            <EmptyState
              title="Aucun produit"
              description="Vous n'avez pas encore ajouté de produits."
              action={
                <Button asChild>
                  <a href={`/orgs/${orgSlug}/articles/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un produit
                  </a>
                </Button>
              }
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Tous les produits</CardTitle>
                <CardDescription>
                  Liste complète des produits de votre boulangerie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={ProductColumns}
                  data={formattedProducts}
                  filterColumn="name"
                  searchPlaceholder="Rechercher un produit..."
                  categoriesMap={categories.reduce((acc, category) => {
                    acc[category.id] = category.name;
                    return acc;
                  }, {} as Record<string, string>)}
                  baseUrl={`/orgs/${orgSlug}/articles`}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produits actifs</CardTitle>
              <CardDescription>
                Produits actuellement disponibles à la vente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={ProductColumns}
                data={formattedProducts.filter((p) => p.isActive)}
                filterColumn="name"
                searchPlaceholder="Rechercher un produit..."
                categoriesMap={categories.reduce((acc, category) => {
                  acc[category.id] = category.name;
                  return acc;
                }, {} as Record<string, string>)}
                  baseUrl={`/orgs/${orgSlug}/articles`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produits inactifs</CardTitle>
              <CardDescription>
                Produits temporairement retirés de la vente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={ProductColumns}
                data={formattedProducts.filter((p) => !p.isActive)}
                filterColumn="name"
                searchPlaceholder="Rechercher un produit..."
                categoriesMap={categories.reduce((acc, category) => {
                  acc[category.id] = category.name;
                  return acc;
                }, {} as Record<string, string>)}
                  baseUrl={`/orgs/${orgSlug}/articles`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock faible</CardTitle>
              <CardDescription>
                Produits disponibles en quantités limitées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={ProductColumns}
                data={formattedProducts.filter(
                  (p) => p.stockCount !== null && p.stockCount < 10 && p.isActive
                )}
                filterColumn="name"
                searchPlaceholder="Rechercher un produit..."
                categoriesMap={categories.reduce((acc, category) => {
                  acc[category.id] = category.name;
                  return acc;
                }, {} as Record<string, string>)}
                baseUrl={`/orgs/${orgSlug}/articles`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
