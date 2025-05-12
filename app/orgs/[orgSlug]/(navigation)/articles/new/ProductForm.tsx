'use client'

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/features/form/submit-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { ProductFormSchemaType, ProductSchemaForm, defaultProductValues } from "./product.schema";
import { createProduct } from "./product.action";
import { Checkbox } from "@/components/ui/checkbox";

export function ProductForm({ categories, orgSlug }: { categories: { id: string, name: string }[], orgSlug: string}) {
  const router = useRouter();
  const form = useZodForm({
    schema: ProductSchemaForm,
    defaultValues: {
      ...defaultProductValues,
    
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormSchemaType) => {
      const result = await createProduct(values);
      return result;
    },
    onError: (error) => {
      console.error("Erreur de mutation:", error);
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    },
    onSuccess: () => {
      toast.success("Produit créé avec succès");
      router.push(`/orgs/${orgSlug}/articles`);
    }
  });

  return (
    <Form
      form={form}
      className="flex flex-col gap-6"
      onSubmit={async (values) => {
        console.log("Données du formulaire:", values);
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
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
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

          {/* Le champ orgId est passé automatiquement comme valeur par défaut */}
          <input type="hidden" {...form.register("orgId")} />
        </CardContent>
        <CardFooter>
          <SubmitButton type="submit" disabled={mutation.isPending}>
            Créer le produit
          </SubmitButton>
        </CardFooter>
      </Card>
    </Form>
  );
}
