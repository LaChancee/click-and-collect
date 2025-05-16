'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarIcon, CheckIcon, ChevronsUpDown } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/features/form/submit-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Utilities
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { createPromotionAction, updatePromotionAction } from "./promotion.action";
import { PromotionFormSchemaType, PromotionSchemaForm, defaultPromotionValues } from "./promotion.schema";

type Article = {
  id: string;
  name: string;
  categoryId: string;
  category: {
    name: string;
  };
};

type PromotionFormProps = {
  orgId: string;
  orgSlug: string;
  promotion?: any;
  articles: Article[];
};

export default function PromotionForm({
  orgId,
  orgSlug,
  promotion,
  articles
}: PromotionFormProps) {
  const router = useRouter();
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Group articles by category for better selection
  const articlesByCategory: Record<string, Article[]> = {};
  articles.forEach(article => {
    const categoryName = article.category.name;
    if (!articlesByCategory[categoryName]) {
      articlesByCategory[categoryName] = [];
    }
    articlesByCategory[categoryName].push(article);
  });

  // Initialize form with default values or existing promotion
  const form = useZodForm({
    schema: PromotionSchemaForm,
    defaultValues: promotion
      ? {
        ...promotion,
        startDate: new Date(promotion.startDate),
        endDate: new Date(promotion.endDate),
        discountValue: Number(promotion.discountValue),
        minimumOrderValue: promotion.minimumOrderValue ? Number(promotion.minimumOrderValue) : null,
        articleIds: promotion.articles?.map((a: any) => a.id) || [],
        orgId,
      }
      : {
        ...defaultPromotionValues,
        orgId,
      },
  });

  // Initialize selectedArticleIds with articles from existing promotion
  useEffect(() => {
    if (promotion?.articles) {
      setSelectedArticleIds(promotion.articles.map((a: any) => a.id));
    }
  }, [promotion]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: PromotionFormSchemaType) => {
      // Add selected articles to form data
      const formData = {
        ...values,
        articleIds: selectedArticleIds,
      };

      if (promotion) {
        // Update existing promotion
        return resolveActionResult(updatePromotionAction({
          ...formData,
          id: promotion.id,
        }));
      } else {
        // Create new promotion
        return resolveActionResult(createPromotionAction(formData));
      }
    },
    onSuccess: () => {
      toast.success(promotion ? "Promotion mise à jour avec succès" : "Promotion créée avec succès");
      router.push(`/orgs/${orgSlug}/promotions`);
    },
    onError: (error) => {
      toast.error(error.message || "Une erreur est survenue");
    }
  });

  return (
    <Form
      form={form}
      className="space-y-6"
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colonne de gauche: Informations générales */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Informations générales</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la promotion</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Offre de rentrée" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la promotion..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de remise</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type de remise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Pourcentage (%)</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Montant fixe (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valeur de la remise
                      {form.watch("discountType") === "PERCENTAGE" ? " (%)" : " (€)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={form.watch("discountType") === "PERCENTAGE" ? "1" : "0.01"}
                        min="0"
                        max={form.watch("discountType") === "PERCENTAGE" ? "100" : undefined}
                        placeholder={form.watch("discountType") === "PERCENTAGE" ? "10" : "5.00"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minimumOrderValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant minimum de commande (€) - Optionnel</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Laisser vide pour aucun minimum"
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Colonne de droite: Dates, statut et produits */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Période de validité</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de début</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de fin</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        disabled={(date) =>
                          date < (form.watch("startDate") || new Date())
                        }
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Activer la promotion
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    La promotion sera visible et applicable aux commandes
                  </p>
                </div>
              </FormItem>
            )}
          />

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Produits concernés</h3>
            <div className="border rounded-md p-4">
              <p className="text-sm mb-4">
                Sélectionnez les produits auxquels cette promotion s'applique.
                Si aucun produit n'est sélectionné, la promotion s'appliquera à tous les produits.
              </p>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedArticleIds.length > 0
                      ? `${selectedArticleIds.length} produit(s) sélectionné(s)`
                      : "Tous les produits"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher un produit..." />
                    <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                    <div className="max-h-96 overflow-auto">
                      {Object.keys(articlesByCategory).map((categoryName) => (
                        <CommandGroup key={categoryName} heading={categoryName}>
                          {articlesByCategory[categoryName].map((article) => {
                            const isSelected = selectedArticleIds.includes(article.id);
                            return (
                              <CommandItem
                                key={article.id}
                                value={article.id}
                                onSelect={() => {
                                  if (isSelected) {
                                    setSelectedArticleIds(
                                      selectedArticleIds.filter(id => id !== article.id)
                                    );
                                  } else {
                                    setSelectedArticleIds([...selectedArticleIds, article.id]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => { }}
                                    className="mr-2"
                                  />
                                  {article.name}
                                </div>
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      ))}
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedArticleIds.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedArticleIds.length} produit(s) sélectionné(s)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArticleIds([])}
                  >
                    Effacer la sélection
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/orgs/${orgSlug}/promotions`)}
        >
          Annuler
        </Button>
        <LoadingButton
          type="submit"
          loading={mutation.isPending}
          disabled={mutation.isPending}
        >
          {promotion ? "Mettre à jour" : "Créer la promotion"}
        </LoadingButton>
      </div>
    </Form>
  );
} 