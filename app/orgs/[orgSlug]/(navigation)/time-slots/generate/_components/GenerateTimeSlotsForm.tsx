'use client'

import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardTitle, CardHeader, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/features/form/submit-button";
import { generateTimeSlotsAction } from "../_actions/generate-time-slots.action";
import { GenerateTimeSlotsSchema } from "../_schemas/generate-time-slots.schema";
import { z } from "zod";
import { format, addDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, AlertCircle } from "lucide-react";

type GenerateTimeSlotsFormType = z.infer<typeof GenerateTimeSlotsSchema>;

interface GenerateTimeSlotsFormProps {
  orgSlug: string;
  selectedDate?: string;
  settings: {
    id: string;
    storeOpenTime: string;
    storeCloseTime: string;
    timeSlotDuration: number;
    maxOrdersPerSlot: number;
    preOrderDaysAhead: number;
  };
}

export function GenerateTimeSlotsForm({ orgSlug, selectedDate, settings }: GenerateTimeSlotsFormProps) {
  const router = useRouter();

  // Calculer les dates par défaut
  const today = startOfDay(new Date());
  const defaultStartDate = selectedDate || format(today, "yyyy-MM-dd");
  const defaultEndDate = format(addDays(today, 6), "yyyy-MM-dd");

  const form = useZodForm({
    schema: GenerateTimeSlotsSchema,
    defaultValues: {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      startTime: settings.storeOpenTime,
      endTime: settings.storeCloseTime,
      duration: settings.timeSlotDuration,
      maxOrders: settings.maxOrdersPerSlot,
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Lundi à Samedi par défaut
      replaceExisting: false,
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: GenerateTimeSlotsFormType) => {
      return resolveActionResult(generateTimeSlotsAction(values));
    },
    onSuccess: (data) => {
      toast.success(`${data.createdCount} créneaux générés avec succès`);
      router.push(`/orgs/${orgSlug}/time-slots`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la génération des créneaux");
    }
  });

  // Calculer le nombre de créneaux qui seront générés
  const watchedValues = form.watch();
  const estimatedSlots = React.useMemo(() => {
    if (!watchedValues.startTime || !watchedValues.endTime || !watchedValues.duration) {
      return 0;
    }

    const [startHour, startMinute] = watchedValues.startTime.split(':').map(Number);
    const [endHour, endMinute] = watchedValues.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const totalMinutes = endMinutes - startMinutes;
    
    if (totalMinutes <= 0) return 0;
    
    const slotsPerDay = Math.floor(totalMinutes / watchedValues.duration);
    const selectedDays = watchedValues.daysOfWeek?.length || 0;
    
    // Calculer le nombre de jours entre les dates
    const start = new Date(watchedValues.startDate);
    const end = new Date(watchedValues.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return slotsPerDay * selectedDays * Math.ceil(daysDiff / 7);
  }, [watchedValues]);

  const daysOfWeekOptions = [
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" },
    { value: 0, label: "Dimanche" },
  ];

  return (
    <Form
      form={form}
      className="flex flex-col gap-6"
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Période de génération
          </CardTitle>
          <CardDescription>
            Sélectionnez la période pour laquelle vous souhaitez générer des créneaux
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="daysOfWeek"
            render={() => (
              <FormItem>
                <FormLabel>Jours de la semaine</FormLabel>
                <div className="grid grid-cols-4 gap-3">
                  {daysOfWeekOptions.map((day) => (
                    <FormField
                      key={day.value}
                      control={form.control}
                      name="daysOfWeek"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={day.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, day.value])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== day.value
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuration des créneaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de début</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de fin</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="15" 
                      max="120" 
                      step="15"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxOrders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max commandes/créneau</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="replaceExisting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Remplacer les créneaux existants</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Si coché, les créneaux existants seront supprimés et remplacés
                  </p>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Aperçu */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              ~{estimatedSlots} créneaux
            </Badge>
            {estimatedSlots > 100 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Nombre élevé de créneaux</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton
            type="submit" 
            disabled={mutation.isPending || estimatedSlots === 0}
            className="w-full"
          >
            {mutation.isPending ? "Génération en cours..." : "Générer les créneaux"}
          </SubmitButton>
        </CardFooter>
      </Card>
    </Form>
  );
} 