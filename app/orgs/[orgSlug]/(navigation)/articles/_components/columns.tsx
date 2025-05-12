import React from "react";
import { ArrowUpDown, MoreHorizontal, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
// Type pour les produits formatés pour l'affichage dans la table
export type ProductTableItem = {
  id: string;
  name: string;
  price: number | string;
  category: string;
  categoryId: string;
  isActive: boolean;
  isAvailable: boolean;
  stockCount: number | null;
  allergens: string;
  createdAt: Date;
};

export const ProductColumns: ColumnDef<ProductTableItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom du produit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: { row: any }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prix
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: { row: any }) => {
      return <div>{formatCurrency(parseFloat(row.getValue("price")))}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    cell: ({ row }: { row: any }) => <div>{row.getValue("category")}</div>,
    filterFn: (row: any, id: any, value: any) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "isActive",
    header: "Statut",
    cell: ({ row }: { row: any }) => {
      const isActive = row.getValue("isActive");

      return isActive ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="h-3 w-3 mr-1" /> Actif
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <X className="h-3 w-3 mr-1" /> Inactif
        </Badge>
      );
    },
  },
  {
    accessorKey: "stockCount",
    header: "Stock",
    cell: ({ row }: { row: any }) => {
      const stockCount = row.getValue("stockCount");
      const isAvailable = row.getValue("isAvailable");

      if (!isAvailable) {
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Non disponible
          </Badge>
        );
      }

      if (stockCount === null) {
        return <span>Illimité</span>;
      }

      const count = parseInt(stockCount as string);

      if (count <= 0) {
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rupture
          </Badge>
        );
      }

      if (count < 10) {
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {count} restant(s)
          </Badge>
        );
      }

      return <span>{count} en stock</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={`/articles/${product.id}`}>Voir</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/articles/${product.id}/edit`}>Modifier</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-red-600">
              <button>Supprimer</button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 