"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AuthOrganization } from "@/lib/auth/auth-type";
import { Plus, User, ChefHat } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

type OrganizationsSelectProps = {
  currentOrgSlug?: string;
  children?: ReactNode;
  orgs: AuthOrganization[];
};

export const OrgsSelect = (props: OrganizationsSelectProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const org = props.orgs.find((org) => org.slug === props.currentOrgSlug);
  const isInAccountSpace = pathname.startsWith('/account');
  const [isBakery, setIsBakery] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est une boulangerie
  useEffect(() => {
    fetch("/api/auth/verify-user-type")
      .then((res) => res.json())
      .then((data) => {
        setIsBakery(data.isBakery);
        setIsLoading(false);
      })
      .catch(() => {
        setIsBakery(false);
        setIsLoading(false);
      });
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              data-testid="org-selector"
              variant="default"
              size="lg"
            >
              {isInAccountSpace ? (
                <span className="inline-flex w-full items-center gap-2">
                  <div className="size-6 rounded-md bg-blue-100 flex items-center justify-center">
                    <User className="size-4 text-blue-600" />
                  </div>
                  <span className="line-clamp-1 text-left">Mon espace client</span>
                </span>
              ) : org ? (
                <span className="inline-flex w-full items-center gap-2">
                  <div className="size-6 rounded-md bg-orange-100 flex items-center justify-center">
                    <ChefHat className="size-4 text-orange-600" />
                  </div>
                  <span className="line-clamp-1 text-left">{org.name}</span>
                </span>
              ) : (
                <span>Sélectionner un espace</span>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
            {/* Option Espace Client - s'affiche seulement pour les clients (pas les boulangeries) */}
            {!isLoading && !isBakery && !isInAccountSpace && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="inline-flex w-full items-center gap-2">
                    <div className="size-6 rounded-md bg-blue-100 flex items-center justify-center">
                      <User className="size-4 text-blue-600" />
                    </div>
                    <span className="line-clamp-1 text-left">Mon espace client</span>
                  </Link>
                </DropdownMenuItem>
                {props.orgs.length > 0 && <DropdownMenuSeparator />}
              </>
            )}

            {/* Boulangeries de l'utilisateur */}
            {props.orgs
              .filter((org) => isInAccountSpace || org.slug !== props.currentOrgSlug)
              .map((org) => {
                if (typeof window === "undefined") return null;

                const href = `/orgs/${org.slug}`;

                return (
                  <DropdownMenuItem key={org.slug} asChild>
                    <Link
                      href={href}
                      className="inline-flex w-full items-center gap-2"
                    >
                      <div className="size-6 rounded-md bg-orange-100 flex items-center justify-center">
                        <ChefHat className="size-4 text-orange-600" />
                      </div>
                      <span className="line-clamp-1 text-left">{org.name}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            {/* <DropdownMenuItem
              onClick={() => {
                router.push("/orgs/new");
              }}
            >
              <Plus className="mr-2 size-6" />
              <span className="line-clamp-1 text-left">
                Add a new organization
              </span>
            </DropdownMenuItem> */ }
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
