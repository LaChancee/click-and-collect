"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUpDown, Calendar, Edit, Percent, Tag } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
type Promotion = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minimumOrderValue: number | null;
  _count: {
    articles: number;
  };
};

export const columns = (orgSlug: string): ColumnDef<Promotion>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <Link
            href={`/orgs/${orgSlug}/promotions/${row.original.slug}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          {row.original.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "discount",
    header: "Remise",
    cell: ({ row }) => {
      const { discountType, discountValue } = row.original;

      return (
        <Badge variant="outline" className="flex items-center gap-1">
          {discountType === "PERCENTAGE" ? (
            <>
              <Percent className="h-3 w-3" />
              {discountValue}%
            </>
          ) : (
            <>
              <span>€</span>
              {discountValue.toFixed(2)}
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "validity",
    header: "Validité",
    cell: ({ row }) => {
      const startDate = new Date(row.original.startDate);
      const endDate = new Date(row.original.endDate);
      const now = new Date();

      // Check if promotion is active based on dates
      const isActive = startDate <= now && endDate >= now;

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant={isActive ? "outline" : "secondary"}
            className="flex items-center gap-1 w-fit"
          >
            <Calendar className="h-3 w-3" />
            {format(startDate, "dd/MM/yy", { locale: fr })} - {format(endDate, "dd/MM/yy", { locale: fr })}
          </Badge>

          {!isActive && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 w-fit">
              {startDate > now ? "À venir" : "Expirée"}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "articles",
    header: "Produits",
    cell: ({ row }) => {
      const count = row.original._count.articles;

      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Tag className="h-3 w-3" />
          {count > 0 ? `${count} produit${count > 1 ? 's' : ''}` : "Tous les produits"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const { isActive } = row.original;

      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
          className="w-fit"
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/orgs/${orgSlug}/promotions/${row.original.slug}`}
                  className="rounded-md p-2 hover:bg-accent"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifier</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
]; 