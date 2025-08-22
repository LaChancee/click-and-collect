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
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    // Configuration responsive par défaut basée sur la largeur de l'écran
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;

    if (isMobile) {
      return {
        // Mobile : colonnes essentielles uniquement
        customer: false,
        items: false,
        paymentStatus: false,
        createdAt: false,
      };
    } else if (isTablet) {
      return {
        // Tablette : colonnes importantes
        customer: true, // Ajout explicite
        items: false,
        paymentStatus: false,
        createdAt: false,
      };
    } else {
      return {
        // Desktop : toutes les colonnes importantes
        customer: true, // Ajout explicite
        items: true,
        paymentStatus: true,
        createdAt: false,
      };
    }
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

  // Gérer la responsivité lors du redimensionnement
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768) { // Mobile
        setColumnVisibility({
          customer: false,
          items: false,
          paymentStatus: false,
          createdAt: false,
        });
      } else if (width < 1024) { // Tablette
        setColumnVisibility({
          customer: true,
          items: false,
          paymentStatus: false,
          createdAt: false,
        });
      } else { // Desktop
        setColumnVisibility({
          customer: true,
          items: true,
          paymentStatus: true,
          createdAt: false,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* Filtres rapides - Mobile/Tablette optimisés */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              onClick={() => setStatusFilter(filter.value)}
              className="h-12 flex flex-col items-center justify-center p-2 text-xs touch-manipulation active:scale-95 transition-transform"
            >
              <span className="font-medium">{filter.label}</span>
              <span className="text-xs opacity-75">({filter.count})</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Contrôles responsive améliorés */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        {/* Barre de recherche */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Rechercher par numéro..."
              value={(table.getColumn("orderNumber")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("orderNumber")?.setFilterValue(event.target.value)
              }
              className="pl-10 h-12 lg:h-10 text-base lg:text-sm focus:ring-2"
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
                className="text-xs hover:bg-gray-100 transition-colors"
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>

          {/* Contrôle des colonnes amélioré */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-12 lg:h-10 min-w-[100px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Colonnes</span>
                <span className="sm:hidden">Cols</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const columnLabels: { [key: string]: string } = {
                    orderNumber: "N° Commande",
                    customer: "Client",
                    items: "Articles",
                    timeSlot: "Créneau",
                    totalAmount: "Montant",
                    status: "Statut",
                    paymentStatus: "Paiement",
                    createdAt: "Date",
                    actions: "Actions",
                  };

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table responsive avec améliorations */}
      <div className="rounded-lg border overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-w-full">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-gray-900 whitespace-nowrap px-4 py-3 text-sm"
                        style={{
                          width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : 'auto',
                          minWidth: header.column.columnDef.size ? `${header.column.columnDef.size}px` : 'auto'
                        }}
                      >
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
                    className="hover:bg-gray-50/50 border-b last:border-b-0 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-4 px-4 align-top"
                        style={{
                          width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : 'auto',
                          minWidth: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : 'auto'
                        }}
                      >
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
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">Aucune commande trouvée</p>
                        <p className="text-sm text-gray-400">Essayez de modifier vos filtres</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Indicateur de scroll amélioré */}
      <div className="sm:hidden text-xs text-muted-foreground text-center py-2 bg-gray-50 rounded-md">
        💡 Glissez horizontalement pour voir toutes les colonnes
      </div>

      {/* Pagination responsive améliorée */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 bg-gray-50/50 rounded-lg">
        <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1">
          <span className="font-medium">{table.getFilteredSelectedRowModel().rows.length}</span> sur{" "}
          <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> ligne(s) sélectionnée(s)
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-10 px-4 touch-manipulation hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              ← Précédent
            </Button>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground px-2">
              <span>Page</span>
              <span className="font-medium bg-white px-2 py-1 rounded border">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span>sur</span>
              <span className="font-medium">
                {table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-10 px-4 touch-manipulation hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Suivant →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 