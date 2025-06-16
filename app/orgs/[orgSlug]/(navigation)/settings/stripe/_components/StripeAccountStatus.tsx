"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ExternalLink, RefreshCw } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  stripeAccountId: string | null;
  stripeAccountStatus: string | null;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
}

interface StripeAccountStatusProps {
  organization: Organization;
}

export function StripeAccountStatus({ organization }: StripeAccountStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch('/api/stripe/account/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: organization.stripeAccountId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      toast.success('Statut mis à jour');
      window.location.reload(); // Recharger pour voir les changements

    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsRefreshing(false);
    }
  };

  const openStripeDashboard = () => {
    if (organization.stripeAccountId) {
      window.open(`https://dashboard.stripe.com/connect/accounts/${organization.stripeAccountId}`, '_blank');
    }
  };

  const getStatusMessage = () => {
    if (organization.stripeAccountStatus === 'enabled' && organization.stripeChargesEnabled) {
      return {
        type: 'success',
        message: 'Votre compte Stripe est actif et peut recevoir des paiements.',
      };
    }

    if (organization.stripeAccountStatus === 'pending') {
      return {
        type: 'warning',
        message: 'Votre compte Stripe est en cours de configuration. Vous devez finaliser votre onboarding.',
      };
    }

    return {
      type: 'error',
      message: 'Il y a un problème avec votre compte Stripe. Veuillez vérifier votre configuration.',
    };
  };

  const status = getStatusMessage();

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${status.type === 'success' ? 'bg-green-50 border-green-200' :
        status.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
        <p className={`text-sm ${status.type === 'success' ? 'text-green-700' :
          status.type === 'warning' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
          {status.message}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Capacités du compte</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Recevoir des paiements:</span>
              <Badge variant={organization.stripeChargesEnabled ? "default" : "secondary"}>
                {organization.stripeChargesEnabled ? "Activé" : "Désactivé"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Recevoir des virements:</span>
              <Badge variant={organization.stripePayoutsEnabled ? "default" : "secondary"}>
                {organization.stripePayoutsEnabled ? "Activé" : "Désactivé"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Informations techniques</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>ID du compte:</strong> {organization.stripeAccountId}</p>
            <p><strong>Statut:</strong> {organization.stripeAccountStatus}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={refreshStatus}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Actualiser le statut
        </Button>

        <Button
          variant="outline"
          onClick={openStripeDashboard}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Ouvrir Stripe Dashboard
        </Button>
      </div>
    </div>
  );
} 