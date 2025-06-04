"use client";

import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useCart } from "../../../src/stores/cart-context";
import { useEffect, useCallback } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string; // Prisma Decimal serialized as string
  image?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  isAvailable: boolean;
  stockCount?: number | null;
  position: number;
  categoryId: string;
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
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  email?: string | null;
  logo?: string | null;
}

interface ArticleGridProps {
  articles: Article[];
  categories: Category[];
  bakery: Bakery;
}

export function ArticleGrid({ articles, categories, bakery }: ArticleGridProps) {
  const { addItem, updateQuantity, getItemQuantity, setBakery } = useCart();

  // Définir la boulangerie actuelle au chargement
  useEffect(() => {
    if (bakery?.id && bakery?.name) {
      setBakery(bakery.id, bakery.name);
    }
  }, [bakery?.id, bakery?.name, setBakery]);

  const handleAddToCart = useCallback((article: Article) => {
    if (!bakery?.id || !bakery?.name) {
      console.error("Bakery data is missing");
      return;
    }

    const price = parseFloat(article.price);

    addItem({
      id: article.id,
      name: article.name,
      price,
      imageUrl: article.imageUrl || article.image,
      bakeryId: bakery.id,
      bakeryName: bakery.name,
    });
  }, [addItem, bakery?.id, bakery?.name]);

  const handleUpdateQuantity = useCallback((articleId: string, change: number) => {
    const currentQuantity = getItemQuantity(articleId);
    const newQuantity = currentQuantity + change;

    if (newQuantity <= 0) {
      updateQuantity(articleId, 0);
    } else {
      updateQuantity(articleId, newQuantity);
    }
  }, [getItemQuantity, updateQuantity]);

  // Grouper les articles par catégorie
  const articlesByCategory = categories.reduce((acc, category) => {
    acc[category.id] = articles.filter(article => article.categoryId === category.id);
    return acc;
  }, {} as Record<string, Article[]>);

  return (
    <div className="space-y-6 sm:space-y-8">
      {categories.map((category) => {
        const categoryArticles = articlesByCategory[category.id];

        if (!categoryArticles || categoryArticles.length === 0) {
          return null;
        }

        return (
          <div key={category.id} id={`category-${category.slug}`}>
            {/* Category Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {category.name}
              </h2>
              <div className="w-8 sm:w-12 h-1 bg-black rounded-full"></div>
            </div>

            {/* Articles Grid - Responsive */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {categoryArticles.map((article) => {
                const quantity = getItemQuantity(article.id);
                const price = parseFloat(article.price);

                return (
                  <div
                    key={article.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex min-h-[100px] sm:min-h-[120px]"
                  >
                    {/* Article Info à gauche - Layout horizontal */}
                    <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center min-w-0">
                      <h3 className="font-normal text-black mb-1 text-lg sm:text-xl leading-tight">
                        {article.name}
                      </h3>
                      {article.description && (
                        <p className="text-gray-600 mb-2 text-sm leading-relaxed line-clamp-2">
                          {article.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl sm:text-2xl font-bold text-black">
                          {price.toFixed(2)}€
                        </span>
                      </div>
                    </div>

                    {/* Article Image à droite */}
                    <div className="w-32 sm:w-36 md:w-40 relative bg-gray-100 flex-shrink-0">
                      {article.imageUrl || article.image ? (
                        <Image
                          src={article.imageUrl || article.image || ''}
                          alt={article.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🥖
                        </div>
                      )}

                      {!article.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Indisponible</Badge>
                        </div>
                      )}

                      {/* Bouton en bas à droite de l'image */}
                      {article.isAvailable && (
                        <div className="absolute bottom-2 right-2">
                          {quantity === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(article)}
                              className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-full h-8 w-8 p-0 shadow-lg"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-lg border border-gray-200">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateQuantity(article.id, -1)}
                                className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                              >
                                <Minus className="h-2 w-2" />
                              </Button>
                              <span className="font-medium text-xs min-w-[16px] text-center px-1">
                                {quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateQuantity(article.id, 1)}
                                className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                              >
                                <Plus className="h-2 w-2" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Aucun article disponible
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Cette boulangerie n'a pas encore ajouté d'articles à son catalogue.
          </p>
        </div>
      )}
    </div>
  );
} 