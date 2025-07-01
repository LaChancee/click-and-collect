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
  hasMealDeals?: boolean;
}

export function CategoryTabs({ categories, hasMealDeals = false }: CategoryTabsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Créer la liste des catégories avec "Tous" en premier et "Formules" si disponible
  const allCategories = [
    { id: "all", name: "TOUS", slug: "all", position: -1, isActive: true },
    ...(hasMealDeals ? [{ id: "formules", name: "FORMULES", slug: "formules", position: -0.5, isActive: true }] : []),
    ...categories.map(cat => ({ ...cat, name: cat.name.toUpperCase() })),
  ];

  // Fonction pour faire défiler vers une catégorie
  const scrollToCategory = (categorySlug: string) => {
    setSelectedCategory(categorySlug);

    if (categorySlug === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Corriger l'ID pour qu'il corresponde à ce qui est utilisé dans ArticleGrid
      const element = document.getElementById(categorySlug);
      if (element) {
        const headerHeight = 180; // Hauteur du header sticky
        const elementPosition = element.offsetTop - headerHeight;
        window.scrollTo({ top: elementPosition, behavior: "smooth" });
      }
    }
  };

  // Détection automatique de la catégorie visible
  useEffect(() => {
    const handleScroll = () => {
      const sections = allCategories.map(cat => ({
        slug: cat.slug,
        element: document.getElementById(cat.slug)
      })).filter(item => item.element);

      let current = "all";
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 200) { // 200px de buffer
            current = section.slug;
          }
        }
      }
      setSelectedCategory(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allCategories]);

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 p-3 min-w-max px-4 sm:px-6 lg:px-8">
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