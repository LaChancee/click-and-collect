'use client';

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { seedAllergensAction } from "../seed-allergens.action";
import { DatabaseIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type AllergenSeedButtonProps = {
  orgSlug: string;
};

export function AllergenSeedButton({ orgSlug }: AllergenSeedButtonProps) {
  const router = useRouter();

  const seedMutation = useMutation({
    mutationFn: async () => {
      return resolveActionResult(seedAllergensAction({}));
    },
    onSuccess: (data) => {
      toast.success(data.message);
      router.refresh(); // Rafraîchir la page pour afficher les allergènes nouvellement créés
    },
    onError: (error) => {
      toast.error(error.message || "Une erreur est survenue");
    }
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => seedMutation.mutate()}
      disabled={seedMutation.isPending}
      className="flex items-center gap-2"
    >
      <DatabaseIcon className="h-4 w-4" />
      {seedMutation.isPending
        ? "Initialisation en cours..."
        : "Initialiser la liste standard des allergènes"
      }
    </Button>
  );
} 