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
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryArticles = articlesByCategory[category.id];

        if (!categoryArticles || categoryArticles.length === 0) {
          return null;
        }

        return (
          <div key={category.id} id={`category-${category.slug}`}>
            {/* Category Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {category.name}
              </h2>
              <div className="w-12 h-1 bg-black rounded-full"></div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryArticles.map((article) => {
                const quantity = getItemQuantity(article.id);
                const price = parseFloat(article.price);

                return (
                  <div
                    key={article.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Article Image */}
                    <div className="aspect-[4/3] relative bg-gray-100">
                      {article.imageUrl || article.image ? (
                        <Image
                          src={article.imageUrl || article.image || ''}
                          alt={article.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🥖
                        </div>
                      )}

                      {!article.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Indisponible</Badge>
                        </div>
                      )}
                    </div>

                    {/* Article Info */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {article.name}
                        </h3>
                        {article.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {price.toFixed(2)}€
                        </span>

                        {article.isAvailable ? (
                          <div className="flex items-center gap-2">
                            {quantity === 0 ? (
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(article)}
                                className="bg-black hover:bg-gray-800 text-white"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateQuantity(article.id, -1)}
                                  className="h-8 w-8 p-0 rounded-full"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-medium text-sm min-w-[20px] text-center">
                                  {quantity}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(article.id, 1)}
                                  className="h-8 w-8 p-0 rounded-full bg-black hover:bg-gray-800"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary">Épuisé</Badge>
                        )}
                      </div>

                      {/* Stock info */}
                      {article.stockCount != null && article.stockCount <= 5 && article.stockCount > 0 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Plus que {article.stockCount} restant{article.stockCount > 1 ? 's' : ''}
                          </Badge>
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
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun article disponible
          </h3>
          <p className="text-gray-600">
            Cette boulangerie n'a pas encore ajouté d'articles à son catalogue.
          </p>
        </div>
      )}
    </div>
  );
} 