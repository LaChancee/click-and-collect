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
    PENDING: { label: "En attente", variant: "secondary" as const },
    CONFIRMED: { label: "Confirmée", variant: "default" as const },
    PREPARING: { label: "En préparation", variant: "default" as const },
    READY: { label: "Prête", variant: "default" as const },
    COMPLETED: { label: "Récupérée", variant: "default" as const },
    CANCELLED: { label: "Annulée", variant: "destructive" as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPaymentStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: { label: "En attente", variant: "secondary" as const },
    PAID: { label: "Payé", variant: "default" as const },
    FAILED: { label: "Échec", variant: "destructive" as const },
    REFUNDED: { label: "Remboursé", variant: "outline" as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Fonction pour créer les colonnes avec le slug de l'organisation
export const createOrdersColumns = (orgSlug: string): ColumnDef<OrderWithRelations>[] => [
  {
    accessorKey: "orderNumber",
    header: "N° Commande",
    cell: ({ row }) => {
      const orderNumber = row.getValue("orderNumber") as string;
      return (
        <div className="font-medium">
          #{orderNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Client",
    cell: ({ row }) => {
      const order = row.original;
      if (order.isGuestOrder) {
        return (
          <div>
            <div className="font-medium">{order.guestName || "Client anonyme"}</div>
            <div className="text-sm text-gray-500">{order.guestEmail}</div>
          </div>
        );
      }
      return (
        <div>
          <div className="font-medium">{order.customer?.name || "N/A"}</div>
          <div className="text-sm text-gray-500">{order.customer?.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "items",
    header: "Articles",
    cell: ({ row }) => {
      const items = row.getValue("items") as OrderWithRelations["items"];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      return (
        <div>
          <div className="font-medium">{totalItems} article{totalItems > 1 ? "s" : ""}</div>
          <div className="text-sm text-gray-500">
            {items.slice(0, 2).map(item => item.article.name).join(", ")}
            {items.length > 2 && "..."}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "timeSlot",
    header: "Créneau",
    cell: ({ row }) => {
      const timeSlot = row.getValue("timeSlot") as OrderWithRelations["timeSlot"];
      return (
        <div>
          <div className="font-medium">
            {new Date(timeSlot.date).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
          <div className="text-sm text-gray-500">
            {timeSlot.startTime} - {timeSlot.endTime}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Montant",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <div className="font-medium">
          {amount.toFixed(2)}€
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return getStatusBadge(status);
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Paiement",
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      return getPaymentStatusBadge(paymentStatus);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-sm">
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
  },
  {
    id: "actions",
    header: "Statut & Actions",
    cell: ({ row }) => {
      const order = row.original;
      const hasCustomerEmail = order.isGuestOrder
        ? !!order.guestEmail
        : !!order.customer?.email;

      return (
        <QuickOrderActions
          orderId={order.id}
          orderNumber={order.orderNumber}
          currentStatus={order.status}
          hasCustomerEmail={hasCustomerEmail}
          orgSlug={orgSlug}
        />
      );
    },
  },
];

// Fonction wrapper pour les colonnes (pour compatibilité)
export const ordersColumns: ColumnDef<OrderWithRelations>[] = []; 