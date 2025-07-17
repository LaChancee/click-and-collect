import React from "react";
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
import { DataTable } from "./_components/DataTable";
import { Heading, EmptyState } from "./_components/UIComponents";
import { SeedCategoriesButton } from "./_components/SeedCategoriesButton";
import { prisma } from "@/lib/prisma";
import { ProductTableItem } from "./_components/columns";

// Définir explicitement le mode dynamique pour éviter la mise en cache
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ArticlesPage({
  params
}: {
  params: Promise<{ orgSlug: string }>
}) {
  // Extraire le slug de l'organisation
  const { orgSlug } = await params;


  // Récupérer les informations de l'organisation
  const currentOrg = await prisma.organization.findUnique({
    where: {
      slug: orgSlug,
    },
  });

  if (!currentOrg) {
    console.error(`Organisation avec slug '${orgSlug}' non trouvée`);

    // Rechercher l'organisation avec une recherche plus large
    const similarOrgs = await prisma.organization.findMany({
      take: 5,
      where: {
        slug: {
          contains: orgSlug.substring(0, 5)
        }
      },
    });

    if (similarOrgs.length > 0) {
      console.log("Organisations similaires trouvées:", similarOrgs.map(org => ({ id: org.id, slug: org.slug })));
    }

    return (
      <div className="container py-6 space-y-6 max-w-7xl mx-auto">
        <Heading
          title="Erreur"
          description="L'organisation demandée n'existe pas"
        />
      </div>
    );
  }

  console.log("Organisation trouvée:", {
    id: currentOrg.id,
    name: currentOrg.name,
    slug: currentOrg.slug,
    isBakery: currentOrg.isBakery,
  });

  // Vérifier s'il y a des catégories en base
  const allCategoriesCount = await prisma.category.count();
  console.log(`Nombre total de catégories en base: ${allCategoriesCount}`);

  if (allCategoriesCount === 0) {
    console.error("ERREUR: Aucune catégorie dans la base de données");
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

  console.log(`${categories.length} catégories trouvées pour l'organisation ${currentOrg.id}`);

  if (categories.length === 0) {
    // Vérifier s'il y a des catégories pour cette boulangerie, même inactives
    const inactiveCategories = await prisma.category.findMany({
      where: {
        bakeryId: currentOrg.id,
      },
    });

    if (inactiveCategories.length > 0) {
      console.log(`${inactiveCategories.length} catégories inactives trouvées pour cette organisation`);
    } else {
      console.log("Aucune catégorie (même inactive) pour cette organisation");
    }
  }

  // Vérifier s'il y a des articles en base
  const allArticlesCount = await prisma.article.count();
  console.log(`Nombre total d'articles en base: ${allArticlesCount}`);

  if (allArticlesCount === 0) {
    console.error("ERREUR: Aucun article dans la base de données");
  }

  // Récupérer tous les produits
  const articles = await prisma.article.findMany({
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

  console.log(`${articles.length} articles trouvés pour l'organisation ${currentOrg.id}`);

  if (articles.length === 0) {
    // Vérifier s'il existe des articles dans la base sans filtre
    const sampleArticles = await prisma.article.findMany({
      take: 5,
    });

    if (sampleArticles.length > 0) {
      console.log("Exemples d'articles en base:", sampleArticles.map(article => ({
        id: article.id,
        name: article.name,
        bakeryId: article.bakeryId
      })));
    }
  }

  // Mapping des catégories pour l'affichage
  const categoriesMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  // Formatter les données pour le tableau
  const tableData: ProductTableItem[] = articles.map(article => ({
    id: article.id,
    name: article.name,
    price: article.price.toString(),
    category: article.category?.name || "Sans catégorie",
    categoryId: article.categoryId || "",
    isActive: article.isActive,
    isAvailable: article.isAvailable,
    stockCount: article.stockCount,
    allergens: article.allergens.map((pa) => pa.allergen.name).join(", "),
    createdAt: article.createdAt,
    imageUrl: article.imageUrl,
    slug: article.slug,
  }));

  // Definition des colonnes pour DataTable
  const columns = [
    {
      id: "image",
      header: "Image",
    },
    {
      accessorKey: "name",
      header: "Nom du produit",
    },
    {
      accessorKey: "price",
      header: "Prix",
    },
    {
      accessorKey: "category",
      header: "Catégorie",
    },
    {
      accessorKey: "isActive",
      header: "Statut",
    },
    {
      accessorKey: "stockCount",
      header: "Stock",
    },
    {
      id: "actions",
      header: "Actions",
    }
  ];

  return (
    <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Heading
          title="Gestion des articles"
          description="Gérez les produits proposés par votre boulangerie"
        />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <SeedCategoriesButton
            orgId={currentOrg.id}
            orgSlug={orgSlug}
            hasCategories={categories.length > 0}
          />
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href={`/orgs/${orgSlug}/articles/categories/new`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ajouter une catégorie</span>
              <span className="sm:hidden">Nouvelle catégorie</span>
            </a>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <a href={`/orgs/${orgSlug}/articles/new`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Nouveau produit</span>
            </a>
          </Button>
        </div>
      </div>
      <Separator className="my-4 sm:my-6" />

      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="all" className="text-sm">Tous les produits</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-sm">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tous les produits</CardTitle>
              <CardDescription className="text-sm">
                {articles.length} produit{articles.length !== 1 ? 's' : ''} au total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {articles.length === 0 ? (
                <EmptyState
                  title="Aucun produit"
                  description={categories.length === 0
                    ? "Commencez par ajouter des catégories de base pour votre boulangerie, puis ajoutez vos premiers produits."
                    : "Vous n'avez pas encore créé de produits. Commencez par en ajouter un."
                  }
                  action={
                    categories.length === 0 ? (
                      <SeedCategoriesButton
                        orgId={currentOrg.id}
                        orgSlug={orgSlug}
                        hasCategories={false}
                      />
                    ) : (
                      <Button asChild>
                        <a href={`/orgs/${orgSlug}/articles/new`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un produit
                        </a>
                      </Button>
                    )
                  }
                />
              ) : (
                <DataTable
                  columns={columns}
                  data={tableData}
                  filterColumn="name"
                  searchPlaceholder="Rechercher un produit..."
                  categoriesMap={categoriesMap}
                  baseUrl={`/orgs/${orgSlug}/articles`}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription className="text-sm">
                  {articles.filter(
                    (article) => article.categoryId === category.id
                  ).length} produit{
                    articles.filter(
                      (article) => article.categoryId === category.id
                    ).length !== 1
                      ? 's'
                      : ''
                  } dans cette catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                {articles.filter(
                  (article) => article.categoryId === category.id
                ).length === 0 ? (
                  <EmptyState
                    title="Aucun produit dans cette catégorie"
                    description="Vous n'avez pas encore ajouté de produits dans cette catégorie."
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
                  <DataTable
                    columns={columns}
                    data={tableData.filter(article => article.categoryId === category.id)}
                    filterColumn="name"
                    searchPlaceholder="Rechercher un produit..."
                    categoriesMap={categoriesMap}
                    baseUrl={`/orgs/${orgSlug}/articles`}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
