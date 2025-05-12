'use client'

import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { defaultProductValues, ProductFormSchemaType, ProductSchemaForm } from "./product.schema";
import { createProduct } from "./product.action";
import { toast } from "sonner";
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/features/form/submit-button";
import { prisma } from "@/lib/prisma";
import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
}

export function ProductForm({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([
    { id: "cat1", name: "Pains" },
    { id: "cat2", name: "Viennoiseries" },
    { id: "cat3", name: "Pâtisseries" },
    { id: "cat4", name: "Sandwichs" },
    { id: "cat5", name: "Boissons" }
  ]);

  // Récupérer les catégories au chargement du composant
 

  const form = useZodForm({
    schema: ProductSchemaForm,
    defaultValues: {
      ...defaultProductValues,
      orgId: orgSlug,
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormSchemaType) => {
    },
    onSuccess: () => {
      toast.success("Produit créé avec succès");
      router.push(`/orgs/${orgSlug}/articles`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du produit");
    }
  });

  return (
    <Form
      form={form}
      className="flex flex-col gap-6"
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Nouveau produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                    {...field}
                    value={field.value === undefined ? '0' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


        </CardContent>
        <CardFooter>
          <SubmitButton
            type="submit" disabled={mutation.isPending }>
            Créer le produit
          </SubmitButton>
        </CardFooter>
      </Card>
    </Form>
  );
}
