import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import {
  ShoppingBag,
  TrendingUp,
  Calendar,
  Award,
  Euro,
  Store
} from "lucide-react";
import Link from "next/link";

export default async function AccountDashboard() {
  const user = await getRequiredUser();

  // Récupérer les statistiques de l'utilisateur
  const [recentOrders, orderStats, organizationInfo] = await Promise.all([
    // 3 dernières commandes
    prisma.order.findMany({
      where: {
        OR: [
          { guestEmail: user.email },
          { customer: { email: user.email } }
        ]
      },
      include: {
        customer: {
          select: {
            name: true,
            slug: true,
          },
        },
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
            bakery: {
              select: {
                name: true,
                slug: true,
              }
            }
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),

    // Statistiques des commandes
    prisma.order.aggregate({
      where: {
        OR: [
          { guestEmail: user.email },
          { customer: { email: user.email } }
        ],
        status: { not: "CANCELLED" }
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    }),

    // Informations de la boulangerie (stockée dans Organization)
    prisma.organization.findFirst({
      where: {
        isBakery: true,
      },
      select: {
        name: true,
        slug: true,
        address: true,
      }
    }),
  ]);

  const totalOrders = orderStats._count.id || 0;
  const totalSpent = Number(orderStats._sum.totalAmount || 0);

  // Dernière commande
  const lastOrder = recentOrders[0];
  const daysSinceLastOrder = lastOrder
    ? Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Moyenne de dépense par commande
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold">Mon espace client</h1>
        <p className="text-gray-600">
          Bienvenue {user.name || user.email} !
          {organizationInfo && (
            <span> Commandez chez <strong>{organizationInfo.name}</strong>.</span>
          )}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Commandes réalisées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpent.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              Depuis le début
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne par commande</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageOrderValue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              Panier moyen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière commande</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysSinceLastOrder !== null ? `${daysSinceLastOrder}j` : "Jamais"}
            </div>
            <p className="text-xs text-muted-foreground">
              Il y a
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dernières commandes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Dernières commandes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/orders">
                Voir toutes
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Aucune commande</p>
                <Link href="/">
                  <Button variant="outline" size="sm" className="mt-2">
                    Explorer
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Commande #{order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-600">
                          {Number(order.totalAmount).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      <div className="text-xs">
                        {order.status === "PENDING" && (
                          <span className="text-orange-600">En attente</span>
                        )}
                        {order.status === "CONFIRMED" && (
                          <span className="text-blue-600">Confirmée</span>
                        )}
                        {order.status === "PREPARING" && (
                          <span className="text-blue-600">En préparation</span>
                        )}
                        {order.status === "READY" && (
                          <span className="text-green-600">Prête</span>
                        )}
                        {order.status === "COMPLETED" && (
                          <span className="text-green-600">Récupérée</span>
                        )}
                        {order.status === "CANCELLED" && (
                          <span className="text-red-600">Annulée</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Store className="mr-2 h-4 w-4" />
                  Faire mes courses
                </Button>
              </Link>

              <Link href="/account/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Mes commandes
                </Button>
              </Link>

              <Link href="/account/profile" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Award className="mr-2 h-4 w-4" />
                  Mon profil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message de bienvenue ou conseils */}
      {totalOrders === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Commencez votre aventure Click & Collect !
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              {organizationInfo ? (
                <>Commandez chez <strong>{organizationInfo.name}</strong> et passez votre première commande.
                  Évitez les files d'attente et récupérez vos produits frais à l'heure qui vous convient.</>
              ) : (
                <>Passez votre première commande Click & Collect.
                  Évitez les files d'attente et récupérez vos produits frais à l'heure qui vous convient.</>
              )}
            </p>
            <Link href="/">
              <Button>
                Faire mes courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 