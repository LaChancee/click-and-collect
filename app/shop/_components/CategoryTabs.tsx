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
    { id: "all", name: "TOUS", slug: "all", position: -1, isActive: true },
    ...categories.map(cat => ({ ...cat, name: cat.name.toUpperCase() })),
  ];

  // Fonction pour faire défiler vers une catégorie
  const scrollToCategory = (categorySlug: string) => {
    setSelectedCategory(categorySlug);

    if (categorySlug === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(`category-${categorySlug}`);
      if (element) {
        const headerHeight = 250; // Hauteur approximative du nouveau header
        const elementPosition = element.offsetTop - headerHeight;
        window.scrollTo({ top: elementPosition, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 mb-4 -mx-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 p-3 min-w-max px-4">
          {allCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.slug)}
              className={cn(
                "flex-shrink-0 px-4 py-2 text-xs font-bold transition-all duration-200",
                "whitespace-nowrap border-b-2 border-transparent",
                "focus:outline-none",
                selectedCategory === category.slug
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
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