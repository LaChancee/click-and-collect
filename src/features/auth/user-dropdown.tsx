"use client";

import { Monitor, Moon, SunMedium, SunMoon, Settings, User, ShoppingBag, ChefHat, LogOut } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/nowts/typography";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";
import { useUserType } from "@/hooks/use-user-type";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const UserDropdown = ({ children }: PropsWithChildren) => {
  const session = useSession();
  const { setTheme } = useTheme();
  const { isBakery, isClient, bakeryInfo } = useUserType();
  const router = useRouter();

  const logout = useMutation({
    mutationFn: async () => signOut(),
    onSuccess: () => {
      void router.push("/auth/signin");
    },
  });

  if (!session.data?.user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {session.data.user.name ? (
            <>
              <Typography variant="small">
                {session.data.user.name || session.data.user.email}
              </Typography>
              <Typography variant="muted">{session.data.user.email}</Typography>
              {isBakery && bakeryInfo && (
                <Typography variant="muted" className="text-orange-600 font-medium">
                  🥖 {bakeryInfo.name}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="small">{session.data.user.email}</Typography>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Liens pour les CLIENTS uniquement */}
        {isClient && !isBakery && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/account/profile">
                <User className="mr-2 size-4" />
                Mon profil
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/account/orders">
                <ShoppingBag className="mr-2 size-4" />
                Mes commandes
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/account">
                <Settings className="mr-2 size-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Liens pour les BOULANGERS uniquement */}
        {isBakery && bakeryInfo && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/orgs/${bakeryInfo.slug}`}>
                <ChefHat className="mr-2 size-4" />
                Dashboard boulangerie
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon className="mr-2 size-4" />
            <span>Thème</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <SunMedium className="mr-2 size-4" />
                <span>Sombre</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Moon className="mr-2 size-4" />
                <span>Clair</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                <span>Système</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            logout.mutate();
          }}
        >
          <LogOut className="mr-2 size-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
