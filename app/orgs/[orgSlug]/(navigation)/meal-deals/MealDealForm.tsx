'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, Package } from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel, useZodForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/features/form/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Other components
import { ImageUploader } from "../articles/components/ImageUploader";

// Libraries and utilities
import { cn } from "@/lib/utils";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import {
  MealDealFormSchemaType,
  MealDealWithItemsSchema,
  defaultMealDealValues
} from "./meal-deal.schema";
import { createMealDealAction, updateMealDealAction } from "./meal-deal.action";

// Types
type Article = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
};

type Category = {
  id: string;
  name: string;
};

type MealDealItem = {
  id?: string;
  articleId?: string | null;
  categoryId?: string | null;
  article?: {
    name: string;
    price: number;
  };
  category?: {
    name: string;
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
  categories: Category[];
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

export default function MealDealForm({
  orgId,
  orgSlug,
  mealDeal,
  articles,
  categories
}: MealDealFormProps) {
  const router = useRouter();
  const articlesByCategory = groupArticlesByCategory(articles);

  // State for meal deal items
  const [mealDealItems, setMealDealItems] = useState<MealDealItem[]>(
    mealDeal?.items.map(item => ({
      ...item,
      groupName: undefined // Suppression des groupes pour simplifier
    })) || []
  );

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
          groupName: undefined // Suppression des groupes
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
  const handleAddItem = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    // Vérifier si l'article est déjà dans la formule
    if (mealDealItems.some(item => item.articleId === articleId)) {
      toast.error("Ce produit est déjà dans la formule");
      return;
    }

    const newItem: MealDealItem = {
      articleId,
      categoryId: null,
      article: {
        name: article.name,
        price: article.price,
      },
      category: undefined,
      quantity: 1,
      required: false,
      groupName: article.category.name,
    };

    setMealDealItems([...mealDealItems, newItem]);
    toast.success(`${article.name} ajouté à la formule`);
  };

  // Handle adding a category to the meal deal
  const handleAddCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    // Vérifier si la catégorie est déjà dans la formule
    if (mealDealItems.some(item => item.categoryId === categoryId)) {
      toast.error("Cette catégorie est déjà dans la formule");
      return;
    }

    const categoryArticles = articles.filter(a => a.categoryId === categoryId);
    const avgPrice = categoryArticles.length > 0
      ? categoryArticles.reduce((sum, art) => sum + art.price, 0) / categoryArticles.length
      : 0;

    const newItem: MealDealItem = {
      articleId: null,
      categoryId,
      article: undefined,
      category: {
        name: category.name,
      },
      quantity: 1,
      required: false,
      groupName: category.name,
    };

    setMealDealItems([...mealDealItems, newItem]);
    toast.success(`Catégorie "${category.name}" ajoutée à la formule`);
  };

  // Handle removing an item from the meal deal
  const handleRemoveItem = (index: number) => {
    const item = mealDealItems[index];
    const newItems = [...mealDealItems];
    newItems.splice(index, 1);
    setMealDealItems(newItems);

    if (item.articleId) {
      const article = articles.find(a => a.id === item.articleId);
      toast.success(`${article?.name || 'Produit'} retiré de la formule`);
    } else if (item.categoryId) {
      const category = categories.find(c => c.id === item.categoryId);
      toast.success(`Catégorie "${category?.name || 'Catégorie'}" retirée de la formule`);
    }
  };

  // Handle updating item quantity
  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
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

  // Helper function to get item price
  const getItemPrice = (item: MealDealItem): number => {
    if (item.articleId) {
      const article = articles.find(a => a.id === item.articleId);
      return article ? Number(article.price) : 0;
    } else if (item.categoryId) {
      const categoryArticles = articles.filter(a => a.categoryId === item.categoryId);
      if (categoryArticles.length === 0) return 0;
      return categoryArticles.reduce((sum, art) => sum + Number(art.price), 0) / categoryArticles.length;
    }
    return 0;
  };

  // Calculate total price of all required items
  const totalRequiredItemsPrice = mealDealItems
    .filter(item => item.required)
    .reduce((sum, item) => {
      return sum + (getItemPrice(item) * item.quantity);
    }, 0);

  // Calculate total items price
  const totalItemsPrice = mealDealItems.reduce((sum, item) => {
    return sum + (getItemPrice(item) * item.quantity);
  }, 0);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: MealDealFormSchemaType) => {
      // Add meal deal items to form data
      const formData = {
        ...values,
        items: mealDealItems.map(item => ({
          articleId: item.articleId || null,
          categoryId: item.categoryId || null,
          quantity: item.quantity,
          required: item.required,
          groupName: item.groupName || null,
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

  // ULTRA SIMPLIFIÉ - Validation basique
  const canSubmit =
    form.watch('name')?.trim() &&
    form.watch('price') &&
    mealDealItems.length > 0 &&
    mealDealItems.some(item => item.required);

  return (
    <div className="max-w-4xl mx-auto">
      <Form
        form={form}
        className="space-y-6"
        onSubmit={async (values) => {
          if (mealDealItems.length === 0) {
            toast.error("Vous devez ajouter au moins un produit à la formule");
            return;
          }

          if (!mealDealItems.some(item => item.required)) {
            toast.error("Vous devez marquer au moins un produit comme obligatoire");
            return;
          }

          await mutation.mutateAsync(values);
        }}
      >
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informations générales
            </CardTitle>
            <CardDescription>Détails essentiels de la formule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la formule *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Menu Déjeuner" {...field} />
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
                    <FormLabel>Prix de la formule (€) *</FormLabel>
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
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la formule..."
                      className="min-h-[80px] resize-y"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        Formule active
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

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
          </CardContent>
        </Card>

        {/* Composition de la formule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Catalogue de produits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Catalogue de produits
              </CardTitle>
              <CardDescription>
                Ajoutez des produits individuels ou des catégories complètes à votre formule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {Object.keys(articlesByCategory).length === 0 ? (
                    <div className="py-8 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucun produit disponible</p>
                    </div>
                  ) : (
                    Object.entries(articlesByCategory).map(([categoryName, categoryArticles]) => {
                      const category = categories.find(c => c.name === categoryName);
                      const isCategoryInMealDeal = category && mealDealItems.some(item => item.categoryId === category.id);

                      return (
                        <div key={categoryName} className="space-y-2">
                          <div className="flex items-center justify-between sticky top-0 bg-background py-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-medium">
                                {categoryName}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ({categoryArticles.length} produits)
                              </span>
                            </div>

                            {/* Bouton pour ajouter toute la catégorie */}
                            {category && (
                              <Button
                                type="button"
                                size="sm"
                                variant={isCategoryInMealDeal ? "secondary" : "outline"}
                                onClick={() => !isCategoryInMealDeal && handleAddCategory(category.id)}
                                disabled={isCategoryInMealDeal}
                                className="text-xs h-7"
                              >
                                {isCategoryInMealDeal ? (
                                  <>
                                    <Badge className="mr-1 h-3 w-3 p-0" />
                                    Catégorie ajoutée
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-1 h-3 w-3" />
                                    Ajouter toute la catégorie
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          <div className="space-y-1">
                            {categoryArticles.map((article) => {
                              const isInMealDeal = mealDealItems.some(item => item.articleId === article.id);
                              return (
                                <button
                                  key={article.id}
                                  type="button"
                                  onClick={() => handleAddItem(article.id)}
                                  disabled={isInMealDeal || isCategoryInMealDeal}
                                  className={cn(
                                    "w-full text-left p-3 border rounded-md transition-all",
                                    isInMealDeal || isCategoryInMealDeal
                                      ? "bg-muted border-muted-foreground/20 cursor-not-allowed opacity-50"
                                      : "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer"
                                  )}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium text-sm">{article.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {Number(article.price).toFixed(2)}€
                                      </p>
                                    </div>
                                    {isInMealDeal ? (
                                      <Badge variant="secondary" className="text-xs">
                                        Ajouté
                                      </Badge>
                                    ) : isCategoryInMealDeal ? (
                                      <Badge variant="outline" className="text-xs">
                                        Via catégorie
                                      </Badge>
                                    ) : (
                                      <Plus className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Produits de la formule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Composition ({mealDealItems.length})
                </span>
              </CardTitle>
              <CardDescription>
                Configurez les quantités et les produits obligatoires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {mealDealItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-md text-center p-4">
                    <Package className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-1">Aucun produit ajouté</p>
                    <p className="text-xs text-muted-foreground">
                      Sélectionnez des produits dans le catalogue
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mealDealItems.map((item, index) => {
                      const article = item.articleId ? articles.find(a => a.id === item.articleId) : null;
                      const category = item.categoryId ? categories.find(c => c.id === item.categoryId) : null;
                      const itemPrice = getItemPrice(item);
                      const itemTotal = itemPrice * item.quantity;

                      return (
                        <div
                          key={`${item.articleId || item.categoryId}-${index}`}
                          className="border rounded-md p-3 bg-card space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {article ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{article.name}</p>
                                    <Badge variant="outline" className="text-xs">Produit</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {Number(article.price).toFixed(2)}€ / unité
                                  </p>
                                </>
                              ) : category ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">Catégorie: {category.name}</p>
                                    <Badge variant="secondary" className="text-xs">Catégorie complète</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Prix moyen: {itemPrice.toFixed(2)}€ / unité
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Choix parmi {articles.filter(a => a.categoryId === category.id).length} produits
                                  </p>
                                </>
                              ) : (
                                <p className="font-medium text-sm text-destructive">Élément inconnu</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {itemTotal.toFixed(2)}€
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(index)}
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground">Quantité:</label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-16 h-7 text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`required-${index}`}
                                checked={item.required}
                                onCheckedChange={(checked) => handleUpdateRequired(index, !!checked)}
                              />
                              <label
                                htmlFor={`required-${index}`}
                                className="text-xs cursor-pointer"
                              >
                                Obligatoire
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {mealDealItems.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total des produits:</span>
                      <span className="font-medium">{totalItemsPrice.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Produits obligatoires:</span>
                      <span className="font-medium">{totalRequiredItemsPrice.toFixed(2)}€</span>
                    </div>
                    {form.watch('price') > 0 && (
                      <div className="flex justify-between text-xs">
                        <span>Prix de la formule:</span>
                        <span className="font-medium">{Number(form.watch('price')).toFixed(2)}€</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/orgs/${orgSlug}/meal-deals`)}
          >
            Annuler
          </Button>
          <div className="flex flex-col items-end gap-1">
            {(!canSubmit && mealDealItems.length > 0 && !mealDealItems.some(item => item.required)) && (
              <p className="text-xs text-red-500 font-medium">
                ⚠️ Cochez "Obligatoire" sur au moins un produit
              </p>
            )}
            {(!canSubmit && mealDealItems.length === 0) && (
              <p className="text-xs text-muted-foreground">
                Ajoutez au moins un produit à la formule
              </p>
            )}
            {(!canSubmit && !form.watch('name')?.trim()) && (
              <p className="text-xs text-red-500 font-medium">
                ⚠️ Le nom de la formule est requis
              </p>
            )}
            {(!canSubmit && !form.watch('price')) && (
              <p className="text-xs text-red-500 font-medium">
                ⚠️ Le prix doit être un nombre positif
              </p>
            )}
            <LoadingButton
              type="submit"
              disabled={mutation.isPending}
              className="min-w-32"
            >
              {mealDeal ? "Mettre à jour" : "Créer la formule"}
            </LoadingButton>
          </div>
        </div>
      </Form>
    </div>
  );
} 