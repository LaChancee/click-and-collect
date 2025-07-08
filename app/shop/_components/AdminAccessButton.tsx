"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Settings, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface BakeryInfo {
  id: string;
  name: string;
  slug: string;
}

interface AdminAccessButtonProps {
  bakery: BakeryInfo;
}

// Composant interne qui utilise les hooks
function AdminAccessButtonInternal({ bakery }: AdminAccessButtonProps) {
  const { data: session, isPending, error } = useSession();
  const [userBakerySlug, setUserBakerySlug] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session?.user && isClient) {
      // Vérifier si l'utilisateur a accès à cette boulangerie
      fetch("/api/auth/verify-user-type")
        .then((res) => res.json())
        .then((data) => {
          if (data.isBakery && data.bakeryInfo?.slug === bakery.slug) {
            setUserBakerySlug(data.bakeryInfo.slug);
          }
        })
        .catch(() => {
          // Ignore les erreurs silencieusement
        });
    }
  }, [session, bakery.slug, isClient]);

  // N'afficher rien si on n'est pas côté client
  if (!isClient) {
    return null;
  }

  if (isPending || error) {
    return null; // Loading state - don't show anything
  }

  if (!session?.user) {
    // Utilisateur non connecté - bouton de connexion
    return (
      <Link href="/auth" className="inline-flex">
        <Button variant="outline" size="sm" className="gap-2">
          <User className="w-4 h-4" />
          Connexion
        </Button>
      </Link>
    );
  }

  if (userBakerySlug === bakery.slug) {
    // Utilisateur connecté et propriétaire de cette boulangerie - bouton admin
    return (
      <Link href={`/orgs/${bakery.slug}`} className="inline-flex">
        <Button size="sm" className="gap-2 bg-orange-600 hover:bg-orange-700">
          <Settings className="w-4 h-4" />
          Administration
        </Button>
      </Link>
    );
  }

  // Utilisateur connecté mais pas propriétaire - rien à afficher
  return null;
}

// Export du composant avec dynamic import pour éviter les problèmes SSR
export const AdminAccessButton = dynamic(
  () => Promise.resolve(AdminAccessButtonInternal),
  {
    ssr: false,
    loading: () => null
  }
); 