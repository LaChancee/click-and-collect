"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  XCircle,
  Mail,
  Loader2
} from "lucide-react";
import { updateOrderStatusAction } from "../_actions/update-order-status.action";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { toast } from "sonner";

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
  hasCustomerEmail: boolean;
}

export function OrderStatusActions({
  orderId,
  currentStatus,
  hasCustomerEmail
}: OrderStatusActionsProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [sendEmail, setSendEmail] = useState(false);

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

  const handleStatusUpdate = (status: string) => {
    setSelectedStatus(status);
    updateStatusMutation.mutate({ status, sendEmail });
  };

  const handleCustomUpdate = () => {
    if (selectedStatus !== currentStatus) {
      updateStatusMutation.mutate({ status: selectedStatus, sendEmail });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "En attente", variant: "secondary" as const, icon: Clock },
      CONFIRMED: { label: "Confirmée", variant: "default" as const, icon: CheckCircle },
      PREPARING: { label: "En préparation", variant: "default" as const, icon: Package },
      READY: { label: "Prête", variant: "default" as const, icon: ShoppingBag },
      COMPLETED: { label: "Récupérée", variant: "default" as const, icon: CheckCircle },
      CANCELLED: { label: "Annulée", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const quickActions = [
    {
      status: "CONFIRMED",
      label: "Confirmer",
      variant: "default" as const,
      icon: CheckCircle,
      description: "Confirmer la commande",
    },
    {
      status: "PREPARING",
      label: "En préparation",
      variant: "default" as const,
      icon: Package,
      description: "Marquer comme en préparation",
    },
    {
      status: "READY",
      label: "Prête",
      variant: "default" as const,
      icon: ShoppingBag,
      description: "Marquer comme prête",
    },
    {
      status: "COMPLETED",
      label: "Récupérée",
      variant: "default" as const,
      icon: CheckCircle,
      description: "Marquer comme récupérée",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Statut de la commande</span>
          {getStatusBadge(currentStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions rapides */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Actions rapides</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isDisabled = currentStatus === action.status ||
                updateStatusMutation.isPending;

              return (
                <Button
                  key={action.status}
                  variant={action.variant}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => handleStatusUpdate(action.status)}
                  className="flex items-center gap-2 h-auto p-3 flex-col"
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-xs">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Sélection personnalisée */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium">Changement personnalisé</h4>

          <div className="space-y-3">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                <SelectItem value="PREPARING">En préparation</SelectItem>
                <SelectItem value="READY">Prête</SelectItem>
                <SelectItem value="COMPLETED">Récupérée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
              </SelectContent>
            </Select>

            {hasCustomerEmail && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                />
                <label
                  htmlFor="send-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Envoyer un email de confirmation
                </label>
              </div>
            )}

            <Button
              onClick={handleCustomUpdate}
              disabled={selectedStatus === currentStatus || updateStatusMutation.isPending}
              className="w-full"
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  Mettre à jour
                  {sendEmail && <Mail className="h-4 w-4 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </div>

        {!hasCustomerEmail && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            ℹ️ Aucun email client disponible pour cette commande
          </div>
        )}
      </CardContent>
    </Card>
  );
} 