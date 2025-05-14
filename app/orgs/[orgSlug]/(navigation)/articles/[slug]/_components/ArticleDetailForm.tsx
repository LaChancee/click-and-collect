'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { X } from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Command } from "@/components/ui/command";
import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/features/form/submit-button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "@/components/nowts/multi-select";

// Custom components
import { ImageUploader } from "../../components/ImageUploader";

// Utilities
import { cn } from "@/lib/utils";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { updateArticleAction } from "../article.action";

// Types needed for the form
type Category = {
  id: string;
  name: string;
};

type Allergen = {
  id: string;
  name: string;
  description?: string | null;
};

type ProductAllergen = {
  articleId: string;
  allergenId: string;
  allergen: Allergen;
};

type Article = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  isAvailable: boolean;
  stockCount: number | null;
  position: number;
  categoryId: string;
  category: Category;
  allergens: ProductAllergen[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

// Schema for the update form
const ArticleUpdateSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  stockCount: z
    .union([
      z.coerce.number().int().min(0, "Le stock doit être un nombre positif"),
      z.literal("").transform(() => null),
      z.null(),
    ])
    .optional()
    .nullable(),
  position: z.coerce.number().int().min(0).optional(),
  allergenIds: z.array(z.string()).default([]),
  imageUrl: z
    .string()
    .url("L'URL de l'image est invalide")
    .optional()
    .nullable(),
  orgId: z.string().optional(),
  id: z.string(),
});

type ArticleUpdateFormType = z.infer<typeof ArticleUpdateSchema>;

type ArticleDetailFormProps = {
  article: Article;
  allergens: Allergen[];
  categories: Category[];
  orgSlug: string;
  orgId: string;
};

export function ArticleDetailForm({ article, allergens, categories, orgSlug, orgId }: ArticleDetailFormProps) {
  const router = useRouter();

  // Map pour accéder aux allergènes par leur ID
  const allergenMap = new Map<string, Allergen>();
  allergens.forEach(allergen => {
    allergenMap.set(allergen.id, allergen);
  });

  // Map pour retrouver l'ID d'un allergène à partir de son nom
  const allergenNameToIdMap = new Map<string, string>();
  allergens.forEach(allergen => {
    allergenNameToIdMap.set(allergen.name, allergen.id);
  });

  // État pour les allergènes sélectionnés (initialiser avec les noms extraits des IDs)
  const [selectedAllergenNames, setSelectedAllergenNames] = useState<string[]>(
    article.allergens.map(a => {
      const allergen = allergenMap.get(a.allergenId);
      return allergen ? allergen.name : "";
    }).filter(Boolean)
  );

  // État pour le filtrage des allergènes
  const [allergenFilter, setAllergenFilter] = useState<string>("");

  // Filtrer les allergènes en fonction de la recherche
  const filteredAllergens = allergens.filter(allergen =>
    allergen.name.toLowerCase().includes(allergenFilter.toLowerCase()) ||
    (allergen.description && allergen.description.toLowerCase().includes(allergenFilter.toLowerCase()))
  );

  const form = useZodForm({
    schema: ArticleUpdateSchema,
    defaultValues: {
      id: article.id,
      name: article.name,
      description: article.description || "",
      price: Number(article.price),
      categoryId: article.categoryId,
      isActive: article.isActive,
      isAvailable: article.isAvailable,
      stockCount: article.stockCount,
      position: article.position,
      allergenIds: article.allergens.map(pa => pa.allergenId),
      imageUrl: article.imageUrl || null,
      orgId: orgId,
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: ArticleUpdateFormType) => {
      // Convertir les noms d'allergènes en IDs
      const allergenIds = selectedAllergenNames
        .map(name => allergenNameToIdMap.get(name))
        .filter(Boolean) as string[];

      return resolveActionResult(updateArticleAction({
        ...values,
        allergenIds,
        orgId,
      }));
    },
    onSuccess: () => {
      toast.success("Article mis à jour avec succès");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour de l'article");
    }
  });

  return (
    <Form
      form={form}
      className="space-y-6"
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colonne de gauche: Informations générales */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Informations générales</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le nom du produit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le produit..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="empty" disabled>Aucune catégorie disponible</SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stockCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock (laisser vide pour stock illimité)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Quantité en stock"
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position d'affichage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Position"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Colonne de droite: Image, statut et allergènes */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Image du produit</h3>
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploader
                    imageUrl={field.value}
                    onImageUploaded={(url) => field.onChange(url)}
                    onImageRemoved={() => field.onChange(null)}
                    uploadOnSubmit={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="my-6" />

          <h3 className="text-lg font-medium">Statut du produit</h3>
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Actif
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Le produit sera visible dans le catalogue
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Disponible
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Le produit pourra être commandé
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-6" />

          <h3 className="text-lg font-medium">Allergènes</h3>
          <div className="border rounded-md p-4">
            <FormField
              control={form.control}
              name="allergenIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sélectionner les allergènes présents dans ce produit</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Zone de recherche */}
                      <Input
                        type="text"
                        placeholder="Filtrer les allergènes..."
                        value={allergenFilter}
                        onChange={(e) => setAllergenFilter(e.target.value)}
                        className="mb-2"
                      />

                      {/* Liste des allergènes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                        {filteredAllergens.map((allergen) => {
                          const isSelected = selectedAllergenNames.includes(allergen.name);
                          return (
                            <div
                              key={allergen.id}
                              className={cn(
                                "flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors",
                                isSelected && "bg-muted/50"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    // Ajouter l'allergène s'il n'est pas déjà sélectionné
                                    if (!selectedAllergenNames.includes(allergen.name)) {
                                      setSelectedAllergenNames(prev => [...prev, allergen.name]);
                                    }
                                  } else {
                                    // Retirer l'allergène s'il est sélectionné
                                    setSelectedAllergenNames(prev =>
                                      prev.filter(name => name !== allergen.name)
                                    );
                                  }
                                }}
                                id={`allergen-${allergen.id}`}
                              />
                              <label
                                htmlFor={`allergen-${allergen.id}`}
                                className="flex flex-col cursor-pointer flex-1"
                              >
                                <span className="font-medium">{allergen.name}</span>
                                {allergen.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {allergen.description}
                                  </span>
                                )}
                              </label>
                            </div>
                          );
                        })}
                        {allergens.length === 0 && (
                          <div className="py-6 text-center text-sm">
                            Aucun allergène disponible
                          </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Allergènes sélectionnés:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAllergenNames.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun allergène sélectionné</p>
                      ) : (
                        selectedAllergenNames.map(name => (
                          <Badge
                            key={name}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {name}
                            <button
                              type="button"
                              className="ml-1 rounded-full outline-none focus:shadow-outline-green"
                              onClick={() => setSelectedAllergenNames(prev =>
                                prev.filter(n => n !== name)
                              )}
                            >
                              <span className="sr-only">Supprimer</span>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-end space-x-4">
        <LoadingButton
          type="submit"
          loading={mutation.isPending}
          disabled={mutation.isPending}
        >
          Enregistrer les modifications
        </LoadingButton>
      </div>
    </Form>
  );
} 