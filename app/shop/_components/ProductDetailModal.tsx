"use client";

import React, { useState } from "react";
import { X, Plus, Minus, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { useCart } from "../../../src/stores/cart-context";

interface Allergen {
  id: string;
  name: string;
  description?: string | null;
}

interface ProductAllergen {
  allergenId: string;
  allergen: Allergen;
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
}

export function ProductDetailModal({ article, isOpen, onClose, bakery }: ProductDetailModalProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

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
      <DialogContent className="max-w-lg mx-auto max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
        <div className="relative">
          {/* Header Image */}
          <div className="relative h-60 w-full">
            {article.imageUrl || article.image ? (
              <Image
                src={article.imageUrl || article.image || ''}
                alt={article.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-8xl">
                🍞
              </div>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 p-0"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Stock badge */}
            {!article.isAvailable && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive">Épuisé</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Accessible title for screen readers */}
            <DialogTitle className="sr-only">
              Détails du produit {article.name}
            </DialogTitle>

            {/* Title and Description */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">{article.name}</h2>

              {article.description && (
                <p className="text-gray-600 leading-relaxed">
                  {article.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Prêt dans 15-30 min</span>
              </div>
            </div>

            {/* Price */}
            <div className="py-4 border-y border-gray-100">
              <span className="text-2xl font-bold text-gray-900">
                {price.toFixed(2)}€
              </span>
            </div>

            {/* Allergens */}
            {article.allergens && article.allergens.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">Allergènes</h3>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="space-y-2">
                    {article.allergens.map((allergenRelation) => (
                      <div key={allergenRelation.allergenId} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-orange-800">
                            {allergenRelation.allergen.name}
                          </span>
                          {allergenRelation.allergen.description && (
                            <p className="text-sm text-orange-700 mt-1">
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Quantité</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 rounded-full p-0"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold text-lg min-w-[32px] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 rounded-full p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 text-base font-semibold bg-black hover:bg-gray-800"
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
              <div className="text-center py-4">
                <p className="text-gray-500">Ce produit n'est plus disponible</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 