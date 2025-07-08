"use client";

import Link from "next/link";
import { ArticleGrid } from "./ArticleGrid";
import { CartSidebar } from "./CartSidebar";
import { CategoryTabs } from "./CategoryTabs";
import { SidebarMenu } from "./SidebarMenu";
import { ShopHeader } from "./ShopHeader";
import { AdminAccessButton } from "./AdminAccessButton";

interface Category {
  id: string;
  name: string;
  slug: string;
  position: number;
  isActive: boolean;
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

interface ShopClientProps {
  bakery: Bakery;
  categories: Category[];
  articles: Article[];
  mealDeals?: any[];
}

export function ShopClient({ bakery, categories, articles, mealDeals = [] }: ShopClientProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié avec juste l'image */}
      <ShopHeader bakery={bakery} />

      {/* Bouton d'authentification flottant - Mobile only */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <AdminAccessButton bakery={bakery} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar Menu - Desktop only */}
          <SidebarMenu categories={categories} bakery={bakery} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Category Tabs - Mobile only */}
            <div className="lg:hidden">
              <CategoryTabs categories={categories} hasMealDeals={mealDeals.length > 0} />
            </div>

            {/* Articles Grid */}
            <ArticleGrid
              articles={articles}
              categories={categories}
              bakery={bakery}
              mealDeals={mealDeals}
            />
          </div>

          {/* Cart sidebar - Desktop only */}
          <CartSidebar />
        </div>
      </div>

      {/* Mobile spacing for floating cart button */}
      <div className="h-20 lg:hidden" />
    </div>
  );
} 