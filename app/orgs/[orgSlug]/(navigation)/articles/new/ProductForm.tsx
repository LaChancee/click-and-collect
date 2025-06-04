'use client'

import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { defaultArticleValues, ArticleFormSchemaType, ArticleSchemaForm } from "./product.schema";
import { toast } from "sonner";
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/features/form/submit-button";
import { useEffect, useState, useRef } from "react";
import { createArticle } from "./product.action";
import { getCategoriesAction, seedBakeryCategories } from "../categories/new/category.action";
import { ImageUploader } from "../components/ImageUploader";
import { Button } from "@/components/ui/button";

// Déclaration du type pour la méthode d'upload exposée via window
declare global {
  interface Window {
    uploadPendingImage?: () => Promise<boolean>;
  }
}

type Category = {
  id: string;
  name: string;
}

export function ProductForm({ orgSlug, orgId }: { orgSlug: string, orgId: string | undefined }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageUploaderRef = useRef<HTMLDivElement>(null);

  // Récupérer les catégories au chargement du composant
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await resolveActionResult(getCategoriesAction({ bakeryId: orgId || "" }));
      setCategories(result);
    };
    fetchCategories();
  }, [orgId]);

  const form = useZodForm({
    schema: ArticleSchemaForm,
    defaultValues: {
      ...defaultArticleValues,
      orgId: orgId,
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: ArticleFormSchemaType) => {
      if (!orgId) {
        throw new Error("ID de l'organisation non disponible");
      }

      // Si une image est en attente d'upload, l'uploader maintenant
      if (window.uploadPendingImage) {
        setIsSubmitting(true);

        const wasUploaded = await window.uploadPendingImage();
        // Attendre juste assez pour que l'URL soit mise à jour
        if (wasUploaded) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }

      }

      // Récupérer les valeurs actualisées du formulaire
      const currentValues = form.getValues();

      // Soumettre le formulaire avec les valeurs actualisées
      return resolveActionResult(createArticle({
        ...currentValues,
        orgId,
      }));
    },
    onSuccess: () => {
      toast.success("Article créé avec succès");
      router.push(`/orgs/${orgSlug}/articles`);
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(error.message || "Erreur lors de la création de l'article");
    }
  });

  return (
    <Form
      form={form}
      className="flex flex-col gap-6"
      onSubmit={async (values) => {
        // Utiliser directement les valeurs actualisées du formulaire
        try {
          await mutation.mutateAsync(form.getValues());
        } catch (error) {
          // Erreur déjà gérée dans le mutation.onError
        }
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Nouveau produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
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
                        placeholder="Décrivez votre produit..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <div className="space-y-6">
              {/* Image uploader */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem ref={imageUploaderRef}>
                    <FormLabel>Image du produit</FormLabel>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormLabel>Produit actif</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Ce produit sera visible sur le site
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
                    <FormLabel>Disponible à la vente</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Ce produit pourra être commandé
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="stockCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock disponible</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Laissez vide pour un stock illimité"
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? null : parseInt(value, 10));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/orgs/${orgSlug}/articles`)}
            disabled={mutation.isPending || isSubmitting}
          >
            Annuler
          </Button>
          <LoadingButton loading={mutation.isPending || isSubmitting}>
            Créer le produit
          </LoadingButton>
        </CardFooter>
      </Card>
    </Form>
  );
}
