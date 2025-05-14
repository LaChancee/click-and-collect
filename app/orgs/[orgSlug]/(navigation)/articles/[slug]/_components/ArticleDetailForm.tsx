'use client'

import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/features/form/submit-button";
import { ImageUploader } from "../../components/ImageUploader";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { updateArticleAction } from "../article.action";
import { useRouter } from "next/navigation";
import { Command } from "@/components/ui/command";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "@/components/nowts/multi-select";

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
  createdAt: Date;
  updatedAt: Date;
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
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    article.allergens.map(a => a.allergen.name)
  );

  // Map allergen names to IDs for form submission
  const allergenNameToIdMap = new Map<string, string>();
  allergens.forEach(allergen => {
    allergenNameToIdMap.set(allergen.name, allergen.id);
  });

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
      // Map selected allergen names to IDs
      const allergenIds = selectedAllergens
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
          <div>
            <h3 className="text-lg font-medium mb-4">Informations générales</h3>
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
        </div>

        {/* Colonne de droite: Image, statut et allergènes */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Image du produit</h3>
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
          </div>

          <div className="space-y-4">
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Allergènes</h3>
            <div className="border rounded-md p-4">
              <FormField
                control={form.control}
                name="allergenIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sélectionner les allergènes présents dans ce produit</FormLabel>
                    <FormControl>
                      <MultiSelector
                        values={selectedAllergens}
                        onValuesChange={setSelectedAllergens}
                        className="space-y-2"
                      >
                        <MultiSelectorTrigger className="w-full px-2 py-2 h-auto border-input">
                          <MultiSelectorInput placeholder="Rechercher un allergène..." />
                        </MultiSelectorTrigger>
                        <MultiSelectorContent className="w-full bg-white p-0 border rounded-md shadow-md mt-1 max-h-60 overflow-auto">
                          <MultiSelectorList className="w-full py-1">
                            <Command className="w-full">
                              {allergens.map((allergen) => (
                                <MultiSelectorItem
                                  key={allergen.id}
                                  value={allergen.name}
                                  className="cursor-pointer w-full px-2 py-1.5 hover:bg-slate-100"
                                >
                                  <div className="flex flex-col">
                                    <span>{allergen.name}</span>
                                    {allergen.description && (
                                      <span className="text-xs text-muted-foreground">{allergen.description}</span>
                                    )}
                                  </div>
                                </MultiSelectorItem>
                              ))}
                              {allergens.length === 0 && (
                                <div className="py-6 text-center text-sm">
                                  Aucun allergène disponible
                                </div>
                              )}
                            </Command>
                          </MultiSelectorList>
                        </MultiSelectorContent>
                      </MultiSelector>
                    </FormControl>
                    <FormMessage />
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Allergènes sélectionnés:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAllergens.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Aucun allergène sélectionné</p>
                        ) : (
                          selectedAllergens.map(name => (
                            <Badge key={name} variant="secondary">{name}</Badge>
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
      </div>

      <div className="flex justify-end space-x-4 mt-8">
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