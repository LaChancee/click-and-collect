"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/features/form/submit-button";
import { createBakeryOrganizationAction } from "@/features/auth/create-bakery-organization.action";
import { authClient } from "@/lib/auth-client";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const BakerySignUpSchema = z.object({
  // Informations utilisateur
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  verifyPassword: z.string().min(8, "Veuillez confirmer votre mot de passe"),

  // Informations boulangerie
  bakeryName: z.string().min(2, "Le nom de la boulangerie doit contenir au moins 2 caractères"),
  bakeryAddress: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  bakeryPhone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 caractères"),
  bakeryDescription: z.string().optional(),
}).refine((data) => data.password === data.verifyPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["verifyPassword"],
});

type BakerySignUpFormType = z.infer<typeof BakerySignUpSchema>;

export const BakerySignUpForm = () => {
  const form = useZodForm({
    schema: BakerySignUpSchema,
  });

  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackUrl") || "/orgs";

  const signUpMutation = useMutation({
    mutationFn: async (values: BakerySignUpFormType) => {
      // Étape 1: Créer le compte utilisateur
      const userResult = await unwrapSafePromise(
        authClient.signUp.email({
          email: values.email,
          password: values.password,
          name: values.name,
        }),
      );

      if (userResult.error) {
        throw new Error(userResult.error.message || "Erreur lors de la création du compte");
      }

      // Attendre un peu pour que la session soit établie
      await new Promise(resolve => setTimeout(resolve, 500));

      // Étape 2: Créer l'organisation boulangerie
      const bakeryResult = await resolveActionResult(
        createBakeryOrganizationAction({
          bakeryName: values.bakeryName,
          bakeryAddress: values.bakeryAddress,
          bakeryPhone: values.bakeryPhone,
          bakeryDescription: values.bakeryDescription,
          bakeryEmail: values.email,
        })
      );

      return {
        user: userResult.data,
        bakery: bakeryResult,
      };
    },
    onError: (error) => {
      console.error("Erreur d'inscription boulangerie:", error);
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success("Compte boulangerie créé avec succès !");
      // Rediriger vers l'espace boulangerie
      if (data.bakery?.slug) {
        window.location.href = window.location.origin + `/orgs/${data.bakery.slug}`;
      } else {
        window.location.href = window.location.origin + callbackURL;
      }
    },
  });

  async function onSubmit(values: BakerySignUpFormType) {
    if (values.password !== values.verifyPassword) {
      form.setError("verifyPassword", {
        message: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    signUpMutation.mutate(values);
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-4">
      {/* Informations utilisateur */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Vos informations personnelles</h3>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre nom et prénom</FormLabel>
              <FormControl>
                <Input
                  placeholder="Jean Dupont"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre email</FormLabel>
              <FormControl>
                <Input
                  placeholder="jean@boulangerie.fr"
                  type="email"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verifyPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Informations boulangerie */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-900">Informations de votre boulangerie</h3>

        <FormField
          control={form.control}
          name="bakeryName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la boulangerie</FormLabel>
              <FormControl>
                <Input
                  placeholder="Les Délices d'Erwann"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bakeryAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Rue de la Boulangerie, 75001 Paris"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bakeryPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input
                  placeholder="01 23 45 67 89"
                  type="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bakeryDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Boulangerie artisanale depuis 1995..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <LoadingButton
        type="submit"
        className="w-full mt-6"
        loading={signUpMutation.isPending}
      >
        {signUpMutation.isPending
          ? "Création en cours..."
          : "Créer mon compte boulangerie"
        }
      </LoadingButton>
    </Form>
  );
}; 