"use client";

import { Typography } from "@/components/nowts/typography";
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
import { LoadingButton } from "@/features/form/submit-button";
import { authClient } from "@/lib/auth-client";
import { getCallbackUrl } from "@/lib/auth/auth-utils";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";
import { z } from "zod";

const SignInSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
});

const SignUpSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  verifyPassword: z.string().min(8, "Veuillez confirmer votre mot de passe"),
}).refine((data) => data.password === data.verifyPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["verifyPassword"],
});

type SignInFormType = z.infer<typeof SignInSchema>;
type SignUpFormType = z.infer<typeof SignUpSchema>;

export const UnifiedAuthForm = (props: {
  callbackUrl?: string;
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isUsingCredentials, setIsUsingCredentials] = useLocalStorage(
    "sign-in-with-credentials",
    true,
  );

  const signInForm = useZodForm({
    schema: SignInSchema,
  });

  const signUpForm = useZodForm({
    schema: SignUpSchema,
  });

  const signInMutation = useMutation({
    mutationFn: async (values: SignInFormType) => {
      if (isUsingCredentials) {
        return unwrapSafePromise(
          authClient.signIn.email({
            email: values.email,
            password: values.password ?? "",
            rememberMe: true,
          }),
        );
      } else {
        return unwrapSafePromise(
          authClient.signIn.magicLink({
            email: values.email,
          }),
        );
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      const callbackUrl = getCallbackUrl(props.callbackUrl, "/orgs");
      const newUrl =
        window.location.origin +
        (isUsingCredentials ? callbackUrl : "/auth/verify");
      window.location.href = newUrl;
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (values: SignUpFormType) => {
      return unwrapSafePromise(
        authClient.signUp.email({
          email: values.email,
          password: values.password,
          name: values.name,
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      const callbackUrl = getCallbackUrl(props.callbackUrl, "/orgs");
      const newUrl = window.location.origin + callbackUrl;
      window.location.href = newUrl;
    },
  });

  function onSignInSubmit(values: SignInFormType) {
    signInMutation.mutate(values);
  }

  function onSignUpSubmit(values: SignUpFormType) {
    if (values.password !== values.verifyPassword) {
      signUpForm.setError("verifyPassword", {
        message: "Les mots de passe ne correspondent pas",
      });
      return;
    }
    signUpMutation.mutate(values);
  }

  if (mode === "signup") {
    return (
      <div className="space-y-4">
        <Form form={signUpForm} onSubmit={onSignUpSubmit} className="space-y-4">
          <FormField
            control={signUpForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input placeholder="Jean Dupont" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signUpForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="jean@exemple.fr" type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signUpForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signUpForm.control}
            name="verifyPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton
            loading={signUpMutation.isPending}
            type="submit"
            className="ring-offset-card w-full ring-offset-2"
          >
            Créer mon compte
          </LoadingButton>
        </Form>

        <Typography variant="muted" className="text-xs text-center">
          Vous avez déjà un compte ?{" "}
          <Typography
            variant="link"
            as="button"
            type="button"
            onClick={() => setMode("signin")}
          >
            Se connecter
          </Typography>
        </Typography>
      </div>
    );
  }

  // Mode connexion
  return (
    <div className="space-y-4">
      <Form form={signInForm} onSubmit={onSignInSubmit} className="space-y-4">
        <FormField
          control={signInForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jean@exemple.fr" type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isUsingCredentials ? (
          <>
            <FormField
              control={signInForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center justify-between">
                    <FormLabel>Mot de passe</FormLabel>
                    <Link
                      href="/auth/forget-password"
                      className="text-sm underline"
                      tabIndex={2}
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : null}

        <LoadingButton
          loading={signInMutation.isPending}
          type="submit"
          className="ring-offset-card w-full ring-offset-2"
        >
          {isUsingCredentials ? "Se connecter" : "Recevoir un lien de connexion"}
        </LoadingButton>

        {isUsingCredentials ? (
          <Typography variant="muted" className="text-xs">
            Mot de passe oublié ?{" "}
            <Typography
              variant="link"
              as="button"
              type="button"
              onClick={() => {
                setIsUsingCredentials(false);
              }}
            >
              Se connecter par lien magique
            </Typography>
          </Typography>
        ) : (
          <Typography
            variant="link"
            as="button"
            type="button"
            className="text-xs"
            onClick={() => {
              setIsUsingCredentials(true);
            }}
          >
            Utiliser un mot de passe
          </Typography>
        )}
      </Form>

      <Typography variant="muted" className="text-xs text-center">
        Vous n'avez pas de compte ?{" "}
        <Typography
          variant="link"
          as="button"
          type="button"
          onClick={() => setMode("signup")}
        >
          Créer un compte
        </Typography>
      </Typography>
    </div>
  );
};
