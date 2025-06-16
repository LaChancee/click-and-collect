"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  Package,
  ShoppingBag,
  Mail,
  Eye,
  Loader2
} from "lucide-react";
import { updateOrderStatusAction } from "../[orderId]/_actions/update-order-status.action";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { toast } from "sonner";
import Link from "next/link";

interface QuickOrderActionsProps {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  hasCustomerEmail: boolean;
  orgSlug: string;
}

export function QuickOrderActions({
  orderId,
  orderNumber,
  currentStatus,
  hasCustomerEmail,
  orgSlug
}: QuickOrderActionsProps) {
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, sendEmail }: { status: string; sendEmail: boolean }) => {
      return resolveActionResult(updateOrderStatusAction({
        orderId,
        status: status as any,
        sendEmail,
      }));
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusUpdate = (status: string, sendEmail: boolean = false) => {
    updateStatusMutation.mutate({ status, sendEmail });
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

  const quickActions = [
    {
      status: "CONFIRMED",
      label: "Confirmer",
      icon: CheckCircle,
      description: "Confirmer la commande",
    },
    {
      status: "PREPARING",
      label: "En préparation",
      icon: Package,
      description: "Marquer comme en préparation",
    },
    {
      status: "READY",
      label: "Prête",
      icon: ShoppingBag,
      description: "Marquer comme prête",
    },
    {
      status: "COMPLETED",
      label: "Récupérée",
      icon: CheckCircle,
      description: "Marquer comme récupérée",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge(currentStatus)}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/orgs/${orgSlug}/orders/${orderId}`}>
              <Eye className="h-4 w-4 mr-2" />
              Voir les détails
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {quickActions.map((action) => {
            const Icon = action.icon;
            const isDisabled = currentStatus === action.status;

            return (
              <DropdownMenuItem
                key={action.status}
                disabled={isDisabled}
                onClick={() => handleStatusUpdate(action.status)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </DropdownMenuItem>
            );
          })}

          {hasCustomerEmail && (
            <>
              <DropdownMenuSeparator />
              {quickActions.map((action) => {
                const Icon = action.icon;
                const isDisabled = currentStatus === action.status;

                return (
                  <DropdownMenuItem
                    key={`${action.status}-email`}
                    disabled={isDisabled}
                    onClick={() => handleStatusUpdate(action.status, true)}
                  >
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{action.label}</span>
                      <Mail className="h-3 w-3 ml-2 text-blue-600" />
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 