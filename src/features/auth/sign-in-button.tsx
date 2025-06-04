"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useIsClient } from "@/hooks/use-is-client";
import type { VariantProps } from "class-variance-authority";
import { ChefHat } from "lucide-react";
import Link from "next/link";
import { UserDropdown } from "./user-dropdown";

const useHref = () => {
  const isClient = useIsClient();

  if (!isClient) {
    return "";
  }

  const pathname = window.location.pathname;

  return pathname;
};

export const SignInButton = (props: VariantProps<typeof buttonVariants>) => {
  const href = useHref();

  return (
    <Link
      className={buttonVariants({ size: "sm", variant: "outline", ...props })}
      href={`/auth?callbackUrl=${href}`}
    >
      Se connecter
    </Link>
  );
};

export const LoggedInButton = ({
  user,
  bakeryUser,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  bakeryUser?: {
    bakery: {
      name: string;
      slug: string;
    };
    role: string;
  } | null;
}) => {
  return (
    <UserDropdown>
      <button className="group flex items-center gap-2 rounded-full">
        <Avatar className="size-9 group-active:scale-95">
          <AvatarFallback className="bg-card">
            {user.email?.slice(0, 1).toUpperCase() ?? "U"}
          </AvatarFallback>
          {user.image && <AvatarImage src={user.image} />}
        </Avatar>
        {bakeryUser && (
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              {bakeryUser.bakery.name}
            </Badge>
          </div>
        )}
      </button>
    </UserDropdown>
  );
};
