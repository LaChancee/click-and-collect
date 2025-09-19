"use client";

import { useState, useEffect } from "react";
import { UserAuthButton } from "./UserAuthButton";

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

interface UserAuthButtonWrapperProps {
  bakery: Bakery;
}

export function UserAuthButtonWrapper({ bakery }: UserAuthButtonWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Loading state côté serveur
  if (!isClient) {
    return (
      <div className="w-full bg-gray-100 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded" />
        <div className="w-20 h-4 bg-gray-300 rounded" />
      </div>
    );
  }

  return <UserAuthButton bakery={bakery} />;
}
