"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { QuickOrderActions } from "./_components/QuickOrderActions";
import { useParams } from "next/navigation";

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

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: { label: "En attente", variant: "secondary" as const, color: "bg-orange-100 text-orange-800 border-orange-200" },
    CONFIRMED: { label: "Confirmée", variant: "default" as const, color: "bg-blue-100 text-blue-800 border-blue-200" },
    PREPARING: { label: "En préparation", variant: "default" as const, color: "bg-purple-100 text-purple-800 border-purple-200" },
    READY: { label: "Prête", variant: "default" as const, color: "bg-green-100 text-green-800 border-green-200" },
    COMPLETED: { label: "Récupérée", variant: "default" as const, color: "bg-gray-100 text-gray-800 border-gray-200" },
    CANCELLED: { label: "Annulée", variant: "destructive" as const, color: "bg-red-100 text-red-800 border-red-200" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  return (
    <Badge className={`px-2 py-1 text-xs font-medium whitespace-nowrap ${config.color}`}>
      {config.label}
    </Badge>
  );
};

const getPaymentStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: { label: "En attente", variant: "secondary" as const, color: "bg-orange-100 text-orange-800 border-orange-200" },
    PAID: { label: "Payé", variant: "default" as const, color: "bg-green-100 text-green-800 border-green-200" },
    FAILED: { label: "Échec", variant: "destructive" as const, color: "bg-red-100 text-red-800 border-red-200" },
    REFUNDED: { label: "Remboursé", variant: "outline" as const, color: "bg-gray-100 text-gray-800 border-gray-200" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  return (
    <Badge className={`px-2 py-1 text-xs font-medium whitespace-nowrap ${config.color}`}>
      {config.label}
    </Badge>
  );
};

// Fonction pour créer les colonnes avec le slug de l'organisation
export const createOrdersColumns = (orgSlug: string): ColumnDef<OrderWithRelations>[] => [
  {
    accessorKey: "orderNumber",
    header: "N° Commande",
    size: 120,
    cell: ({ row }) => {
      const orderNumber = row.getValue("orderNumber") as string;
      return (
        <div className="font-medium text-sm lg:text-base whitespace-nowrap">
          #{orderNumber}
        </div>
      );
    },
    meta: {
      priority: 1, // Très importante
    },
  },
  {
    accessorKey: "customer",
    header: "Client",
    size: 180,
    cell: ({ row }) => {
      const order = row.original;
      if (order.isGuestOrder) {
        return (
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{order.guestName || "Client anonyme"}</div>
            <div className="text-xs text-gray-500 truncate">{order.guestEmail}</div>
          </div>
        );
      }
      return (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{order.customer?.name || "N/A"}</div>
          <div className="text-xs text-gray-500 truncate">{order.customer?.email}</div>
        </div>
      );
    },
    meta: {
      priority: 3, // Moyennement importante
    },
  },
  {
    accessorKey: "items",
    header: "Articles",
    size: 160,
    cell: ({ row }) => {
      const items = row.getValue("items") as OrderWithRelations["items"];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      return (
        <div className="min-w-0">
          <div className="font-medium text-sm">{totalItems} article{totalItems > 1 ? "s" : ""}</div>
          <div className="text-xs text-gray-500 truncate">
            {items.slice(0, 2).map(item => item.article.name).join(", ")}
            {items.length > 2 && "..."}
          </div>
        </div>
      );
    },
    meta: {
      priority: 4, // Peu importante
    },
  },
  {
    accessorKey: "timeSlot",
    header: "Créneau",
    size: 140,
    cell: ({ row }) => {
      const timeSlot = row.getValue("timeSlot") as OrderWithRelations["timeSlot"];
      return (
        <div className="text-center">
          <div className="font-medium text-xs lg:text-sm whitespace-nowrap">
            {new Date(timeSlot.date).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {timeSlot.startTime} - {timeSlot.endTime}
          </div>
        </div>
      );
    },
    meta: {
      priority: 2, // Importante
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Montant",
    size: 100,
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <div className="font-medium text-sm lg:text-base text-right whitespace-nowrap">
          {amount.toFixed(2)}€
        </div>
      );
    },
    meta: {
      priority: 2, // Importante
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    size: 120,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex justify-center">
          {getStatusBadge(status)}
        </div>
      );
    },
    meta: {
      priority: 1, // Très importante
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Paiement",
    size: 100,
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      return (
        <div className="flex justify-center">
          {getPaymentStatusBadge(paymentStatus)}
        </div>
      );
    },
    meta: {
      priority: 4, // Peu importante
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    size: 120,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-xs text-center whitespace-nowrap">
          {new Date(date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      );
    },
    meta: {
      priority: 4, // Peu importante
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 200,
    cell: ({ row }) => {
      const order = row.original;
      const hasCustomerEmail = order.isGuestOrder
        ? !!order.guestEmail
        : !!order.customer?.email;

      return (
        <div className="px-2">
          <QuickOrderActions
            orderId={order.id}
            orderNumber={order.orderNumber}
            currentStatus={order.status}
            hasCustomerEmail={hasCustomerEmail}
            orgSlug={orgSlug}
          />
        </div>
      );
    },
    meta: {
      priority: 1, // Très importante
      sticky: true, // Toujours visible
    },
  },
];

// Fonction wrapper pour les colonnes (pour compatibilité)
export const ordersColumns: ColumnDef<OrderWithRelations>[] = [];