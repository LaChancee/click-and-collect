import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { Clock, Package, MapPin, Receipt } from "lucide-react";
import Link from "next/link";

export default async function OrdersPage() {
  const user = await getRequiredUser();

  // Récupérer les commandes du client
  const orders = await prisma.order.findMany({
    where: {
      customerEmail: user.email,
    },
    include: {
      bakery: {
        select: {
          name: true,
          slug: true,
          address: true,
        },
      },
      timeSlot: {
        select: {
          startTime: true,
          endTime: true,
          date: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "secondary" as const },
      confirmed: { label: "Confirmée", variant: "default" as const },
      preparing: { label: "En préparation", variant: "default" as const },
      ready: { label: "Prête", variant: "default" as const },
      completed: { label: "Récupérée", variant: "default" as const },
      cancelled: { label: "Annulée", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        <p className="text-gray-600">
          Retrouvez l'historique de toutes vos commandes Click & Collect
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune commande
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Vous n'avez pas encore passé de commande. Découvrez nos boulangeries partenaires !
            </p>
            <Link href="/">
              <Button>Explorer les boulangeries</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.bakery.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      {order.bakery.address}
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Détails de la commande */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Receipt className="h-4 w-4 text-gray-500" />
                      <span>Commande #{order.orderNumber}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Passée le{" "}
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Créneau de retrait */}
                  {order.timeSlot && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Retrait prévu</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.timeSlot.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                        <br />
                        {order.timeSlot.startTime} - {order.timeSlot.endTime}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-lg font-semibold">
                      {order.totalAmount.toFixed(2)}€
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Notes pour la boulangerie
                    </div>
                    <div className="text-sm text-gray-600">{order.notes}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orders/${order.id}`}>
                      Voir le détail
                    </Link>
                  </Button>
                  {order.status === "pending" && (
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  )}
                  {(order.status === "confirmed" || order.status === "preparing") && (
                    <Button variant="outline" size="sm">
                      Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 