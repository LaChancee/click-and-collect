'use client'

import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/features/form/submit-button";
import { updateTimeSlotSettingsAction } from "../_actions/update-settings.action";
import { TimeSlotSettingsSchema } from "../_schemas/time-slot-settings.schema";
import { z } from "zod";

type TimeSlotSettingsFormType = z.infer<typeof TimeSlotSettingsSchema>;

interface TimeSlotSettingsFormProps {
  orgSlug: string;
  settings: {
    id: string;
    storeOpenTime: string;
    storeCloseTime: string;
    timeSlotDuration: number;
    maxOrdersPerSlot: number;
    preOrderDaysAhead: number;
    minOrderValue?: number | null;
  };
}

export function TimeSlotSettingsForm({ orgSlug, settings }: TimeSlotSettingsFormProps) {
  const router = useRouter();

  const form = useZodForm({
    schema: TimeSlotSettingsSchema,
    defaultValues: {
      storeOpenTime: settings.storeOpenTime,
      storeCloseTime: settings.storeCloseTime,
      timeSlotDuration: settings.timeSlotDuration,
      maxOrdersPerSlot: settings.maxOrdersPerSlot,
      preOrderDaysAhead: settings.preOrderDaysAhead,
      minOrderValue: settings.minOrderValue ? Number(settings.minOrderValue) : undefined,
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: TimeSlotSettingsFormType) => {
      return resolveActionResult(updateTimeSlotSettingsAction({
        ...values,
        settingsId: settings.id,
      }));
    },
    onSuccess: () => {
      toast.success("Paramètres mis à jour avec succès");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour des paramètres");
    }
  });

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
          <CardTitle>Horaires d'ouverture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="storeOpenTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure d'ouverture</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeCloseTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de fermeture</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration des créneaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="timeSlotDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée des créneaux (en minutes)</FormLabel>
                <FormControl>
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxOrdersPerSlot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre maximum de commandes par créneau</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="20"
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
            name="preOrderDaysAhead"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de jours de commande à l'avance</FormLabel>
                <FormControl>
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le nombre de jours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 jour</SelectItem>
                      <SelectItem value="2">2 jours</SelectItem>
                      <SelectItem value="3">3 jours</SelectItem>
                      <SelectItem value="7">1 semaine</SelectItem>
                      <SelectItem value="14">2 semaines</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="minOrderValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant minimum de commande (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optionnel"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <SubmitButton
            type="submit"
            disabled={mutation.isPending}
            className="w-full"
          >
            Enregistrer les paramètres
          </SubmitButton>
        </CardFooter>
      </Card>
    </Form>
  );
} 