import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Clock, Package, User, Receipt, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { getRequiredCurrentOrg } from "@/lib/organizations/get-org";
import { OrdersDataTable } from "./orders-data-table";

interface OrdersPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { orgSlug } = await params;
  const organization = await getRequiredCurrentOrg();

  // Récupérer toutes les commandes de la boulangerie
  const ordersRaw = await prisma.order.findMany({
    where: {
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
      timeSlot: true,
      items: {
        include: {
          article: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transformer les données pour les composants client
  const orders = ordersRaw.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    customer: order.customer ? {
      name: order.customer.name,
      email: order.customer.email || "",
    } : null,
    timeSlot: {
      startTime: order.timeSlot.startTime.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      endTime: order.timeSlot.endTime.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: order.timeSlot.startTime, // Use startTime as the date
    },
    items: order.items.map(item => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      article: {
        ...item.article,
        price: Number(item.article.price),
      },
    })),
  }));

  // Statistiques rapides
  const stats = {
    total: orders.length,
    pending: orders.filter(order => order.status === "PENDING").length,
    confirmed: orders.filter(order => order.status === "CONFIRMED").length,
    preparing: orders.filter(order => order.status === "PREPARING").length,
    ready: orders.filter(order => order.status === "READY").length,
    completed: orders.filter(order => order.status === "COMPLETED").length,
    cancelled: orders.filter(order => order.status === "CANCELLED").length,
  };

  const todayRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() &&
        order.status !== "CANCELLED";
    })
    .reduce((sum, order) => sum + Number(order.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion des commandes</h1>
        <p className="text-gray-600">
          Suivez et gérez toutes les commandes Click & Collect de votre boulangerie
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En préparation</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.preparing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires aujourd'hui</CardTitle>
            <Receipt className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{todayRevenue.toFixed(2)}€</div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersDataTable orgSlug={orgSlug} data={orders} />
        </CardContent>
      </Card>
    </div>
  );
} 