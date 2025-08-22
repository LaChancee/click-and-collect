'use client';

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  PencilIcon,
  Save,
  XCircle,
  CircleSlash,
  Trash2,
  Check,
  X,
  EyeIcon,
  EyeOffIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
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
import { batchArticleAction } from "../batch-actions.action";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
          className="h-8 w-16 sm:w-20 text-sm"
          placeholder="Illimité"
          min="0"
          autoFocus
          disabled={updateStockMutation.isPending}
        />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 touch-manipulation"
            onClick={handleSave}
            disabled={updateStockMutation.isPending}
          >
            <Save className="h-3.5 w-3.5" />
            <span className="sr-only">Enregistrer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 touch-manipulation"
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
      <div className="min-w-0 flex-1">
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
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 touch-manipulation transition-opacity"
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
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 data-[state=open]:bg-muted sm:h-8 sm:w-8">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={`/orgs/${orgSlug}/articles/${product.slug}`} className="cursor-pointer">
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
function ImageCell({ imageUrl, name }: { imageUrl: string | null, name: string }) {
  return (
    <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 relative">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name || "Produit"}
          fill
          className="object-cover rounded-md"
          sizes="(max-width: 640px) 48px, 56px"
        />
      ) : (
        <div className="h-12 w-12 sm:h-14 sm:w-14 bg-muted rounded-md flex items-center justify-center">
          <span className="text-xs text-muted-foreground text-center">Aucune image</span>
        </div>
      )}
    </div>
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
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const filteredData = searchText
    ? data.filter(item =>
      item[filterColumn].toLowerCase().includes(searchText.toLowerCase())
    )
    : data;

  // Mutations pour les actions par lot
  const batchActionMutation = useMutation({
    mutationFn: async ({
      articleIds,
      action
    }: {
      articleIds: string[];
      action: "delete" | "activate" | "deactivate" | "makeAvailable" | "makeUnavailable";
    }) => {
      return resolveActionResult(batchArticleAction({ articleIds, action }));
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedRows([]);
      setIsDeleteDialogOpen(false);
      // Recharger la page pour afficher les modifications
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Gérer la sélection de toutes les lignes
  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map(row => row.id));
    }
  };

  // Gérer la sélection d'une ligne
  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Exécuter une action par lot
  const executeBatchAction = (action: "delete" | "activate" | "deactivate" | "makeAvailable" | "makeUnavailable") => {
    if (selectedRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un article");
      return;
    }

    if (action === "delete") {
      setIsDeleteDialogOpen(true);
    } else {
      batchActionMutation.mutate({ articleIds: selectedRows, action });
    }
  };

  // Colonnes avec case à cocher
  const renderCheckboxHeader = () => (
    <Checkbox
      checked={selectedRows.length === filteredData.length && filteredData.length > 0}
      onCheckedChange={handleSelectAll}
      aria-label="Sélectionner tous les articles"
    />
  );

  const renderCheckboxCell = (row: any) => (
    <Checkbox
      checked={selectedRows.includes(row.id)}
      onCheckedChange={() => handleSelectRow(row.id)}
      aria-label={`Sélectionner ${row.name}`}
    />
  );

  // Rendu de cellule personnalisé par type
  const renderCell = (column: any, row: any) => {
    const accessorKey = column.accessorKey;

    // Image cell
    if (column.id === "image") {
      return <ImageCell imageUrl={row.imageUrl} name={row.name} />;
    }

    // Spécial rendering based on column type
    if (accessorKey === "name") {
      return (
        <div className="space-y-1">
          <div className="font-medium truncate max-w-[200px] sm:max-w-[250px]">{row[accessorKey]}</div>
          {/* Afficher la catégorie sur mobile si elle est cachée */}
          <div className="md:hidden">
            <Badge variant="secondary" className="font-normal text-xs">
              {row.category}
            </Badge>
          </div>
        </div>
      );
    }

    if (accessorKey === "price") {
      return (
        <div className="space-y-1">
          <div className="tabular-nums font-medium">{formatCurrency(parseFloat(row[accessorKey]))}</div>
          {/* Afficher le stock sur mobile si caché */}
          <div className="lg:hidden">
            {row.stockCount === null ? (
              <span className="text-xs text-muted-foreground">Illimité</span>
            ) : parseInt(row.stockCount as string) <= 0 ? (
              <Badge variant="outline" className="text-xs border-red-200 text-red-700 bg-red-50">
                Rupture
              </Badge>
            ) : parseInt(row.stockCount as string) < 10 ? (
              <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                {row.stockCount} restant(s)
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">{row.stockCount} en stock</span>
            )}
          </div>
        </div>
      );
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

  // Rendu pour l'en-tête - CORRECTION
  const renderHeader = (column: any) => {
    if (typeof column.header === 'function') {
      // Si c'est une fonction, on l'appelle avec un contexte minimal
      return column.header({ column: {} });
    }
    if (column.header === "Nom du produit" || column.header === "Prix") {
      return <HeaderCell title={column.header} />;
    }
    return column.header;
  };

  return (
    <div className="w-full">
      {/* Contrôles responsive */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-9 bg-background border-border"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedRows.length} article(s) sélectionné(s)</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions groupées</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => executeBatchAction("activate")}>
                  <Check className="mr-2 h-4 w-4" />
                  Activer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => executeBatchAction("deactivate")}>
                  <X className="mr-2 h-4 w-4" />
                  Désactiver
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => executeBatchAction("makeAvailable")}>
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Rendre disponible
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => executeBatchAction("makeUnavailable")}>
                  <EyeOffIcon className="mr-2 h-4 w-4" />
                  Rendre indisponible
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => executeBatchAction("delete")}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Table responsive avec scroll horizontal */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors bg-muted/40 hover:bg-muted/50">
                <th className="h-12 w-12 px-4 text-left align-middle">
                  {renderCheckboxHeader()}
                </th>
                {columns.map((column: any) => (
                  <th
                    key={column.id || column.accessorKey}
                    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${
                      // Cacher certaines colonnes sur mobile
                      column.id === "image" ? "hidden sm:table-cell" : ""
                      } ${column.accessorKey === "category" ? "hidden md:table-cell" : ""
                      } ${column.accessorKey === "stockCount" ? "hidden lg:table-cell" : ""
                      }`}
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
                    colSpan={columns.length + 1}
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
                    <td className="p-4 align-middle">
                      {renderCheckboxCell(row)}
                    </td>
                    {columns.map((column: any) => (
                      <td
                        key={column.id || column.accessorKey}
                        className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${
                          // Cacher certaines colonnes sur mobile
                          column.id === "image" ? "hidden sm:table-cell" : ""
                          } ${column.accessorKey === "category" ? "hidden md:table-cell" : ""
                          } ${column.accessorKey === "stockCount" ? "hidden lg:table-cell" : ""
                          }`}
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
      </div>

      {/* Informations sur les résultats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground mt-2 gap-2">
        <div>
          {filteredData.length} élément{filteredData.length !== 1 ? 's' : ''}
        </div>
        <div className="sm:hidden text-muted-foreground">
          Faites défiler horizontalement pour voir plus de colonnes
        </div>
      </div>

      {/* Boîte de dialogue de confirmation pour la suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedRows.length} article(s) ?
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => batchActionMutation.mutate({ articleIds: selectedRows, action: "delete" })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 