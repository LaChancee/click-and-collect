"use client";

import { useSession } from "@/lib/auth-client";
import { LoggedInButton, SignInButton } from "./sign-in-button";
import { useEffect, useState } from "react";

export const AuthButtonClient = () => {
  const [mounted, setMounted] = useState(false);
  const session = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le rendu côté serveur, afficher un placeholder
  if (!mounted) {
    return <div className="w-20 h-8 bg-gray-200 animate-pulse rounded" />;
  }

  if (session.data?.user) {
    const user = session.data.user;
    return <LoggedInButton user={user} />;
  }

  return <SignInButton />;
};
