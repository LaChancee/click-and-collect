import type { NavigationGroup } from "@/features/navigation/navigation.type";
import { AlertCircle, Mail, User2, ShoppingBag, Heart } from "lucide-react";

export const getAccountNavigation = (): NavigationGroup[] => {
  return ACCOUNT_LINKS;
};

const ACCOUNT_LINKS: NavigationGroup[] = [
  {
    title: "Mon espace client",
    links: [
      {
        href: "/account/profile",
        Icon: User2,
        label: "Mon profil",
      },
      {
        href: "/account/orders",
        Icon: ShoppingBag,
        label: "Mes commandes",
      },
      {
        href: "/account/email",
        Icon: Mail,
        label: "Préférences email",
      },
    ],
  },
  {
    title: "Paramètres",
    links: [
      {
        href: "/account/danger",
        Icon: AlertCircle,
        label: "Zone de danger",
      },
    ],
  },
];
