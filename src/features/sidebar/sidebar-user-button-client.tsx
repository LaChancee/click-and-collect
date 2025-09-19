"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SidebarUserButtonClient() {
  const session = useSession();
  const router = useRouter();

  const logout = useMutation({
    mutationFn: async () => signOut(),
    onSuccess: () => {
      toast.success("Déconnexion réussie");
      void router.push("/auth/signin");
    },
    onError: (error) => {
      toast.error("Erreur lors de la déconnexion");
    },
  });

  if (!session.data?.user) {
    return (
      <SidebarMenuButton variant="outline" className="h-12">
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="rounded-lg">
            ?
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Non connecté</span>
        </div>
      </SidebarMenuButton>
    );
  }

  const user = session.data.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton variant="outline" className="h-12">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {user.email?.slice(0, 1).toUpperCase() ?? "U"}
            </AvatarFallback>
            {user.image && <AvatarImage src={user.image} />}
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {user.name || user.email}
            </span>
            <span className="truncate text-xs">
              {user.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="right" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <div className="font-medium">{user.name || user.email}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            logout.mutate();
          }}
          disabled={logout.isPending}
        >
          <LogOut className="mr-2 size-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 