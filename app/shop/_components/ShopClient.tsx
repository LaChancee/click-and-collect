"use client";

import { ArticleGrid } from "./ArticleGrid";
import { CartSidebar } from "./CartSidebar";
import { CategoryTabs } from "./CategoryTabs";
import { ShopHeader } from "./ShopHeader";

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
  price: string;
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

interface ShopClientProps {
  bakery: Bakery;
  categories: Category[];
  articles: Article[];
}

export function ShopClient({ bakery, categories, articles }: ShopClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader bakery={bakery} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <CategoryTabs categories={categories} />
            <ArticleGrid
              articles={articles}
              categories={categories}
              bakery={bakery}
            />
          </div>
          <CartSidebar />
        </div>
      </div>
    </div>
  );
} 