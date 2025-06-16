import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Clock, Package, User, Receipt, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequiredCurrentOrg } from "@/lib/organizations/get-org";
import { OrderStatusActions } from "./_components/OrderStatusActions";

interface OrderDetailPageProps {
  params: {
    orgSlug: string;
    orderId: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const organization = await getRequiredCurrentOrg();

  // Récupérer la commande spécifique
  const order = await prisma.order.findFirst({
    where: {
      id: params.orderId,
      timeSlot: {
        bakeryId: organization.id,
      },
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      timeSlot: {
        select: {
          startTime: true,
          endTime: true,
        },
      },
      items: {
        include: {
          article: {
            select: {
              name: true,
              price: true,
              description: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

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

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Déterminer si le client a un email
  const hasCustomerEmail = order.isGuestOrder
    ? !!order.guestEmail
    : !!order.customer?.email;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orgs/${params.orgSlug}/orders`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux commandes
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Commande #{order.orderNumber}</h1>
          <p className="text-gray-600">
            Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles commandés */}
          <Card>
            <CardHeader>
              <CardTitle>Articles commandés ({totalItems} article{totalItems > 1 ? "s" : ""})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.article.image && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                        <img
                          src={item.article.image}
                          alt={item.article.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.article.name}</h3>
                      {item.article.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.article.description}</p>
                      )}
                      {item.notes && (
                        <p className="text-sm text-blue-600 mt-1">
                          <strong>Note:</strong> {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {item.quantity} × {Number(item.unitPrice).toFixed(2)}€
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: {(item.quantity * Number(item.unitPrice)).toFixed(2)}€
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes de la commande */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes pour la boulangerie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar avec informations */}
        <div className="space-y-6">
          {/* Statut et actions */}
          <OrderStatusActions
            orderId={order.id}
            currentStatus={order.status}
            hasCustomerEmail={hasCustomerEmail}
          />

          {/* Statut de paiement */}
          <Card>
            <CardHeader>
              <CardTitle>Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Statut:</span>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              {order.paymentMethod && (
                <div className="text-sm text-gray-600">
                  Mode: {order.paymentMethod === "CARD_ONLINE" ? "Carte en ligne" :
                    order.paymentMethod === "CARD_INSTORE" ? "Carte en magasin" :
                      "Espèces en magasin"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.isGuestOrder ? (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{order.guestName || "Client anonyme"}</span>
                  </div>
                  {order.guestEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{order.guestEmail}</span>
                    </div>
                  )}
                  {order.guestPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{order.guestPhone}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{order.customer?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{order.customer?.email}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Créneau de retrait */}
          <Card>
            <CardHeader>
              <CardTitle>Créneau de retrait</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">
                    {new Date(order.timeSlot.startTime).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.timeSlot.startTime.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - {order.timeSlot.endTime.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Récapitulatif financier */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{Number(order.totalAmount).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Total:</span>
                <span>{Number(order.totalAmount).toFixed(2)}€</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 