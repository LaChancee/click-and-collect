'use client'

import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { seedBakeryCategories } from "../categories/new/category.action";
import { useRouter } from "next/navigation";

interface SeedCategoriesButtonProps {
  orgId: string;
  orgSlug: string;
  hasCategories: boolean;
}

export function SeedCategoriesButton({ orgId, orgSlug, hasCategories }: SeedCategoriesButtonProps) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await seedBakeryCategories(orgId);
      return result;
    },
    onSuccess: () => {
      toast.success("Catégories de base ajoutées avec succès !");
      router.refresh(); // Rafraîchir la page pour afficher les nouvelles catégories
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout des catégories:", error);
      toast.error("Erreur lors de l'ajout des catégories de base");
    }
  });

  // Ne pas afficher le bouton si des catégories existent déjà
  if (hasCategories) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="border-dashed"
    >
      {mutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Ajout en cours...
        </>
      ) : (
        <>
          <Package className="mr-2 h-4 w-4" />
          Ajouter les catégories de base
        </>
      )}
    </Button>
  );
} 