'use client';

import React, { useState } from "react";
import { ArrowUpDown, MoreHorizontal, Check, X, CircleSlash, CircleDot, PencilIcon, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  createdAt: Date | string;
  imageUrl: string | null;
};

// Composant HeaderCell pour le tri
function HeaderCell({ column, title }: { column: any; title: string }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="hover:bg-transparent p-0 font-medium text-muted-foreground"
    >
      {title}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
    </Button>
  );
}

// Composant d'édition du stock
function EditableStockCell({ row, updateStock }: { row: any, updateStock?: (id: string, stock: number | null) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [stockValue, setStockValue] = useState<string | null>(row.getValue("stockCount") === null ? null : String(row.getValue("stockCount")));
  const [isSaving, setIsSaving] = useState(false);

  const isAvailable = row.getValue("isAvailable");
  const productId = row.original.id;

  if (!isAvailable) {
    return (
      <Badge variant="outline" className="font-normal text-xs border-red-200 text-red-700 bg-red-50">
        <CircleSlash className="h-3 w-3 mr-1 stroke-[2.5]" />
        Non disponible
      </Badge>
    );
  }

  // Si updateStock n'est pas fourni, afficher seulement la valeur
  if (!updateStock) {
    const stockCount = row.getValue("stockCount");
    return (
      <div>
        {stockCount === null ? (
          <span className="text-sm text-muted-foreground">Illimité</span>
        ) : parseInt(stockCount as string) <= 0 ? (
          <Badge variant="outline" className="font-normal text-xs border-red-200 text-red-700 bg-red-50">
            Rupture
          </Badge>
        ) : parseInt(stockCount as string) < 10 ? (
          <Badge variant="outline" className="font-normal text-xs border-amber-200 text-amber-700 bg-amber-50">
            {stockCount} restant(s)
          </Badge>
        ) : (
          <span className="text-sm">{stockCount} en stock</span>
        )}
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const newStock = stockValue === null || stockValue === "" ? null : parseInt(stockValue);
      await updateStock(productId, newStock);
      setIsEditing(false);
      toast.success("Stock mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du stock");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setStockValue(row.getValue("stockCount") === null ? null : String(row.getValue("stockCount")));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={stockValue === null ? '' : stockValue}
          onChange={(e) => setStockValue(e.target.value === '' ? null : e.target.value)}
          className="h-8 w-20 text-sm"
          placeholder="Illimité"
          min="0"
          autoFocus
          disabled={isSaving}
        />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-3.5 w-3.5" />
            <span className="sr-only">Enregistrer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span className="sr-only">Annuler</span>
          </Button>
        </div>
      </div>
    );
  }

  // Display mode
  const stockCount = row.getValue("stockCount");

  return (
    <div className="flex items-center justify-between gap-2 group">
      <div>
        {stockCount === null ? (
          <span className="text-sm text-muted-foreground">Illimité</span>
        ) : parseInt(stockCount as string) <= 0 ? (
          <Badge variant="outline" className="font-normal text-xs border-red-200 text-red-700 bg-red-50">
            Rupture
          </Badge>
        ) : parseInt(stockCount as string) < 10 ? (
          <Badge variant="outline" className="font-normal text-xs border-amber-200 text-amber-700 bg-amber-50">
            {stockCount} restant(s)
          </Badge>
        ) : (
          <span className="text-sm">{stockCount} en stock</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <PencilIcon className="h-3.5 w-3.5" />
        <span className="sr-only">Modifier</span>
      </Button>
    </div>
  );
}

// Composant ActionCell séparé pour le menu d'actions
function ActionCell({ row }: { row: any }) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const product = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={`/orgs/${orgSlug}/articles/${product.id}`} className="cursor-pointer">
            Voir
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/orgs/${orgSlug}/articles/${product.id}/edit`} className="cursor-pointer">
            Modifier
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <button onClick={() => alert('Cette fonction sera disponible prochainement')} className="w-full text-left">
            Supprimer
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Composant pour afficher l'image du produit
function ImageCell({ row }: { row: any }) {
  const imageUrl = row.original.imageUrl;

  return (
    <div className="flex items-center justify-center h-14 w-14 relative">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={row.getValue("name") || "Produit"}
          fill
          className="object-cover rounded-md"
          sizes="56px"
        />
      ) : (
        <div className="h-14 w-14 bg-muted rounded-md flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Aucune image</span>
        </div>
      )}
    </div>
  );
}

// Version pour le composant serveur (sans fonction updateStock)
export function getProductColumns(): ColumnDef<ProductTableItem>[] {
  return [
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => <ImageCell row={row} />,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <HeaderCell column={column} title="Nom du produit" />,
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[250px]">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <HeaderCell column={column} title="Prix" />,
      cell: ({ row }) => {
        return <div className="tabular-nums">{formatCurrency(parseFloat(row.getValue("price")))}</div>;
      },
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }: { row: any }) => (
        <Badge variant="secondary" className="font-normal">
          {row.getValue("category")}
        </Badge>
      ),
      filterFn: (row: any, id: any, value: any) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }: { row: any }) => {
        const isActive = row.getValue("isActive");

        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium">Actif</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium">Inactif</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stockCount",
      header: "Stock",
      cell: ({ row }: { row: any }) => <EditableStockCell row={row} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionCell row={row} />,
    },
  ];
}

// Version pour le composant client (avec fonction updateStock)
export function getProductColumnsWithUpdate(updateStock: (id: string, stock: number | null) => Promise<void>): ColumnDef<ProductTableItem>[] {
  return [
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => <ImageCell row={row} />,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <HeaderCell column={column} title="Nom du produit" />,
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[250px]">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <HeaderCell column={column} title="Prix" />,
      cell: ({ row }) => {
        return <div className="tabular-nums">{formatCurrency(parseFloat(row.getValue("price")))}</div>;
      },
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }: { row: any }) => (
        <Badge variant="secondary" className="font-normal">
          {row.getValue("category")}
        </Badge>
      ),
      filterFn: (row: any, id: any, value: any) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }: { row: any }) => {
        const isActive = row.getValue("isActive");

        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium">Actif</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium">Inactif</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stockCount",
      header: "Stock",
      cell: ({ row }: { row: any }) => <EditableStockCell row={row} updateStock={updateStock} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionCell row={row} />,
    },
  ];
} 