'use client';

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, ArrowUpDown, PencilIcon, Save, XCircle, CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { updateStockAction } from "../update-stock.action";
import { toast } from "sonner";

// Composant HeaderCell pour le tri
function HeaderCell({ title }: { title: string }) {
  return (
    <div className="flex items-center">
      {title}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
    </div>
  );
}

// Composant d'édition du stock
function EditableStockCell({ row }: { row: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [stockValue, setStockValue] = useState<string | null>(row.stockCount === null ? null : String(row.stockCount));

  const updateStockMutation = useMutation({
    mutationFn: async ({ stockCount }: { stockCount: number | null }) => {
      return resolveActionResult(updateStockAction({
        articleId: row.id,
        stockCount
      }));
    },
    onSuccess: () => {
      toast.success("Stock mis à jour");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du stock: " + error.message);
    }
  });

  const isAvailable = row.isAvailable;

  if (!isAvailable) {
    return (
      <Badge variant="outline" className="font-normal text-xs border-red-200 text-red-700 bg-red-50">
        <CircleSlash className="h-3 w-3 mr-1 stroke-[2.5]" />
        Non disponible
      </Badge>
    );
  }

  const handleSave = () => {
    const newStock = stockValue === null || stockValue === "" ? null : parseInt(stockValue);
    updateStockMutation.mutate({ stockCount: newStock });
  };

  const handleCancel = () => {
    setStockValue(row.stockCount === null ? null : String(row.stockCount));
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
          disabled={updateStockMutation.isPending}
        />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleSave}
            disabled={updateStockMutation.isPending}
          >
            <Save className="h-3.5 w-3.5" />
            <span className="sr-only">Enregistrer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
            disabled={updateStockMutation.isPending}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span className="sr-only">Annuler</span>
          </Button>
        </div>
      </div>
    );
  }

  // Display mode
  const stockCount = row.stockCount;

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
  const product = row;

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

export function DataTable({
  columns,
  data,
  filterColumn,
  searchPlaceholder,
  categoriesMap,
  baseUrl
}: {
  columns: any[];
  data: any[];
  filterColumn: string;
  searchPlaceholder: string;
  categoriesMap: Record<string, string>;
  baseUrl: string;
}) {
  const [searchText, setSearchText] = useState('');

  const filteredData = searchText
    ? data.filter(item =>
      item[filterColumn].toLowerCase().includes(searchText.toLowerCase())
    )
    : data;

  // Rendu de cellule personnalisé par type
  const renderCell = (column: any, row: any) => {
    const accessorKey = column.accessorKey;

    // Spécial rendering based on column type
    if (accessorKey === "name") {
      return <div className="font-medium truncate max-w-[250px]">{row[accessorKey]}</div>;
    }

    if (accessorKey === "price") {
      return <div className="tabular-nums">{formatCurrency(parseFloat(row[accessorKey]))}</div>;
    }

    if (accessorKey === "category") {
      return (
        <Badge variant="secondary" className="font-normal">
          {row[accessorKey]}
        </Badge>
      );
    }

    if (accessorKey === "isActive") {
      const isActive = row[accessorKey];
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
    }

    if (accessorKey === "stockCount") {
      return <EditableStockCell row={row} />;
    }

    if (column.id === "actions") {
      return <ActionCell row={row} />;
    }

    // Default case
    return row[accessorKey];
  };

  // Rendu pour l'en-tête
  const renderHeader = (column: any) => {
    if (column.header === "Nom du produit" || column.header === "Prix") {
      return <HeaderCell title={column.header} />;
    }
    return column.header;
  };

  return (
    <div className="w-full">
      <div className="mb-4 relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full max-w-sm pl-9 bg-background border-border"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors bg-muted/40 hover:bg-muted/50">
              {columns.map((column: any) => (
                <th
                  key={column.id || column.accessorKey}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                >
                  {renderHeader(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-muted-foreground"
                >
                  Aucun résultat trouvé
                </td>
              </tr>
            ) : (
              filteredData.map((row: any, i: number) => (
                <tr
                  key={i}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {columns.map((column: any) => (
                    <td
                      key={column.id || column.accessorKey}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground mt-2 text-right">
        {filteredData.length} élément{filteredData.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
} 