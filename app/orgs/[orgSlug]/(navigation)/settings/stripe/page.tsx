import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRequiredCurrentOrg } from "@/lib/organizations/get-org";
import { StripeConnectButton } from "./_components/StripeConnectButton";
import { StripeAccountStatus } from "./_components/StripeAccountStatus";
import { CheckCircle, AlertCircle, Clock, CreditCard } from "lucide-react";

export default async function StripeSettingsPage() {
  const organization = await getRequiredCurrentOrg();

  if (!organization.isBakery) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Cette page est réservée aux boulangeries.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!organization.stripeAccountId) {
      return <Badge variant="secondary">Non configuré</Badge>;
    }

    switch (organization.stripeAccountStatus) {
      case 'enabled':
        return <Badge variant="default" className="bg-green-500">Actif</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="destructive">Problème</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!organization.stripeAccountId) {
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }

    switch (organization.stripeAccountStatus) {
      case 'enabled':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuration Stripe</h1>
        <p className="text-gray-600 mt-2">
          Configurez votre compte Stripe pour recevoir les paiements directement.
        </p>
      </div>

      {/* Statut actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon()}
            Statut de votre compte Stripe
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!organization.stripeAccountId ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Vous n'avez pas encore configuré votre compte Stripe.
                Connectez votre compte pour commencer à recevoir des paiements.
              </p>
              <StripeConnectButton />
            </div>
          ) : (
            <StripeAccountStatus organization={organization} />
          )}
        </CardContent>
      </Card>

      {/* Informations sur les paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Comment ça fonctionne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600 mb-2">✅ Paiements directs</h3>
              <p className="text-sm text-gray-600">
                Les paiements vont directement sur votre compte bancaire,
                sans passer par nous.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600 mb-2">💳 Sécurisé</h3>
              <p className="text-sm text-gray-600">
                Stripe gère la sécurité et la conformité PCI pour tous les paiements.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-purple-600 mb-2">📊 Transparence</h3>
              <p className="text-sm text-gray-600">
                Une commission de 3% est prélevée automatiquement sur chaque transaction.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-orange-600 mb-2">⚡ Rapide</h3>
              <p className="text-sm text-gray-600">
                Les virements sont effectués automatiquement selon votre configuration Stripe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aide */}
      <Card>
        <CardHeader>
          <CardTitle>Besoin d'aide ?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Si vous rencontrez des difficultés avec la configuration de votre compte Stripe,
            n'hésitez pas à nous contacter.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email :</strong> support@clickandcollect.fr</p>
            <p><strong>Téléphone :</strong> 01 23 45 67 89</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 