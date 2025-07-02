"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { ChevronsUpDown } from "lucide-react";
import { UserDropdown } from "../auth/user-dropdown";
import { useEffect, useState } from "react";

export function SidebarUserButtonClient() {
  const [mounted, setMounted] = useState(false);
  const session = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant l'hydratation ou si la session n'est pas encore disponible
  if (!mounted || !session) {
    return (
      <SidebarMenuButton variant="outline" className="h-12">
        <div className="size-8 rounded-lg bg-gray-200 animate-pulse" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <div className="h-4 bg-gray-200 animate-pulse rounded mb-1" />
          <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    );
  }

  // Si la session est en cours de chargement
  if (session.isPending) {
    return (
      <SidebarMenuButton variant="outline" className="h-12">
        <div className="size-8 rounded-lg bg-gray-200 animate-pulse" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <div className="h-4 bg-gray-200 animate-pulse rounded mb-1" />
          <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    );
  }
  // Gestion d'erreur
  if (error) {
    return (
      <SidebarMenuButton variant="outline" className="h-12">
        <div className="size-8 rounded-lg bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-xs">!</span>
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-red-600 text-xs">Erreur de session</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    );
  }

  // Si pas d'utilisateur connecté
  if (!user) {
    return (
      <SidebarMenuButton variant="outline" className="h-12">
        <div className="size-8 rounded-lg bg-gray-200" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-gray-500 text-xs">Non connecté</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    );
  }

  return (
    <UserDropdown>
      <SidebarMenuButton variant="outline" className="h-12">
        <Avatar className="size-8 rounded-lg">
          <AvatarImage src={user.image ?? ""} alt={user.name?.[0]} />
          <AvatarFallback className="rounded-lg">
            {user.name?.[0] ?? user.email?.[0] ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{user.name}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    </UserDropdown>
  );
} 