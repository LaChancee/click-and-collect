import React from "react";
import { Plus, Clock, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
  LayoutActions,
} from "@/features/page/layout";
import { format, addDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import type { PageParams } from "@/types/next";
import { QuickTimeSlots } from "./_components/quick-time-slots";

// Définir explicitement le mode dynamique pour éviter la mise en cache
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function TimeSlotsPage(props: PageParams<{ orgSlug: string }>) {
  const params = await props.params;
  const orgSlug = params.orgSlug;

  const org = await getRequiredCurrentOrgCache();

  // Récupérer les créneaux existants pour les 7 prochains jours
  const today = startOfDay(new Date());
  const nextWeek = addDays(today, 7);

  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      bakeryId: org.id,
      startTime: {
        gte: today,
        lt: nextWeek,
      },
    },
    include: {
      _count: {
        select: {
          orders: {
            where: {
              status: { not: "CANCELLED" },
            },
          },
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // Récupérer les paramètres de la boulangerie
  const settings = await prisma.settings.findUnique({
    where: {
      bakeryId: org.id,
    },
  });

  // Grouper les créneaux par jour
  const slotsByDay = timeSlots.reduce((acc, slot) => {
    const dayKey = format(slot.startTime, "yyyy-MM-dd");
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(slot);
    return acc;
  }, {} as Record<string, typeof timeSlots>);

  // Générer les 7 prochains jours
  const nextDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Gestion des créneaux horaires
        </LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        <Button asChild variant="outline">
          <a href={`/orgs/${orgSlug}/time-slots/settings`}>
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </a>
        </Button>
        <Button asChild>
          <a href={`/orgs/${orgSlug}/time-slots/generate`}>
            <Plus className="mr-2 h-4 w-4" />
            Générer des créneaux
          </a>
        </Button>
      </LayoutActions>
      <LayoutContent>
        <div className="space-y-6">
          {/* Statistiques rapides */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Créneaux aujourd'hui
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {slotsByDay[format(today, "yyyy-MM-dd")]?.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Créneaux cette semaine
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeSlots.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes en attente
                </CardTitle>
                <Badge variant="outline" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeSlots.reduce((sum, slot) => sum + slot._count.orders, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux d'occupation
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeSlots.length > 0
                    ? Math.round(
                      (timeSlots.reduce((sum, slot) => sum + slot._count.orders, 0) /
                        timeSlots.reduce((sum, slot) => sum + slot.maxOrders, 0)) *
                      100
                    )
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Création rapide de créneaux */}
          <QuickTimeSlots orgSlug={orgSlug} />

          <Separator />

          {/* Paramètres actuels */}
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Paramètres actuels</CardTitle>
                <CardDescription>
                  Configuration des créneaux horaires pour votre boulangerie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Ouverture
                    </div>
                    <div className="text-lg font-semibold">{settings.storeOpenTime}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Fermeture
                    </div>
                    <div className="text-lg font-semibold">{settings.storeCloseTime}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Durée des créneaux
                    </div>
                    <div className="text-lg font-semibold">{settings.timeSlotDuration} min</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Max commandes/créneau
                    </div>
                    <div className="text-lg font-semibold">{settings.maxOrdersPerSlot}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Planning des créneaux */}
          <Card>
            <CardHeader>
              <CardTitle>Planning des 7 prochains jours</CardTitle>
              <CardDescription>
                Visualisez et gérez vos créneaux horaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={format(today, "yyyy-MM-dd")} className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  {nextDays.map((day) => (
                    <TabsTrigger
                      key={format(day, "yyyy-MM-dd")}
                      value={format(day, "yyyy-MM-dd")}
                      className="text-xs"
                    >
                      <div className="text-center">
                        <div className="font-medium">
                          {format(day, "EEE", { locale: fr })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(day, "d")}
                        </div>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {nextDays.map((day) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const daySlots = slotsByDay[dayKey] || [];

                  return (
                    <TabsContent key={dayKey} value={dayKey} className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            {format(day, "EEEE d MMMM yyyy", { locale: fr })}
                          </h3>
                          <Badge variant="outline">
                            {daySlots.length} créneau{daySlots.length !== 1 ? "x" : ""}
                          </Badge>
                        </div>

                        {daySlots.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucun créneau défini pour cette journée</p>
                            <Button asChild className="mt-4" variant="outline">
                              <a href={`/orgs/${orgSlug}/time-slots/generate?date=${dayKey}`}>
                                Créer des créneaux
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {daySlots.map((slot) => {
                              const occupancyRate = (slot._count.orders / slot.maxOrders) * 100;
                              const isAlmostFull = occupancyRate >= 80;
                              const isFull = slot._count.orders >= slot.maxOrders;

                              return (
                                <Card
                                  key={slot.id}
                                  className={`transition-colors ${isFull
                                    ? "border-red-200 bg-red-50"
                                    : isAlmostFull
                                      ? "border-orange-200 bg-orange-50"
                                      : "border-green-200 bg-green-50"
                                    }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="font-medium">
                                        {format(slot.startTime, "HH:mm")} -{" "}
                                        {format(slot.endTime, "HH:mm")}
                                      </div>
                                      <Badge
                                        variant={
                                          isFull
                                            ? "destructive"
                                            : isAlmostFull
                                              ? "secondary"
                                              : "default"
                                        }
                                      >
                                        {slot._count.orders}/{slot.maxOrders}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {slot._count.orders === 0
                                        ? "Aucune commande"
                                        : `${slot._count.orders} commande${slot._count.orders > 1 ? "s" : ""
                                        }`}
                                    </div>
                                    {!slot.isActive && (
                                      <Badge variant="outline" className="mt-2">
                                        Inactif
                                      </Badge>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </LayoutContent>
    </Layout>
  );
} 