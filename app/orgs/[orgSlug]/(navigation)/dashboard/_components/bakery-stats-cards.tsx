import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrg } from "@/lib/organizations/get-org";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  Package,
  Euro,
  AlertCircle
} from "lucide-react";

export async function BakeryStatsCards() {
  const org = await getRequiredCurrentOrg();

  // Récupérer les statistiques de la boulangerie
  const [
    totalOrders,
    todayOrders,
    totalRevenue,
    todayRevenue,
    totalProducts,
    activeTimeSlots,
    pendingOrders,
    completedOrdersToday
  ] = await Promise.all([
    // Total des commandes
    prisma.order.count({
      where: {
        timeSlot: {
          bakeryId: org.id
        }
      }
    }),

    // Commandes d'aujourd'hui
    prisma.order.count({
      where: {
        timeSlot: {
          bakeryId: org.id
        },
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),

    // Chiffre d'affaires total
    prisma.order.aggregate({
      where: {
        timeSlot: {
          bakeryId: org.id
        },
        status: "COMPLETED"
      },
      _sum: {
        totalAmount: true
      }
    }),

    // Chiffre d'affaires d'aujourd'hui
    prisma.order.aggregate({
      where: {
        timeSlot: {
          bakeryId: org.id
        },
        status: "COMPLETED",
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: {
        totalAmount: true
      }
    }),

    // Nombre de produits
    prisma.article.count({
      where: {
        bakeryId: org.id,
        isActive: true
      }
    }),

    // Créneaux actifs aujourd'hui
    prisma.timeSlot.count({
      where: {
        bakeryId: org.id,
        isActive: true,
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),

    // Commandes en attente
    prisma.order.count({
      where: {
        timeSlot: {
          bakeryId: org.id
        },
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING"]
        }
      }
    }),

    // Commandes terminées aujourd'hui
    prisma.order.count({
      where: {
        timeSlot: {
          bakeryId: org.id
        },
        status: "COMPLETED",
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ]);

  const stats = [
    {
      title: "Chiffre d'affaires total",
      value: `${Number(totalRevenue._sum.totalAmount || 0).toFixed(2)}€`,
      description: `+${Number(todayRevenue._sum.totalAmount || 0).toFixed(2)}€ aujourd'hui`,
      icon: Euro,
      trend: "up" as const,
      color: "text-green-600"
    },
    {
      title: "Commandes totales",
      value: totalOrders.toString(),
      description: `${todayOrders} nouvelles aujourd'hui`,
      icon: ShoppingCart,
      trend: "up" as const,
      color: "text-blue-600"
    },
    {
      title: "Commandes en attente",
      value: pendingOrders.toString(),
      description: `${completedOrdersToday} terminées aujourd'hui`,
      icon: Clock,
      trend: pendingOrders > 5 ? "warning" as const : "neutral" as const,
      color: pendingOrders > 5 ? "text-orange-600" : "text-gray-600"
    },
    {
      title: "Produits actifs",
      value: totalProducts.toString(),
      description: `${activeTimeSlots} créneaux aujourd'hui`,
      icon: Package,
      trend: "neutral" as const,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.trend === "up" && (
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Croissance
                </Badge>
              )}
              {stat.trend === "warning" && (
                <Badge variant="secondary" className="text-orange-600 bg-orange-50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Attention
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 