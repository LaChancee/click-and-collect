"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { quickGenerateTimeSlotsAction } from "../_actions/quick-generate-time-slots.action";

interface QuickTimeSlotsProps {
  orgSlug: string;
}

// Configurations prédéfinies
const QUICK_CONFIGS = [
  {
    id: "morning",
    name: "Matinée (8h-12h)",
    description: "Créneaux de 30min pour le matin",
    icon: "☀️",
    config: {
      startTime: "08:00",
      endTime: "12:00",
      duration: 30,
      maxOrders: 5,
      days: 7
    }
  },
  {
    id: "afternoon",
    name: "Après-midi (14h-18h)",
    description: "Créneaux de 30min pour l'après-midi",
    icon: "🌆",
    config: {
      startTime: "14:00",
      endTime: "18:00",
      duration: 30,
      maxOrders: 5,
      days: 7
    }
  },
  {
    id: "fullday",
    name: "Journée complète (8h-18h)",
    description: "Créneaux de 30min toute la journée",
    icon: "📅",
    config: {
      startTime: "08:00",
      endTime: "18:00",
      duration: 30,
      maxOrders: 5,
      days: 7
    }
  },
  {
    id: "weekend",
    name: "Week-end seulement",
    description: "Samedi et dimanche (9h-17h)",
    icon: "🎉",
    config: {
      startTime: "09:00",
      endTime: "17:00",
      duration: 30,
      maxOrders: 8,
      days: 2,
      weekendOnly: true
    }
  }
];

export function QuickTimeSlots(props: QuickTimeSlotsProps) {
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (configId: string) => {
      const config = QUICK_CONFIGS.find(c => c.id === configId);
      if (!config) throw new Error("Configuration non trouvée");

      return resolveActionResult(quickGenerateTimeSlotsAction({
        ...config.config,
        orgId: props.orgSlug
      }));
    },
    onSuccess: (result) => {
      toast.success(`${result.createdCount} créneaux créés avec succès !`);
      setSelectedConfig(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création des créneaux");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Créer des créneaux rapidement
        </CardTitle>
        <CardDescription>
          Choisissez une configuration prédéfinie pour créer vos créneaux en un clic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {QUICK_CONFIGS.map((config) => (
            <div
              key={config.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                ${selectedConfig === config.id ? 'border-primary bg-primary/5' : 'border-border'}
              `}
              onClick={() => setSelectedConfig(config.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h3 className="font-medium">{config.name}</h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                {selectedConfig === config.id && (
                  <Badge variant="default" className="text-xs">Sélectionné</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {config.config.startTime} - {config.config.endTime}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {config.config.weekendOnly ? 'Weekend' : `${config.config.days}j`}
                </div>
              </div>

              {selectedConfig === config.id && (
                <div className="mt-4 pt-3 border-t">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      mutation.mutate(config.id);
                    }}
                    disabled={mutation.isPending}
                    className="w-full"
                    size="sm"
                  >
                    {mutation.isPending ? 'Création...' : 'Créer ces créneaux'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Astuce :</strong> Ces configurations créent des créneaux pour les 7 prochains jours.
            Pour des options avancées, utilisez le générateur complet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 