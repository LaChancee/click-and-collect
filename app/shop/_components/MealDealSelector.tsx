"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle } from "lucide-react";
import Image from "next/image";

interface MealDealArticle {
  id: string;
  name: string;
  slug: string;
  price: string;
  image?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  isAvailable: boolean;
}

interface MealDealItem {
  id: string;
  quantity: number;
  required: boolean;
  groupName?: string | null;
  article: MealDealArticle;
}

interface MealDeal {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  image?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  items: MealDealItem[];
}

interface MealDealSelectorProps {
  availableMealDeals: MealDeal[];
  currentArticleId: string;
  onMealDealSelect: (mealDeal: MealDeal, selectedOptions: Record<string, string[]>) => void;
}

export function MealDealSelector({ availableMealDeals, currentArticleId, onMealDealSelect }: MealDealSelectorProps) {
  const [selectedMealDeal, setSelectedMealDeal] = useState<MealDeal | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  if (availableMealDeals.length === 0) {
    return null;
  }

  // Grouper les items par groupName
  const getGroupedItems = (mealDeal: MealDeal) => {
    const grouped = mealDeal.items.reduce((acc, item) => {
      const group = item.groupName || "Principal";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item);
      return acc;
    }, {} as Record<string, MealDealItem[]>);

    return grouped;
  };

  const handleOptionToggle = (groupName: string, articleId: string) => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev };
      if (!newOptions[groupName]) {
        newOptions[groupName] = [];
      }

      const currentSelections = newOptions[groupName];
      if (currentSelections.includes(articleId)) {
        newOptions[groupName] = currentSelections.filter(id => id !== articleId);
      } else {
        newOptions[groupName] = [...currentSelections, articleId];
      }

      return newOptions;
    });
  };

  const calculateTotalPrice = (mealDeal: MealDeal) => {
    let total = parseFloat(mealDeal.price);

    Object.entries(selectedOptions).forEach(([groupName, articleIds]) => {
      articleIds.forEach(articleId => {
        const item = mealDeal.items.find(item => item.article.id === articleId);
        if (item) {
          total += parseFloat(item.article.price) * item.quantity;
        }
      });
    });

    return total;
  };

  const handleAddMealDeal = () => {
    if (selectedMealDeal) {
      onMealDealSelect(selectedMealDeal, selectedOptions);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">✨ Formules disponibles</h3>
        <p className="text-sm text-gray-600">Économisez en choisissant une formule complète</p>
      </div>

      <div className="space-y-3">
        {availableMealDeals.map((mealDeal) => {
          const isSelected = selectedMealDeal?.id === mealDeal.id;
          const totalPrice = isSelected ? calculateTotalPrice(mealDeal) : parseFloat(mealDeal.price);

          return (
            <Card
              key={mealDeal.id}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-black' : 'hover:shadow-md'}`}
              onClick={() => {
                setSelectedMealDeal(isSelected ? null : mealDeal);
                setSelectedOptions({});
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{mealDeal.name}</CardTitle>
                    {mealDeal.description && (
                      <CardDescription className="mt-1">
                        {mealDeal.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-lg font-bold text-gray-900">
                      {totalPrice.toFixed(2)}€
                    </span>
                    <div className="mt-1">
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {isSelected && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />

                  {Object.entries(getGroupedItems(mealDeal)).map(([groupName, items]) => (
                    <div key={groupName} className="mb-4 last:mb-0">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {groupName}
                        {items.some(item => item.required) && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Obligatoire
                          </Badge>
                        )}
                      </h4>

                      <div className="space-y-2">
                        {items.map((item) => {
                          const isOptionSelected = selectedOptions[groupName]?.includes(item.article.id) || false;
                          const isCurrentArticle = item.article.id === currentArticleId;

                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isOptionSelected || isCurrentArticle
                                ? 'bg-gray-50 border-gray-300'
                                : 'hover:bg-gray-50'
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isCurrentArticle) {
                                  handleOptionToggle(groupName, item.article.id);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {(item.article.imageUrl || item.article.image) ? (
                                  <Image
                                    src={item.article.imageUrl || item.article.image || ''}
                                    alt={item.article.name}
                                    width={40}
                                    height={40}
                                    className="rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                                    🥖
                                  </div>
                                )}

                                <div>
                                  <p className="font-medium text-sm">
                                    {item.article.name}
                                    {isCurrentArticle && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        Sélectionné
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    +{parseFloat(item.article.price).toFixed(2)}€
                                  </p>
                                </div>
                              </div>

                              {isOptionSelected ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : isCurrentArticle ? (
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddMealDeal();
                    }}
                    className="w-full mt-4 bg-black hover:bg-gray-800"
                  >
                    Ajouter cette formule • {totalPrice.toFixed(2)}€
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
} 