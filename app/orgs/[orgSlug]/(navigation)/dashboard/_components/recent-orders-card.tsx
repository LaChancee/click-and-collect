import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrg } from "@/lib/organizations/get-org";
import { Clock, User, Euro } from "lucide-react";
import Link from "next/link";

export async function RecentOrdersCard() {
  const org = await getRequiredCurrentOrg();

  // Récupérer les 5 commandes les plus récentes
  const recentOrders = await prisma.order.findMany({
    where: {
      timeSlot: {
        bakeryId: org.id
      }
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true
        }
      },
      timeSlot: {
        select: {
          startTime: true,
          endTime: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 5
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "En attente", variant: "secondary" as const },
      CONFIRMED: { label: "Confirmée", variant: "default" as const },
      PREPARING: { label: "En préparation", variant: "default" as const },
      READY: { label: "Prête", variant: "default" as const },
      COMPLETED: { label: "Terminée", variant: "outline" as const },
      CANCELLED: { label: "Annulée", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes récentes</CardTitle>
        <CardDescription>
          Les {recentOrders.length} dernières commandes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Aucune commande récente
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">#{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {order.customer?.name || order.guestName || "Client invité"}
                    </div>

                    <div className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      {Number(order.totalAmount).toFixed(2)}€
                    </div>

                    {order.timeSlot && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.timeSlot.startTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {recentOrders.length > 0 && (
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/orgs/${org.slug}/orders`}>
                Voir toutes les commandes
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 