import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { User, Mail, Calendar, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getRequiredUser();

  // Récupérer les statistiques du client
  const stats = await prisma.order.aggregate({
    where: {
      customerEmail: user.email,
      status: "completed",
    },
    _count: {
      id: true,
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Récupérer les boulangeries favorites (basé sur les commandes)
  const favoriteBakeries = await prisma.order.groupBy({
    by: ["bakeryId"],
    where: {
      customerEmail: user.email,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 3,
  });

  const bakeries = await prisma.organization.findMany({
    where: {
      id: {
        in: favoriteBakeries.map(fb => fb.bakeryId),
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-gray-600">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nom</label>
              <div className="mt-1 text-gray-900">{user.name || "Non renseigné"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                {user.email}
                {user.emailVerified && (
                  <Badge variant="secondary" className="text-xs">
                    Vérifié
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Membre depuis</label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button variant="outline">
              Modifier mes informations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats._count.id}</div>
                <div className="text-sm text-gray-600">Commandes terminées</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats._sum.totalAmount ? `${stats._sum.totalAmount.toFixed(0)}€` : "0€"}
                </div>
                <div className="text-sm text-gray-600">Total dépensé</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{bakeries.length}</div>
                <div className="text-sm text-gray-600">Boulangeries visitées</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boulangeries favorites */}
      {bakeries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mes boulangeries préférées</CardTitle>
            <p className="text-sm text-gray-600">
              Basé sur vos commandes précédentes
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bakeries.map((bakery) => {
                const orderCount = favoriteBakeries.find(fb => fb.bakeryId === bakery.id)?._count.id || 0;
                return (
                  <div key={bakery.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold">{bakery.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{bakery.address}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary">
                        {orderCount} commande{orderCount > 1 ? 's' : ''}
                      </Badge>
                      <Link href={`/?bakery=${bakery.slug}`}>
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/account/orders">
              <Button variant="outline">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Voir mes commandes
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                Explorer les boulangeries
              </Button>
            </Link>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Préférences email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 