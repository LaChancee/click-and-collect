import type {
  NavigationGroup,
  NavigationLink,
} from "@/features/navigation/navigation.type";
import type { AuthRole } from "@/lib/auth/auth-permissions";
import { isInRoles } from "@/lib/organizations/is-in-roles";
import {
  AlertCircle,
  Clock,
  CreditCard,
  Home,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Tag,
  TriangleAlert,
  UtensilsCrossed,
  User,
  User2,
} from "lucide-react";

const replaceSlug = (href: string, slug: string) => {
  return href.replace(":organizationSlug", slug);
};

export const getOrganizationNavigation = (
  slug: string,
  userRoles: AuthRole[] | undefined,
): NavigationGroup[] => {
  return ORGANIZATION_LINKS.map((group: NavigationGroup) => {
    return {
      ...group,
      defaultOpenStartPath: group.defaultOpenStartPath
        ? replaceSlug(group.defaultOpenStartPath, slug)
        : undefined,
      links: group.links
        .filter((link: NavigationLink) =>
          link.roles ? isInRoles(userRoles, link.roles) : true,
        )
        .map((link: NavigationLink) => {
          return {
            ...link,
            href: replaceSlug(link.href, slug),
          };
        }),
    };
  });
};

const ORGANIZATION_PATH = `/orgs/:organizationSlug`;

export const ORGANIZATION_LINKS: NavigationGroup[] = [
  {
    title: "Menu",
    links: [
      {
        href: ORGANIZATION_PATH,
        Icon: Home,
        label: "Dashboard",
      },
      {
        href: `${ORGANIZATION_PATH}/articles`,
        Icon: ShoppingCart,
        label: "Articles",
      },
      {
        href: `${ORGANIZATION_PATH}/orders`,
        Icon: Package,
        label: "Commandes",
      },
      {
        href: `${ORGANIZATION_PATH}/time-slots`,
        Icon: Clock,
        label: "Créneaux horaires",
        roles: ["owner", "admin"],
      },
      {
        href: `${ORGANIZATION_PATH}/promotions`,
        Icon: Percent,
        label: "Promotions",
      },
      {
        href: `${ORGANIZATION_PATH}/meal-deals`,
        Icon: UtensilsCrossed,
        label: "Formules",
      },
      {
        href: `${ORGANIZATION_PATH}/allergens`,
        Icon: AlertCircle,
        label: "Allergènes",
        roles: ["owner", "admin"],
      },
    ],
  },
  {
    title: "Organization",
    defaultOpenStartPath: `${ORGANIZATION_PATH}/settings`,
    links: [
      {
        href: `${ORGANIZATION_PATH}/settings`,
        Icon: Settings,
        label: "Settings",
      },

      {
        href: `${ORGANIZATION_PATH}/settings/danger`,
        label: "Danger Zone",
        roles: ["owner"],
        Icon: TriangleAlert,
      },
    ],
  },
] satisfies NavigationGroup[];
