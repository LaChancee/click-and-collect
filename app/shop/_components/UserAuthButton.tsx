"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Settings } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Bakery {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  email?: string | null;
  logo?: string | null;
}

interface UserAuthButtonProps {
  bakery: Bakery;
}

export function UserAuthButton({ bakery }: UserAuthButtonProps) {
  const { data: session, isPending, error } = useSession();
  const [userBakerySlug, setUserBakerySlug] = useState<string | null>(null);
  const [isBakeryOwner, setIsBakeryOwner] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user) {
      // Vérifier si l'utilisateur a accès à cette boulangerie
      fetch("/api/auth/verify-user-type")
        .then((res) => res.json())
        .then((data) => {
          if (data.isBakery && data.bakeryInfo?.slug === bakery.slug) {
            setUserBakerySlug(data.bakeryInfo.slug);
            setIsBakeryOwner(true);
          } else {
            setIsBakeryOwner(false);
          }
        })
        .catch(() => {
          setIsBakeryOwner(false);
        });
    }
  }, [session, bakery.slug]);

  if (isPending) {
    return (
      <div className="w-full bg-gray-100 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded" />
        <div className="w-20 h-4 bg-gray-300 rounded" />
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!session?.user) {
    // Utilisateur non connecté - bouton de connexion
    return (
      <Link
        href="/auth"
        className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        <User className="w-4 h-4" />
        Se connecter
      </Link>
    );
  }

  if (isBakeryOwner && userBakerySlug === bakery.slug) {
    // Utilisateur connecté et propriétaire de cette boulangerie - bouton admin
    return (
      <Link
        href={`/orgs/${bakery.slug}`}
        className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Administration
      </Link>
    );
  }

  // Utilisateur connecté mais pas propriétaire - bouton Mon compte
  return (
    <Link
      href="/account"
      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
    >
      <User className="w-4 h-4" />
      Mon compte
    </Link>
  );
}
