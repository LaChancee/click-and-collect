"use client";

import { Star, Users, Clock } from "lucide-react";
import { Badge } from "../../../src/components/ui/badge";
import { Button } from "../../../src/components/ui/button";
import Image from "next/image";

interface MealDealItem {
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

interface MealDealCardProps {
  mealDeal: MealDeal;
  onSelect: (mealDeal: MealDeal) => void;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  articles?: Array<any>;
}

export function MealDealCard({ mealDeal, onSelect, categories = [], articles = [] }: MealDealCardProps) {
  const price = parseFloat(mealDeal.price);

  // Fonction pour obtenir les articles d'une catégorie par nom
  const getArticlesByCategory = (categoryName: string) => {
    const category = categories.find(cat =>
      cat.name.toLowerCase() === categoryName.toLowerCase() ||
      cat.slug.toLowerCase() === categoryName.toLowerCase()
    );
    if (category) {
      return articles.filter(article => article.categoryId === category.id);
    }
    return [];
  };

  // Calculer le prix individuel estimé
  const estimatedIndividualPrice = mealDeal.items.reduce((total, item) => {
    // Si c'est un article spécifique
    if (item.article) {
      return total + parseFloat(item.article.price);
    }

    // Si c'est une catégorie, prendre le prix moyen
    const categoryArticles = getArticlesByCategory(item.groupName || "");
    if (categoryArticles.length > 0) {
      const avgPrice = categoryArticles.reduce((sum, art) => sum + parseFloat(art.price), 0) / categoryArticles.length;
      return total + avgPrice;
    }

    return total;
  }, 0);

  const savings = estimatedIndividualPrice - price;
  const savingsPercentage = estimatedIndividualPrice > 0 ? Math.round((savings / estimatedIndividualPrice) * 100) : 0;

  // Grouper les éléments en analysant si c'est une catégorie ou un article
  const groupedItems = mealDeal.items.reduce((acc, item) => {
    const group = item.groupName || "Principal";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, MealDealItem[]>);

  // Fonction pour obtenir le nombre de choix dans un groupe
  const getChoicesCount = (groupName: string, items: MealDealItem[]) => {
    // Vérifier si c'est une catégorie
    const categoryArticles = getArticlesByCategory(groupName);
    if (categoryArticles.length > 0) {
      return categoryArticles.length;
    }
    // Sinon, c'est le nombre d'articles spécifiques
    return items.length;
  };

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(mealDeal)}
    >
      <div className="relative">
        {/* Header avec badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 text-xs font-medium">
              Formule
            </Badge>
          </div>

          {savings > 0 && (
            <Badge className="bg-green-50 text-green-700 border-green-200 text-xs font-medium">
              -{savingsPercentage}%
            </Badge>
          )}
        </div>

        {/* Titre et description */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{mealDeal.name}</h3>
          {mealDeal.description && (
            <p className="text-sm text-gray-600 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as any
            }}>
              {mealDeal.description}
            </p>
          )}
        </div>

        {/* Contenu de la formule */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{mealDeal.items.length} produits</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>15-30 min</span>
            </div>
          </div>

          <div className="space-y-1">
            {Object.entries(groupedItems).slice(0, 2).map(([groupName, items]) => {
              const choicesCount = getChoicesCount(groupName, items);
              return (
                <div key={groupName} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{groupName}</span>
                  <span className="text-gray-400 text-xs">
                    {choicesCount} choix
                  </span>
                </div>
              );
            })}
            {Object.keys(groupedItems).length > 2 && (
              <div className="text-xs text-gray-400">
                +{Object.keys(groupedItems).length - 2} autres catégories
              </div>
            )}
          </div>
        </div>

        {/* Prix et économies */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-gray-900">
                {price.toFixed(2)}€
              </span>
              {savings > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {estimatedIndividualPrice.toFixed(2)}€
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-xs text-green-600">
                Économie de {savings.toFixed(2)}€
              </span>
            )}
          </div>

          <Button
            size="sm"
            className="bg-black hover:bg-gray-800 text-white text-xs px-3 py-1.5 ml-4 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(mealDeal);
            }}
          >
            Personnaliser
          </Button>
        </div>
      </div>
    </div>
  );
} 