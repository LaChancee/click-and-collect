import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { OrgDetailsForm } from "./(details)/org-details-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StripeConnectButton } from "./stripe/_components/StripeConnectButton";
import { StripeAccountStatus } from "./stripe/_components/StripeAccountStatus";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle, LayoutDescription } from "@/features/page/layout";

export default async function RoutePage(props: PageParams) {
  const currentOrg = await getRequiredCurrentOrgCache({
    permissions: {
      organization: ["update"],
    },
  });

  const org = await prisma.organization.findUnique({
    where: {
      id: currentOrg.id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      email: true,
      stripeAccountId: true,
      stripeAccountStatus: true,
      stripeChargesEnabled: true,
      stripePayoutsEnabled: true,
      stripeOnboardingUrl: true,
    },
  });

  if (!org) {
    notFound();
  }

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Paramètres</LayoutTitle>
        <LayoutDescription>
          Gérez les paramètres de votre boulangerie
        </LayoutDescription>
      </LayoutHeader>

      <LayoutContent>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="danger">Zone de danger</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la boulangerie</CardTitle>
                <CardDescription>
                  Modifiez les informations de base de votre boulangerie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrgDetailsForm defaultValues={{
                  logo: org.logo,
                  name: org.name,
                  email: org.email,
                }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Stripe</CardTitle>
                <CardDescription>
                  Configurez votre compte Stripe pour recevoir les paiements de vos clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {org.stripeAccountId ? (
                  <StripeAccountStatus
                    organization={{
                      id: org.id,
                      name: org.name,
                      slug: org.slug,
                      stripeAccountId: org.stripeAccountId,
                      stripeAccountStatus: org.stripeAccountStatus,
                      stripeChargesEnabled: org.stripeChargesEnabled,
                      stripePayoutsEnabled: org.stripePayoutsEnabled,
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold mb-2">
                        Connectez votre compte Stripe
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Pour recevoir les paiements de vos clients, vous devez connecter votre compte Stripe.
                      </p>
                      <StripeConnectButton />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zone de danger</CardTitle>
                <CardDescription>
                  Actions irréversibles pour votre boulangerie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Les actions de cette section sont irréversibles. Procédez avec prudence.
                </p>
                {/* Ici vous pouvez ajouter des actions dangereuses comme supprimer l'organisation */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </LayoutContent>
    </Layout>
  );
}
