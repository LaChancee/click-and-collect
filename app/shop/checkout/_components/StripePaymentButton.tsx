"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { createStripeCheckoutAction } from "../_actions/create-stripe-checkout.action";

interface StripePaymentButtonProps {
  timeSlotId: string;
  items: Array<{
    articleId: string;
    quantity: number;
  }>;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  notes?: string;
  disabled?: boolean;
}

export function StripePaymentButton({
  timeSlotId,
  items,
  customerInfo,
  notes,
  disabled = false,
}: StripePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const result = await createStripeCheckoutAction({
        timeSlotId,
        items,
        customerInfo,
        notes,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Rediriger vers Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className="w-full bg-[#635bff] hover:bg-[#5a52e8] text-white"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Redirection vers le paiement...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-5 w-5" />
          Payer par carte bancaire
        </>
      )}
    </Button>
  );
} 