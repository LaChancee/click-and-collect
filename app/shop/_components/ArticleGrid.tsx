"use client";

import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useCart } from "../../../src/stores/cart-context";
import { useEffect, useCallback, useState } from "react";
import { ProductDetailModal } from "./ProductDetailModal";

interface Category {
  id: string;
  name: string;
  slug: string;
}

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
  price: string; // Prisma Decimal serialized as string
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
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Définir la boulangerie actuelle au chargement
  useEffect(() => {
    if (bakery?.id && bakery?.name && bakery?.slug) {
      setBakery(bakery.id, bakery.name, bakery.slug);
    }
  }, [bakery?.id, bakery?.name, bakery?.slug, setBakery]);

  const openProductModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleAddToCart = useCallback((article: Article) => {
    if (!bakery?.id || !bakery?.name || !bakery?.slug) {
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
      bakerySlug: bakery.slug,
    });
  }, [addItem, bakery?.id, bakery?.name, bakery?.slug]);

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
        const categoryArticles = articlesByCategory[category.id] || [];

        if (categoryArticles.length === 0) {
          return null;
        }

        return (
          <div key={category.id} id={category.slug} className="scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categoryArticles.map((article) => {
                const quantity = getItemQuantity(article.id);

                return (
                  <div
                    key={article.id}
                    className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                    onClick={() => openProductModal(article)}
                  >
                    <div className="relative">
                      {/* Image */}
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                        {article.imageUrl || article.image ? (
                          <Image
                            src={article.imageUrl || article.image || ''}
                            alt={article.name}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            🍞
                          </div>
                        )}
                      </div>

                      {/* Stock badge */}
                      {!article.isAvailable && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="destructive">Épuisé</Badge>
                        </div>
                      )}

                      {/* Add to cart button */}
                      {article.isAvailable && (
                        <div className="absolute bottom-2 right-2">
                          {quantity === 0 ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProductModal(article);
                              }}
                              className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-full h-8 w-8 p-0 shadow-lg"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-lg border border-gray-200">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProductModal(article);
                                }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProductModal(article);
                                }}
                                className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                              >
                                <Plus className="h-2 w-2" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {article.name}
                      </h3>

                      {article.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {article.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {parseFloat(article.price).toFixed(2)}€
                        </span>

                        <div className="flex items-center gap-2">
                          {article.allergens && article.allergens.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              🚨 Allergènes
                            </Badge>
                          )}
                          {article.stockCount && article.stockCount <= 5 && (
                            <Badge variant="outline" className="text-xs">
                              Plus que {article.stockCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Product Detail Modal */}
      <ProductDetailModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        bakery={bakery}
      />
    </div>
  );
} 