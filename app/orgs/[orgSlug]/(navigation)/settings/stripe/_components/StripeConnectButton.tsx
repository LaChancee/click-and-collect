"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";

export function StripeConnectButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Si l'erreur est liée à Connect non activé, rediriger vers le dashboard
        if (data.error?.includes('Connect') || response.status === 500) {
          toast.error('Stripe Connect n\'est pas encore activé. Redirection vers votre dashboard Stripe...');
          setTimeout(() => {
            window.open('https://dashboard.stripe.com/connect/overview', '_blank');
          }, 2000);
          return;
        }
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      // Rediriger vers l'onboarding Stripe
      window.location.href = data.onboardingUrl;

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la connexion à Stripe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualConnect = () => {
    toast.info('Ouverture du dashboard Stripe...');
    window.open('https://dashboard.stripe.com/connect/overview', '_blank');
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-[#635bff] hover:bg-[#5a52e8] text-white w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          <>
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
            </svg>
            Se connecter avec Stripe
          </>
        )}
      </Button>

      <Button
        onClick={handleManualConnect}
        variant="outline"
        className="w-full"
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Ouvrir le Dashboard Stripe
      </Button>

      <p className="text-sm text-muted-foreground">
        <strong>Note :</strong> Vous devez d'abord activer Stripe Connect dans votre dashboard Stripe
        avant de pouvoir créer des comptes connectés.
      </p>
    </div>
  );
} 