"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronsUpDown } from "lucide-react";

export function SidebarUserButtonClient() {
  // Version simplifiée sans hooks problématiques
  return (
    <SidebarMenuButton variant="outline" className="h-12">
      <Avatar className="size-8 rounded-lg">
        <AvatarFallback className="rounded-lg">
          U
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">Utilisateur</span>
        <span className="truncate text-xs">Connecté</span>
      </div>
      <ChevronsUpDown className="ml-auto size-4" />
    </SidebarMenuButton>
  );
} 