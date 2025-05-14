import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AllergenSeedButton } from "./_components/allergen-seed-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AllergensPage(props: PageParams<{ orgSlug: string }>) {
  const { orgSlug } = await props.params;

  // Récupérer tous les allergènes existants
  const allergens = await prisma.allergen.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Gestion des allergènes</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Liste des allergènes</CardTitle>
              <CardDescription>
                Ces allergènes peuvent être associés aux produits pour informer vos clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <AllergenSeedButton orgSlug={orgSlug} />
              </div>

              {allergens.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Aucun allergène n'a été ajouté.</p>
                  <p>Vous pouvez initialiser la liste standard des allergènes en utilisant le bouton ci-dessus.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allergens.map((allergen) => (
                      <TableRow key={allergen.id}>
                        <TableCell className="font-medium">{allergen.name}</TableCell>
                        <TableCell>{allergen.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </LayoutContent>
    </Layout>
  );
} 