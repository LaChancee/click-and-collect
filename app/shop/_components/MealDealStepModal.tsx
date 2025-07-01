"use client";

import React, { useState } from "react";
import { X, ArrowLeft, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Button } from "../../../src/components/ui/button";
import { Badge } from "../../../src/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "../../../src/components/ui/dialog";
import { Progress } from "../../../src/components/ui/progress";
import Image from "next/image";
import { useCart } from "../../../src/stores/cart-context";

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

interface MealDealItemFull {
  id: string;
  quantity: number;
  required: boolean;
  groupName?: string | null;
  article: MealDealArticle;
}

interface MealDealFull {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  image?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  items: MealDealItemFull[];
}

interface MealDealStepModalProps {
  availableMealDeals: MealDealFull[];
  isOpen: boolean;
  onClose: () => void;
  bakery: {
    id: string;
    name: string;
    slug: string;
  };
  selectedMealDeal?: MealDealFull | null;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  articles?: Array<any>;
}

type Step = 'selection' | 'customization' | 'confirmation';

export function MealDealStepModal({ availableMealDeals, isOpen, onClose, bakery, selectedMealDeal: propSelectedMealDeal, categories = [], articles = [] }: MealDealStepModalProps) {
  const { addItem } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [selectedMealDeal, setSelectedMealDeal] = useState<MealDealFull | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});

  // Fonction pour obtenir les articles d'une catégorie par nom
  const getArticlesByCategory = (categoryName: string) => {
    const category = categories.find(cat =>
      cat.name.toLowerCase() === categoryName.toLowerCase() ||
      cat.slug.toLowerCase() === categoryName.toLowerCase()
    );
    if (category) {
      return articles.filter(article => article.categoryId === category.id && article.isAvailable);
    }
    return [];
  };

  // Fonction pour créer des items virtuels à partir d'une catégorie
  const createVirtualItemsFromCategory = (groupName: string, originalItem: MealDealItemFull) => {
    const categoryArticles = getArticlesByCategory(groupName);
    return categoryArticles.map(article => ({
      ...originalItem,
      id: `virtual-${originalItem.id}-${article.id}`,
      article: {
        id: article.id,
        name: article.name,
        slug: article.slug,
        price: article.price,
        image: article.image,
        imageUrl: article.imageUrl,
        isActive: article.isActive,
        isAvailable: article.isAvailable,
      }
    }));
  };

  // Reset state when modal closes or when a specific meal deal is provided
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep('selection');
      setSelectedMealDeal(null);
      setSelectedItems({});
    } else if (propSelectedMealDeal) {
      // Si un meal deal spécifique est fourni, l'utiliser et aller directement à la personnalisation
      setSelectedMealDeal(propSelectedMealDeal);

      // Group items for this meal deal
      const grouped = propSelectedMealDeal.items.reduce((acc, item) => {
        const group = item.groupName || "Principal";
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(item);
        return acc;
      }, {} as Record<string, MealDealItemFull[]>);

      // Pre-select required items
      const preSelected: Record<string, string[]> = {};
      Object.entries(grouped).forEach(([groupName, items]) => {
        const requiredItems = items.filter(item => item.required);
        if (requiredItems.length > 0) {
          preSelected[groupName] = requiredItems.map(item => item.article.id);
        }
      });
      setSelectedItems(preSelected);

      setCurrentStep('customization');
    }
  }, [isOpen, propSelectedMealDeal]);

  const groupedItems = selectedMealDeal ? selectedMealDeal.items.reduce((acc, item) => {
    const group = item.groupName || "Principal";
    if (!acc[group]) {
      acc[group] = [];
    }

    // Vérifier si c'est une catégorie (pas d'article spécifique associé ou si le groupName correspond à une catégorie)
    const categoryArticles = getArticlesByCategory(group);
    if (categoryArticles.length > 0 && (!item.article || categoryArticles.some(cat => cat.id === item.article?.id))) {
      // C'est une catégorie, créer des items virtuels pour tous les articles de cette catégorie
      const virtualItems = createVirtualItemsFromCategory(group, item);
      acc[group].push(...virtualItems);
    } else if (item.article) {
      // C'est un article spécifique
      acc[group].push(item);
    }

    return acc;
  }, {} as Record<string, MealDealItemFull[]>) : {};

  const handleMealDealSelect = (mealDeal: MealDealFull) => {
    setSelectedMealDeal(mealDeal);

    // Group items for this meal deal
    const grouped = mealDeal.items.reduce((acc, item) => {
      const group = item.groupName || "Principal";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item);
      return acc;
    }, {} as Record<string, MealDealItemFull[]>);

    // Pre-select required items
    const preSelected: Record<string, string[]> = {};
    Object.entries(grouped).forEach(([groupName, items]) => {
      const requiredItems = items.filter(item => item.required);
      if (requiredItems.length > 0) {
        preSelected[groupName] = requiredItems.map(item => item.article.id);
      }
    });
    setSelectedItems(preSelected);

    setCurrentStep('customization');
  };

  const handleItemToggle = (groupName: string, articleId: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (!newItems[groupName]) {
        newItems[groupName] = [];
      }

      const currentSelections = newItems[groupName];
      if (currentSelections.includes(articleId)) {
        newItems[groupName] = currentSelections.filter(id => id !== articleId);
      } else {
        newItems[groupName] = [...currentSelections, articleId];
      }

      return newItems;
    });
  };

  const calculateTotalPrice = () => {
    if (!selectedMealDeal) return 0;

    let total = parseFloat(selectedMealDeal.price);

    Object.entries(selectedItems).forEach(([groupName, articleIds]) => {
      articleIds.forEach(articleId => {
        const item = selectedMealDeal.items.find(item => item.article.id === articleId);
        if (item && !item.required) {
          // Only add extra cost for non-required items
          total += parseFloat(item.article.price) * 0.5; // 50% supplement
        }
      });
    });

    return total;
  };

  const canProceed = () => {
    if (!selectedMealDeal) return false;

    // Check if all required groups have selections
    return Object.entries(groupedItems).every(([groupName, items]) => {
      const hasRequired = items.some(item => item.required);
      if (hasRequired) {
        return selectedItems[groupName] && selectedItems[groupName].length > 0;
      }
      return true;
    });
  };

  const handleAddToCart = () => {
    if (!selectedMealDeal || !bakery) return;

    // Add the meal deal as a single item
    addItem({
      id: `meal-${selectedMealDeal.id}-${Date.now()}`,
      name: selectedMealDeal.name,
      price: calculateTotalPrice(),
      imageUrl: selectedMealDeal.imageUrl || selectedMealDeal.image,
      bakeryId: bakery.id,
      bakeryName: bakery.name,
      bakerySlug: bakery.slug,
    });

    onClose();
  };

  const getStepProgress = () => {
    if (propSelectedMealDeal) {
      // Si un meal deal spécifique est sélectionné, on commence directement à la personnalisation
      switch (currentStep) {
        case 'customization': return 50;
        case 'confirmation': return 100;
        default: return 50;
      }
    } else {
      switch (currentStep) {
        case 'selection': return 33;
        case 'customization': return 66;
        case 'confirmation': return 100;
      }
    }
  };

  const renderSelectionStep = () => (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-center space-y-2 flex-shrink-0">
        <h2 className="text-lg sm:text-xl font-bold">Choisissez votre formule</h2>
        <p className="text-sm sm:text-base text-gray-600">Sélectionnez la formule qui vous convient</p>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {availableMealDeals.map((mealDeal) => (
          <div
            key={mealDeal.id}
            className="border rounded-lg p-3 sm:p-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all active:bg-gray-50"
            onClick={() => handleMealDealSelect(mealDeal)}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{mealDeal.name}</h3>
                {mealDeal.description && (
                  <p className="text-gray-600 text-xs sm:text-sm mt-1 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as any
                  }}>{mealDeal.description}</p>
                )}

                <div className="mt-2 space-y-1">
                  {Object.entries(mealDeal.items.reduce((acc, item) => {
                    const group = item.groupName || "Principal";
                    if (!acc[group]) {
                      acc[group] = [];
                    }
                    acc[group].push(item);
                    return acc;
                  }, {} as Record<string, MealDealItemFull[]>)).map(([groupName, items]) => (
                    <div key={groupName} className="text-xs text-gray-500">
                      • {groupName}: {items.length} choix
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0 flex flex-col items-end">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {parseFloat(mealDeal.price).toFixed(2)}€
                </span>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCustomizationStep = () => {
    if (!selectedMealDeal) return null;

    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => propSelectedMealDeal ? onClose() : setCurrentStep('selection')}
            className="p-1 sm:p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold truncate">Personnalisez votre formule</h2>
            <p className="text-sm sm:text-base text-gray-600 truncate">{selectedMealDeal.name}</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base">{groupName}</h3>
                {items.some(item => item.required) && (
                  <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {selectedItems[groupName]?.length || 0} sélectionné(s)
                </Badge>
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  const isSelected = selectedItems[groupName]?.includes(item.article.id) || false;
                  const isRequired = item.required;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors active:scale-[0.98] ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        } ${isRequired ? 'border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => !isRequired && handleItemToggle(groupName, item.article.id)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        {(item.article.imageUrl || item.article.image) ? (
                          <Image
                            src={item.article.imageUrl || item.article.image || ''}
                            alt={item.article.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                            🥖
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {item.article.name}
                            </p>
                            {isRequired && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">Inclus</Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {isRequired ? 'Inclus dans la formule' : `+${(parseFloat(item.article.price) * 0.5).toFixed(2)}€`}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {isSelected || isRequired ? (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 sm:pt-4 flex-shrink-0 bg-white">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <span className="font-semibold text-base sm:text-lg">Total</span>
            <span className="text-lg sm:text-xl font-bold">{calculateTotalPrice().toFixed(2)}€</span>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!canProceed()}
            className="w-full bg-black hover:bg-gray-800 text-sm sm:text-base py-3 sm:py-4"
          >
            Ajouter au panier • {calculateTotalPrice().toFixed(2)}€
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0 gap-0 [&>button]:hidden">
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b bg-white sticky top-0 z-10 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <DialogTitle className="text-base sm:text-lg font-semibold truncate pr-2">
                {propSelectedMealDeal ? propSelectedMealDeal.name : 'Formules disponibles'}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 flex-1 overflow-auto">
            {currentStep === 'selection' && renderSelectionStep()}
            {currentStep === 'customization' && renderCustomizationStep()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 