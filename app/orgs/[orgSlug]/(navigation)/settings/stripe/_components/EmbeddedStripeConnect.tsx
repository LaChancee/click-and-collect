"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type EmbeddedStripeConnectProps = {
  stripeAccountId?: string;
  onComplete?: () => void;
};

export function EmbeddedStripeConnect(props: EmbeddedStripeConnectProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchClientSecret = async () => {
    if (!props.stripeAccountId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/account-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: props.stripeAccountId,
          components: {
            account_onboarding: { enabled: true },
            account_management: {
              enabled: true,
              features: {
                external_account_collection: true,
              },
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session");
      }

      setClientSecret(data.client_secret);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (props.stripeAccountId) {
      fetchClientSecret();
    }
  }, [props.stripeAccountId]);

  if (!props.stripeAccountId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration Stripe</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Vous devez d'abord créer un compte Stripe Connect.
          </p>
          <Button onClick={() => window.location.reload()}>
            Actualiser la page
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration Stripe</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Chargement de l'interface Stripe...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de votre compte Stripe</CardTitle>
      </CardHeader>
      <CardContent>
        <ConnectComponentsProvider
          stripePromise={stripePromise}
          connectInstance={clientSecret}
        >
          <ConnectAccountOnboarding
            onExit={() => {
              console.log("Onboarding fermé");
              props.onComplete?.();
            }}
            onStepChange={(step) => {
              console.log("Étape changée:", step);
            }}
          />
        </ConnectComponentsProvider>
      </CardContent>
    </Card>
  );
} 