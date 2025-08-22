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
  Loader2,
  Clock,
  X
} from "lucide-react";
import { updateOrderStatusAction } from "../[orderId]/_actions/update-order-status.action";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      PENDING: { label: "En attente", variant: "secondary" as const, color: "bg-orange-100 text-orange-800" },
      CONFIRMED: { label: "Confirmée", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      PREPARING: { label: "En préparation", variant: "default" as const, color: "bg-purple-100 text-purple-800" },
      READY: { label: "Prête", variant: "default" as const, color: "bg-green-100 text-green-800" },
      COMPLETED: { label: "Récupérée", variant: "default" as const, color: "bg-gray-100 text-gray-800" },
      CANCELLED: { label: "Annulée", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <Badge className={cn("px-3 py-1 font-medium", config.color)}>
        {config.label}
      </Badge>
    );
  };

  // Définir les actions disponibles selon le statut actuel
  const getAvailableActions = () => {
    const actions = [];

    switch (currentStatus) {
      case "PENDING":
        actions.push(
          { status: "CONFIRMED", label: "Confirmer", icon: CheckCircle, color: "bg-blue-600 hover:bg-blue-700 text-white" },
          { status: "CANCELLED", label: "Annuler", icon: X, color: "bg-red-600 hover:bg-red-700 text-white" }
        );
        break;
      case "CONFIRMED":
        actions.push(
          { status: "PREPARING", label: "En préparation", icon: Package, color: "bg-purple-600 hover:bg-purple-700 text-white" },
          { status: "CANCELLED", label: "Annuler", icon: X, color: "bg-red-600 hover:bg-red-700 text-white" }
        );
        break;
      case "PREPARING":
        actions.push(
          { status: "READY", label: "Prête", icon: ShoppingBag, color: "bg-green-600 hover:bg-green-700 text-white" }
        );
        break;
      case "READY":
        actions.push(
          { status: "COMPLETED", label: "Récupérée", icon: CheckCircle, color: "bg-gray-600 hover:bg-gray-700 text-white" }
        );
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();
  const firstAction = availableActions[0];
  const FirstActionIcon = firstAction?.icon;

  return (
    <div className="space-y-2">
      {/* Interface tablette : Boutons grands et simples */}
      <div className="block lg:hidden space-y-2">
        {availableActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.status}
              onClick={() => handleStatusUpdate(action.status, hasCustomerEmail)}
              disabled={updateStatusMutation.isPending}
              className={cn(
                "w-full h-12 text-lg font-medium flex items-center justify-center gap-3",
                action.color
              )}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              {action.label}
            </Button>
          );
        })}

        {/* Bouton voir détails */}
        <Link href={`/orgs/${orgSlug}/orders/${orderId}`}>
          <Button variant="outline" className="w-full h-10 text-sm">
            <Eye className="h-4 w-4 mr-2" />
            Voir détails
          </Button>
        </Link>
      </div>

      {/* Interface desktop : Menu déroulant compact */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Premier bouton d'action principal */}
        {firstAction && FirstActionIcon && (
          <Button
            key={firstAction.status}
            onClick={() => handleStatusUpdate(firstAction.status, hasCustomerEmail)}
            disabled={updateStatusMutation.isPending}
            size="sm"
            className={cn("flex items-center gap-1", firstAction.color)}
          >
            {updateStatusMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FirstActionIcon className="h-3 w-3" />
            )}
            {firstAction.label}
          </Button>
        )}

        {/* Menu pour les autres actions */}
        {availableActions.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={updateStatusMutation.isPending}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/orgs/${orgSlug}/orders/${orderId}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les détails
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {availableActions.slice(1).map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.status}
                    onClick={() => handleStatusUpdate(action.status)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Indicateur d'envoi d'email pour tablettes */}
      {hasCustomerEmail && (
        <div className="block lg:hidden">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
            <Mail className="h-3 w-3" />
            <span>Email envoyé automatiquement</span>
          </div>
        </div>
      )}
    </div>
  );
} 