'use client'

import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/features/form/submit-button";
import { createCategory, seedBakeryCategories } from "./new/category.action";
import { CategorySchemaForm } from "./new/category.schema";
import { z } from "zod";

type CategoryFormSchemaType = z.infer<typeof CategorySchemaForm>;

const defaultCategoryValues: Partial<CategoryFormSchemaType> = {
  name: "",
  description: "",
  isActive: true,
  position: 0,
};

export function CategoryForm({ orgSlug, orgId }: { orgSlug: string, orgId: string | undefined }) {
  const router = useRouter();

  const form = useZodForm({
    schema: CategorySchemaForm,
    defaultValues: {
      ...defaultCategoryValues,
      orgId: orgId,
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: CategoryFormSchemaType) => {
      if (!orgId) {
        throw new Error("ID de l'organisation non disponible");
      }
      seedBakeryCategories(orgId);
      return resolveActionResult(createCategory({
        ...values,
        orgId,
      }));
    },
    onSuccess: () => {
      toast.success("Catégorie créée avec succès");
      router.push(`/orgs/${orgSlug}/articles`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création de la catégorie");
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
          <CardTitle>Nouvelle catégorie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la catégorie</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez le nom de la catégorie" {...field} />
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
                    placeholder="Décrivez la catégorie..."
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
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordre d'affichage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  <FormLabel>Catégorie active</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Cette catégorie sera visible sur le site
                  </p>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <SubmitButton
            type="submit" disabled={mutation.isPending}>
            Créer la catégorie
          </SubmitButton>
        </CardFooter>
      </Card>
    </Form>
  );
} 