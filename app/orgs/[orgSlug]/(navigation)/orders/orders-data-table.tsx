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
    // Masquer certaines colonnes par défaut sur mobile
    customer: false,
    paymentStatus: false,
    createdAt: false,
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
      {/* Filtres rapides - Tablette/Mobile */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              onClick={() => setStatusFilter(filter.value)}
              className="h-12 flex flex-col items-center justify-center p-2"
            >
              <span className="text-sm font-medium">{filter.label}</span>
              <span className="text-xs text-muted-foreground">({filter.count})</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Barre de filtres - Desktop */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro..."
              value={(table.getColumn("orderNumber")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("orderNumber")?.setFilterValue(event.target.value)
              }
              className="pl-8 max-w-sm"
            />
          </div>

          {/* Filtres rapides desktop */}
          <div className="flex items-center space-x-1">
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
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Colonnes
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

      {/* Barre de recherche mobile */}
      <div className="block lg:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commande..."
            value={(table.getColumn("orderNumber")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("orderNumber")?.setFilterValue(event.target.value)
            }
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
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
                    <TableCell key={cell.id} className="py-4">
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
} 