"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  position: number;
  isActive: boolean;
}

interface CategoryTabsProps {
  categories: Category[];
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Créer la liste des catégories avec "Tous" en premier
  const allCategories = [
    { id: "all", name: "Tous", slug: "all", position: -1, isActive: true },
    ...categories,
  ];

  return (
    <div className="sticky top-24 z-30 bg-gray-50 border-b border-gray-200 mb-8">
      <div className="overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max">
          {allCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border border-gray-300",
                selectedCategory === category.slug
                  ? "bg-black text-white border-black shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 