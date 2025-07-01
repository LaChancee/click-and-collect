"use client";

import React, { useState } from "react";
import { X, Plus, Minus, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { useCart } from "../../../src/stores/cart-context";
import { MealDealStepModal } from "./MealDealStepModal";

interface Allergen {
  id: string;
  name: string;
  description?: string | null;
}

interface ProductAllergen {
  allergenId: string;
  allergen: Allergen;
}

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
  mealDeal: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: string;
    image?: string | null;
    imageUrl?: string | null;
    isActive: boolean;
  };
}

interface Article {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  image?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  isAvailable: boolean;
  stockCount?: number | null;
  position: number;
  categoryId: string;
  allergens?: ProductAllergen[];
  mealDealItems?: MealDealItem[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Bakery {
  id: string;
  name: string;
  slug: string;
}

interface ProductDetailModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  bakery: Bakery;
  availableMealDeals?: any[];
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  articles?: Array<any>;
}

export function ProductDetailModal({ article, isOpen, onClose, bakery, availableMealDeals = [], categories = [], articles = [] }: ProductDetailModalProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isMealDealModalOpen, setIsMealDealModalOpen] = useState(false);

  // Reset quantity when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  if (!article) return null;

  const currentCartQuantity = getItemQuantity(article.id);
  const price = parseFloat(article.price);

  const handleAddToCart = () => {
    if (!bakery?.id || !bakery?.name || !bakery?.slug) {
      console.error("Bakery data is missing");
      return;
    }

    if (currentCartQuantity > 0) {
      updateQuantity(article.id, currentCartQuantity + quantity);
    } else {
      addItem({
        id: article.id,
        name: article.name,
        price,
        imageUrl: article.imageUrl || article.image,
        bakeryId: bakery.id,
        bakeryName: bakery.name,
        bakerySlug: bakery.slug,
      });

      if (quantity > 1) {
        updateQuantity(article.id, quantity);
      }
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
        <div className="relative">
          {/* Header Image */}
          <div className="relative h-48 sm:h-60 w-full">
            {article.imageUrl || article.image ? (
              <Image
                src={article.imageUrl || article.image || ''}
                alt={article.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-6xl sm:text-8xl">
                🍞
              </div>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 p-0"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Stock badge */}
            {!article.isAvailable && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                <Badge variant="destructive" className="text-xs">Épuisé</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Accessible title for screen readers */}
            <DialogTitle className="sr-only">
              Détails du produit {article.name}
            </DialogTitle>

            {/* Title and Description */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{article.name}</h2>

              {article.description && (
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {article.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Prêt dans 15-30 min</span>
              </div>
            </div>

            {/* Price */}
            <div className="py-3 sm:py-4 border-y border-gray-100">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {price.toFixed(2)}€
              </span>
            </div>

            {/* Meal Deals / Formules */}
            {availableMealDeals.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">✨</span>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">Formules disponibles</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Économisez avec nos formules complètes</p>

                <Button
                  onClick={() => setIsMealDealModalOpen(true)}
                  variant="outline"
                  className="w-full border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 font-medium text-sm sm:text-base py-3 sm:py-4 active:scale-[0.98] transition-transform"
                >
                  <span className="text-base sm:text-lg mr-2">✨</span>
                  Voir les {availableMealDeals.length} formule{availableMealDeals.length > 1 ? 's' : ''} disponible{availableMealDeals.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}

            {/* Allergens */}
            {article.allergens && article.allergens.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">Allergènes</h3>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                  <div className="space-y-2">
                    {article.allergens.map((allergenRelation) => (
                      <div key={allergenRelation.allergenId} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-sm sm:text-base text-orange-800">
                            {allergenRelation.allergen.name}
                          </span>
                          {allergenRelation.allergen.description && (
                            <p className="text-xs sm:text-sm text-orange-700 mt-1">
                              {allergenRelation.allergen.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity selector and Add to cart */}
            {article.isAvailable && (
              <div className="space-y-4 sticky bottom-0 bg-white border-t pt-4 -mx-4 sm:-mx-6 px-4 sm:px-6 mt-6 sm:mt-8 sm:border-t-0 sm:pt-0 sm:bg-transparent sm:static">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base text-gray-900">Quantité</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 rounded-full p-0 active:scale-95"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold text-base sm:text-lg min-w-[32px] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 rounded-full p-0 active:scale-95"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold bg-black hover:bg-gray-800 active:scale-[0.98] transition-transform"
                >
                  {currentCartQuantity > 0 ? (
                    `Modifier (${(price * quantity).toFixed(2)}€)`
                  ) : (
                    `Ajouter au panier • ${(price * quantity).toFixed(2)}€`
                  )}
                </Button>
              </div>
            )}

            {/* Not available message */}
            {!article.isAvailable && (
              <div className="text-center py-4 sm:py-6">
                <p className="text-sm sm:text-base text-gray-500">Ce produit n'est plus disponible</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Meal Deal Step Modal */}
      <MealDealStepModal
        availableMealDeals={availableMealDeals}
        isOpen={isMealDealModalOpen}
        onClose={() => setIsMealDealModalOpen(false)}
        bakery={bakery}
        categories={categories}
        articles={articles}
      />
    </Dialog>
  );
} 