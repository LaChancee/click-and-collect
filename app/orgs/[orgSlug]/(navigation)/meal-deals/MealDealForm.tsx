'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, PlusCircle } from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/features/form/submit-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Other components
import { ImageUploader } from "../articles/components/ImageUploader";

// Libraries and utilities
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import {
  MealDealFormSchemaType,
  MealDealItemType,
  MealDealWithItemsSchema,
  defaultMealDealValues
} from "./meal-deal.schema";
import { createMealDealAction, updateMealDealAction } from "./meal-deal.action";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types
type Article = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  category: {
    name: string;
  };
};

type MealDealItem = {
  id?: string;
  articleId: string;
  article?: {
    name: string;
    price: number;
  };
  quantity: number;
  required: boolean;
  groupName: string | undefined;
};

type MealDeal = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  isActive: boolean;
  position: number;
  imageUrl: string | null;
  items: MealDealItem[];
};

type MealDealFormProps = {
  orgId: string;
  orgSlug: string;
  mealDeal?: MealDeal;
  articles: Article[];
};

// Helper to group articles by category
const groupArticlesByCategory = (articles: Article[]) => {
  const result: Record<string, Article[]> = {};
  articles.forEach(article => {
    const categoryName = article.category.name;
    if (!result[categoryName]) {
      result[categoryName] = [];
    }
    result[categoryName].push(article);
  });
  return result;
};

// Sortable Item Component
function SortableItem({ id, item, absoluteIndex, handleRemoveItem, handleUpdateQuantity, handleUpdateRequired, article }: {
  id: string;
  item: MealDealItem;
  absoluteIndex: number;
  handleRemoveItem: (index: number) => void;
  handleUpdateQuantity: (index: number, quantity: number) => void;
  handleUpdateRequired: (index: number, required: boolean) => void;
  article?: Article;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-md p-3 bg-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          </div>
          <div>
            <p className="font-medium">
              {article?.name || item.article?.name || "Produit inconnu"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <label className="text-xs text-muted-foreground">Qté:</label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(absoluteIndex, parseInt(e.target.value) || 1)}
                  className="w-16 h-7 text-xs"
                />
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id={`required-${absoluteIndex}`}
                  checked={item.required}
                  onCheckedChange={(checked) => handleUpdateRequired(absoluteIndex, !!checked)}
                />
                <label
                  htmlFor={`required-${absoluteIndex}`}
                  className="text-xs cursor-pointer"
                >
                  Obligatoire
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {article?.price
              ? `${(article.price * item.quantity).toFixed(2)}€`
              : item.article?.price
                ? `${(item.article.price * item.quantity).toFixed(2)}€`
                : "Prix inconnu"
            }
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveItem(absoluteIndex)}
            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MealDealForm({
  orgId,
  orgSlug,
  mealDeal,
  articles
}: MealDealFormProps) {
  const router = useRouter();
  const articlesByCategory = groupArticlesByCategory(articles);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // State for meal deal items
  const [mealDealItems, setMealDealItems] = useState<MealDealItem[]>(
    mealDeal?.items.map(item => ({
      ...item,
      groupName: item.groupName || undefined
    })) || []
  );

  // State for managing groups
  const [groups, setGroups] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState("");

  // Extract existing groups from meal deal items
  useEffect(() => {
    if (mealDeal?.items) {
      const existingGroups = mealDeal.items
        .map(item => item.groupName)
        .filter((groupName): groupName is string => !!groupName);

      setGroups([...new Set(existingGroups)]);
    }
  }, [mealDeal]);

  // Initialize form with default values or existing meal deal
  const form = useZodForm({
    schema: MealDealWithItemsSchema,
    defaultValues: mealDeal
      ? {
        ...mealDeal,
        price: Number(mealDeal.price),
        description: mealDeal.description || undefined,
        items: mealDeal.items.map(item => ({
          articleId: item.articleId,
          quantity: item.quantity,
          required: item.required,
          groupName: item.groupName || undefined
        })),
        orgId,
      }
      : {
        ...defaultMealDealValues,
        items: [],
        orgId,
      },
  });

  // Handle adding a new item to the meal deal
  const handleAddItem = (articleId: string, groupName: string | undefined = undefined) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const newItem: MealDealItem = {
      articleId,
      article: {
        name: article.name,
        price: article.price,
      },
      quantity: 1,
      required: false,
      groupName,
    };

    setMealDealItems([...mealDealItems, newItem]);
  };

  // Handle removing an item from the meal deal
  const handleRemoveItem = (index: number) => {
    const newItems = [...mealDealItems];
    newItems.splice(index, 1);
    setMealDealItems(newItems);
  };

  // Handle updating item quantity
  const handleUpdateQuantity = (index: number, quantity: number) => {
    const newItems = [...mealDealItems];
    newItems[index].quantity = quantity;
    setMealDealItems(newItems);
  };

  // Handle updating item required status
  const handleUpdateRequired = (index: number, required: boolean) => {
    const newItems = [...mealDealItems];
    newItems[index].required = required;
    setMealDealItems(newItems);
  };

  // Handle adding a new group
  const handleAddGroup = () => {
    if (newGroup && !groups.includes(newGroup)) {
      setGroups([...groups, newGroup]);
      setNewGroup("");
    }
  };

  // Handle drag and drop reordering of items
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setMealDealItems((items) => {
      const oldIndex = items.findIndex((item, index) =>
        `${item.articleId}-${item.groupName || "no-group"}` === active.id
      );
      const newIndex = items.findIndex((item, index) =>
        `${item.articleId}-${item.groupName || "no-group"}` === over.id
      );

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  // Calculate total price of all required items
  const totalRequiredItemsPrice = mealDealItems
    .filter(item => item.required)
    .reduce((sum, item) => {
      const article = articles.find(a => a.id === item.articleId);
      return sum + (article ? article.price * item.quantity : 0);
    }, 0);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: MealDealFormSchemaType) => {
      // Add meal deal items to form data
      const formData = {
        ...values,
        items: mealDealItems.map(item => ({
          articleId: item.articleId,
          quantity: item.quantity,
          required: item.required,
          groupName: item.groupName
        })),
      };

      if (mealDeal) {
        // Update existing meal deal
        return resolveActionResult(updateMealDealAction({
          ...formData,
          id: mealDeal.id,
        }));
      } else {
        // Create new meal deal
        return resolveActionResult(createMealDealAction(formData));
      }
    },
    onSuccess: () => {
      toast.success(mealDeal ? "Formule mise à jour avec succès" : "Formule créée avec succès");
      router.push(`/orgs/${orgSlug}/meal-deals`);
    },
    onError: (error) => {
      toast.error(error.message || "Une erreur est survenue");
    }
  });

  // Validate submit button state
  const isFormValid = mealDealItems.length > 0 && form.formState.isValid;
  const hasRequiredItems = mealDealItems.some(item => item.required);

  return (
    <Form
      form={form}
      className="space-y-6"
      onSubmit={async (values) => {
        if (mealDealItems.length === 0) {
          toast.error("Vous devez ajouter au moins un produit à la formule");
          return;
        }

        if (!hasRequiredItems) {
          toast.error("Vous devez marquer au moins un produit comme obligatoire");
          return;
        }

        await mutation.mutateAsync(values);
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Colonne de gauche: Informations générales */}
        <div className="md:col-span-1 space-y-6">
          <h3 className="text-lg font-medium">Informations générales</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la formule</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Menu Déjeuner" {...field} />
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
                      placeholder="Décrivez la formule..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix de la formule (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {totalRequiredItemsPrice > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Prix total des articles obligatoires : {totalRequiredItemsPrice.toFixed(2)}€
                      {field.value > 0 && (
                        <span className={
                          field.value < totalRequiredItemsPrice ? "text-red-500" : "text-green-500"
                        }>
                          {field.value < totalRequiredItemsPrice
                            ? ` (${(field.value - totalRequiredItemsPrice).toFixed(2)}€)`
                            : ` (+${(field.value - totalRequiredItemsPrice).toFixed(2)}€)`}
                        </span>
                      )}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position d'affichage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Position"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      Activer la formule
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      La formule sera visible et disponible à la commande
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image de la formule</FormLabel>
                  <FormControl>
                    <ImageUploader
                      imageUrl={field.value}
                      onImageUploaded={(url) => field.onChange(url)}
                      onImageRemoved={() => field.onChange(null)}
                      uploadOnSubmit={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Colonnes du milieu et de droite: Gestion des groupes et produits */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Composition de la formule</h3>

            <div className="flex gap-2 items-center">
              <Input
                placeholder="Nouveau groupe..."
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="w-48"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddGroup}
                disabled={!newGroup.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne pour ajouter des produits */}
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4 bg-muted/50 rounded-t-md">
                  <h4 className="font-medium">Catalogue de produits</h4>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez les produits à ajouter à votre formule
                  </p>
                </div>

                <ScrollArea className="h-[60vh] p-4">
                  <div className="space-y-6">
                    {Object.keys(articlesByCategory).length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">Aucun produit disponible</p>
                      </div>
                    ) : (
                      Object.entries(articlesByCategory).map(([categoryName, categoryArticles]) => (
                        <div key={categoryName} className="space-y-2">
                          <h5 className="font-medium text-sm">{categoryName}</h5>
                          <div className="grid grid-cols-1 gap-2">
                            {categoryArticles.map((article) => (
                              <div key={article.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-accent">
                                <div>
                                  <p className="font-medium">{article.name}</p>
                                  <p className="text-xs text-muted-foreground">{Number(article.price).toFixed(2)}€</p>
                                </div>
                                <div className="flex gap-2">
                                  <Select
                                    onValueChange={(value) => {
                                      if (value === "no-group") {
                                        handleAddItem(article.id);
                                      } else {
                                        handleAddItem(article.id, value);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-[130px] h-8">
                                      <SelectValue placeholder="Ajouter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="no-group">Sans groupe</SelectItem>
                                      {groups.map((group) => (
                                        <SelectItem key={group} value={group}>
                                          {group}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Colonne pour afficher et gérer les produits de la formule */}
            <div className="space-y-4">
              <div className="rounded-md border min-h-[200px]">
                <div className="p-4 bg-muted/50 rounded-t-md">
                  <h4 className="font-medium">Produits de la formule</h4>
                  <p className="text-sm text-muted-foreground">
                    Organisez les produits et définissez ceux qui sont obligatoires
                  </p>
                </div>

                <div className="p-4 space-y-4 min-h-[300px]">
                  {mealDealItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-md text-center p-4">
                      <p className="text-muted-foreground mb-2">Aucun produit ajouté</p>
                      <p className="text-xs text-muted-foreground">
                        Ajoutez des produits depuis le catalogue pour composer votre formule
                      </p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Group items by groupName */}
                      {
                        [undefined, ...groups].map((groupName) => {
                          const groupItems = mealDealItems.filter(item => item.groupName === groupName);
                          if (groupItems.length === 0) return null;

                          const itemIds = groupItems.map(item => `${item.articleId}-${item.groupName || "no-group"}`);

                          return (
                            <div key={groupName || "no-group"} className="space-y-2">
                              {groupName && (
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium text-sm">{groupName}</h5>
                                </div>
                              )}

                              <SortableContext
                                items={itemIds}
                                strategy={verticalListSortingStrategy}
                              >
                                {groupItems.map((item) => {
                                  const absoluteIndex = mealDealItems.findIndex(i =>
                                    i.articleId === item.articleId &&
                                    i.groupName === item.groupName
                                  );

                                  const article = articles.find(a => a.id === item.articleId);
                                  const itemId = `${item.articleId}-${item.groupName || "no-group"}`;

                                  return (
                                    <SortableItem
                                      key={itemId}
                                      id={itemId}
                                      item={item}
                                      absoluteIndex={absoluteIndex}
                                      handleRemoveItem={handleRemoveItem}
                                      handleUpdateQuantity={handleUpdateQuantity}
                                      handleUpdateRequired={handleUpdateRequired}
                                      article={article}
                                    />
                                  );
                                })}
                              </SortableContext>
                            </div>
                          );
                        })
                      }
                    </DndContext>
                  )}
                </div>
              </div>

              {mealDealItems.length > 0 && (
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Récapitulatif</p>
                      <p className="text-sm text-muted-foreground">
                        {mealDealItems.length} produit{mealDealItems.length > 1 ? 's' : ''}, dont {mealDealItems.filter(i => i.required).length} obligatoire{mealDealItems.filter(i => i.required).length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Valeur totale des articles obligatoires:</p>
                      <p className="font-medium">{totalRequiredItemsPrice.toFixed(2)}€</p>
                    </div>
                  </div>
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
          onClick={() => router.push(`/orgs/${orgSlug}/meal-deals`)}
        >
          Annuler
        </Button>
        <LoadingButton
          type="submit"
          loading={mutation.isPending}
          disabled={mutation.isPending || !isFormValid || !hasRequiredItems}
        >
          {mealDeal ? "Mettre à jour" : "Créer la formule"}
        </LoadingButton>
      </div>
    </Form>
  );
} 