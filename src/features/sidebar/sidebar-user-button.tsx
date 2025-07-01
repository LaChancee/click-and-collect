"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { ChevronsUpDown } from "lucide-react";
import { UserDropdown } from "../auth/user-dropdown";
import { useEffect, useState } from "react";

export const SidebarUserButton = () => {
  const [mounted, setMounted] = useState(false);
  const session = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le rendu côté serveur ou avant l'hydratation, afficher un placeholder
  if (!mounted) {
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

  const data = session.data?.user;

  return (
    <UserDropdown>
      <SidebarMenuButton variant="outline" className="h-12">
        <Avatar className="size-8 rounded-lg">
          <AvatarImage src={data?.image ?? ""} alt={data?.name?.[0]} />
          <AvatarFallback className="rounded-lg">
            {data?.name?.[0] ?? data?.email?.[0] ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{data?.name}</span>
          <span className="truncate text-xs">{data?.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    </UserDropdown>
  );
};
