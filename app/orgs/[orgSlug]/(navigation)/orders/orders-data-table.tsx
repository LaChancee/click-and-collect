"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, Filter, SlidersHorizontal } from "lucide-react";
import { createOrdersColumns } from "./orders-columns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Type for the order data
type OrderWithRelations = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  notes: string | null;
  isGuestOrder: boolean;
  guestEmail: string | null;
  guestPhone: string | null;
  guestName: string | null;
  customerId: string | null;
  timeSlotId: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    name: string | null;
    email: string;
  } | null;
  timeSlot: {
    startTime: string;
    endTime: string;
    date: Date;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    notes: string | null;
    orderId: string;
    articleId: string;
    createdAt: Date;
    updatedAt: Date;
    article: {
      name: string;
      price: number;
    };
  }[];
};

interface DataTableProps {
  orgSlug: string;
  data: OrderWithRelations[];
}

export function OrdersDataTable({
  orgSlug,
  data,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    // Masquer certaines colonnes par défaut selon la taille d'écran
    customer: false,
    paymentStatus: false,
    createdAt: false,
    items: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Create columns with orgSlug
  const columns = React.useMemo(() => createOrdersColumns(orgSlug), [orgSlug]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Filtres rapides par statut
  const statusFilters = [
    { value: "all", label: "Toutes", count: data.length },
    { value: "PENDING", label: "En attente", count: data.filter(order => order.status === "PENDING").length },
    { value: "CONFIRMED", label: "Confirmées", count: data.filter(order => order.status === "CONFIRMED").length },
    { value: "PREPARING", label: "En préparation", count: data.filter(order => order.status === "PREPARING").length },
    { value: "READY", label: "Prêtes", count: data.filter(order => order.status === "READY").length },
    { value: "COMPLETED", label: "Récupérées", count: data.filter(order => order.status === "COMPLETED").length },
  ];

  // Appliquer le filtre de statut
  React.useEffect(() => {
    if (statusFilter === "all") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(statusFilter);
    }
  }, [statusFilter, table]);

  return (
    <div className="w-full space-y-4">
      {/* Filtres rapides - Mobile/Tablette */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              onClick={() => setStatusFilter(filter.value)}
              className="h-12 flex flex-col items-center justify-center p-2 text-xs touch-manipulation"
            >
              <span className="font-medium">{filter.label}</span>
              <span className="text-xs text-muted-foreground">({filter.count})</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Contrôles responsive */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        {/* Barre de recherche */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro..."
              value={(table.getColumn("orderNumber")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("orderNumber")?.setFilterValue(event.target.value)
              }
              className="pl-10 h-12 lg:h-10 text-base lg:text-sm"
            />
          </div>
        </div>

        {/* Filtres et contrôles */}
        <div className="flex items-center gap-2">
          {/* Filtres rapides desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {statusFilters.slice(0, 4).map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "ghost"}
                onClick={() => setStatusFilter(filter.value)}
                size="sm"
                className="text-xs"
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>

          {/* Contrôle des colonnes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-12 lg:h-10">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Colonnes</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table responsive avec scroll horizontal */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-semibold whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50 border-b last:border-b-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="font-medium">Aucune commande trouvée</p>
                      <p className="text-sm">Essayez de modifier vos filtres</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Indicateur de scroll horizontal sur mobile */}
      <div className="sm:hidden text-xs text-muted-foreground text-center">
        Faites défiler horizontalement pour voir toutes les colonnes
      </div>

      {/* Pagination responsive */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-10 touch-manipulation"
            >
              Précédent
            </Button>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Page</span>
              <span className="font-medium">
                {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-10 touch-manipulation"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 