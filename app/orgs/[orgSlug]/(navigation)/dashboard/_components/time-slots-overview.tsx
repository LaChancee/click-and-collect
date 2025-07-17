import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrg } from "@/lib/organizations/get-org";
import { Clock, Users, AlertCircle } from "lucide-react";
import Link from "next/link";

export async function TimeSlotsOverview() {
  const org = await getRequiredCurrentOrg();

  // Récupérer les créneaux d'aujourd'hui avec leurs commandes
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayTimeSlots = await prisma.timeSlot.findMany({
    where: {
      bakeryId: org.id,
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      },
      isActive: true
    },
    include: {
      orders: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "PREPARING", "READY"]
          }
        }
      }
    },
    orderBy: {
      startTime: 'asc'
    }
  });

  const getSlotsStatus = (orders: any[], maxOrders: number) => {
    const occupancy = (orders.length / maxOrders) * 100;

    if (occupancy >= 90) return { status: "full", color: "text-red-600", bg: "bg-red-50" };
    if (occupancy >= 70) return { status: "busy", color: "text-orange-600", bg: "bg-orange-50" };
    if (occupancy >= 30) return { status: "moderate", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { status: "available", color: "text-green-600", bg: "bg-green-50" };
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      full: "Complet",
      busy: "Chargé",
      moderate: "Modéré",
      available: "Disponible"
    };
    return labels[status as keyof typeof labels] || "Disponible";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Créneaux d'aujourd'hui</CardTitle>
        <CardDescription>
          {todayTimeSlots.length} créneaux programmés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todayTimeSlots.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Aucun créneau aujourd'hui
            </div>
          ) : (
            todayTimeSlots.slice(0, 6).map((slot) => {
              const slotStatus = getSlotsStatus(slot.orders, slot.maxOrders);
              const occupancyRate = (slot.orders.length / slot.maxOrders) * 100;

              return (
                <div key={slot.id} className="p-3 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {new Date(slot.startTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })} - {new Date(slot.endTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <Badge
                      variant="secondary"
                      className={`${slotStatus.color} ${slotStatus.bg} text-xs`}
                    >
                      {getStatusLabel(slotStatus.status)}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-muted-foreground mb-2 gap-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {slot.orders.length}/{slot.maxOrders} commandes
                    </span>
                    <span className="text-xs">{Math.round(occupancyRate)}% occupé</span>
                  </div>

                  <Progress value={occupancyRate} className="h-2" />

                  {occupancyRate >= 90 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      Créneau presque complet
                    </div>
                  )}
                </div>
              );
            })
          )}

          {todayTimeSlots.length > 6 && (
            <div className="text-center text-sm text-muted-foreground">
              +{todayTimeSlots.length - 6} autres créneaux
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href={`/orgs/${org.slug}/time-slots`}>
              Gérer les créneaux
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 