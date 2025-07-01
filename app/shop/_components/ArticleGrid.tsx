"use client";

import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useCart } from "../../../src/stores/cart-context";
import { useEffect, useCallback, useState } from "react";
import { ProductDetailModal } from "./ProductDetailModal";
import { MealDealStepModal } from "./MealDealStepModal";
import { MealDealCard } from "./MealDealCard";

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
  price: string; // Prisma Decimal serialized as string
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
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  email?: string | null;
  logo?: string | null;
}

interface MealDealItemFull {
  id: string;
  quantity: number;
  required: boolean;
  groupName?: string | null;
  article: {
    id: string;
    name: string;
    slug: string;
    price: string;
    image?: string | null;
    imageUrl?: string | null;
    isActive: boolean;
    isAvailable: boolean;
  };
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

interface ArticleGridProps {
  articles: Article[];
  categories: Category[];
  bakery: Bakery;
  mealDeals?: MealDealFull[];
}

export function ArticleGrid({ articles, categories, bakery, mealDeals = [] }: ArticleGridProps) {
  const { addItem, updateQuantity, getItemQuantity, setBakery } = useCart();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMealDealModalOpen, setIsMealDealModalOpen] = useState(false);
  const [selectedMealDeal, setSelectedMealDeal] = useState<MealDealFull | null>(null);

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

  const openMealDealModal = (mealDeal: MealDealFull) => {
    setSelectedMealDeal(mealDeal);
    setIsMealDealModalOpen(true);
  };

  const closeMealDealModal = () => {
    setIsMealDealModalOpen(false);
    setSelectedMealDeal(null);
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
      {/* Section Formules */}
      {mealDeals.length > 0 && (
        <div id="formules" className="space-y-6 scroll-mt-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nos Formules</h2>
            <p className="text-gray-600">Économisez avec nos offres combinées</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {mealDeals.map((mealDeal) => (
              <div className="sm:col-span-2" key={mealDeal.id}>
                <MealDealCard
                  mealDeal={mealDeal}
                  onSelect={openMealDealModal}
                  categories={categories}
                  articles={articles}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Articles par catégorie */}
      {categories.map((category) => {
        const categoryArticles = articlesByCategory[category.id] || [];

        if (categoryArticles.length === 0) {
          return null;
        }

        return (
          <div key={category.id} id={category.slug} className="scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {categoryArticles.map((article) => {
                const quantity = getItemQuantity(article.id);
                const isOutOfStock = !article.isAvailable || (article.stockCount !== undefined && article.stockCount !== null && article.stockCount <= 0);

                return (
                  <div
                    key={article.id}
                    className={`group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all cursor-pointer ${isOutOfStock ? 'opacity-75 grayscale' : ''
                      }`}
                    onClick={() => !isOutOfStock && openProductModal(article)}
                  >
                    <div className="relative">
                      {/* Image */}
                      <div className="aspect-[3/2] bg-gray-100 overflow-hidden">
                        {article.imageUrl || article.image ? (
                          <Image
                            src={article.imageUrl || article.image || ''}
                            alt={article.name}
                            width={400}
                            height={300}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'filter grayscale' : ''
                              }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            🍞
                          </div>
                        )}
                      </div>

                      {/* Stock badge */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-center">
                            <div className="text-lg font-bold text-gray-900 mb-1">😔</div>
                            <div className="text-sm font-medium text-gray-900">Victime de son succès</div>
                            <div className="text-xs text-gray-600">Produit épuisé</div>
                          </div>
                        </div>
                      )}

                      {/* Low stock warning */}
                      {!isOutOfStock && article.stockCount && article.stockCount <= 3 && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                            Plus que {article.stockCount} !
                          </Badge>
                        </div>
                      )}

                      {/* Add to cart button */}
                      {!isOutOfStock && (
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
                    <div className="p-5 sm:p-6">
                      <h3 className={`font-semibold mb-2 line-clamp-2 text-base sm:text-lg ${isOutOfStock ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                        {article.name}
                      </h3>

                      {article.description && (
                        <p className={`text-sm mb-4 line-clamp-2 ${isOutOfStock ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {article.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${isOutOfStock ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                          {parseFloat(article.price).toFixed(2)}€
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          {article.mealDealItems && article.mealDealItems.length > 0 && !isOutOfStock && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              ✨ Formule dispo
                            </Badge>
                          )}
                          {article.allergens && article.allergens.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              🚨 Allergènes
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
        availableMealDeals={mealDeals}
        categories={categories}
        articles={articles}
      />

      {/* Meal Deal Step Modal */}
      <MealDealStepModal
        availableMealDeals={mealDeals}
        isOpen={isMealDealModalOpen}
        onClose={closeMealDealModal}
        bakery={bakery}
        selectedMealDeal={selectedMealDeal}
        categories={categories}
        articles={articles}
      />
    </div>
  );
} 