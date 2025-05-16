"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Euro, PackageOpen } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
type MealDeal = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  isActive: boolean;
  position: number;
  imageUrl: string | null;
  _count: {
    items: number;
  };
};

export const columns = (orgSlug: string): ColumnDef<MealDeal>[] => [
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
            href={`/orgs/${orgSlug}/meal-deals/${row.original.slug}`}
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
    accessorKey: "price",
    header: "Prix",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Euro className="h-3 w-3" />
          {row.original.price.toFixed(2)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "items",
    header: "Éléments",
    cell: ({ row }) => {
      const count = row.original._count.items;

      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <PackageOpen className="h-3 w-3" />
          {count} produit{count > 1 ? 's' : ''}
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
    id: "position",
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => row.original.position,
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
                  href={`/orgs/${orgSlug}/meal-deals/${row.original.slug}`}
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