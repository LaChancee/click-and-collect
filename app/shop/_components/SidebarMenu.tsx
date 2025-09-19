"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserAuthButtonWrapper } from "./UserAuthButtonWrapper";

interface Category {
  id: string;
  name: string;
  slug: string;
  position: number;
  isActive: boolean;
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

interface SidebarMenuProps {
  categories: Category[];
  bakery: Bakery;
}


export function SidebarMenu({ categories, bakery }: SidebarMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fonction pour faire défiler vers une catégorie
  const scrollToCategory = (categorySlug: string) => {
    setSelectedCategory(categorySlug);

    if (categorySlug === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(`category-${categorySlug}`);
      if (element) {
        const headerHeight = 200; // Hauteur approximative du header
        const elementPosition = element.offsetTop - headerHeight;
        window.scrollTo({ top: elementPosition, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="hidden lg:block w-80 flex-shrink-0">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Bouton utilisateur */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <UserAuthButtonWrapper bakery={bakery} />
        </div>

        {/* Informations de la boulangerie */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-lg mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3">
            {bakery.name}
          </h1>

          <p className="text-sm text-gray-600 mb-3">
            Click & collect : récupérez votre commande sur place.
          </p>

          {bakery.address && (
            <p className="text-sm text-gray-600 mb-4">
              {bakery.address}
            </p>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Horaires des commandes click & collect :
            </h3>
            <p className="text-sm text-gray-600">
              {bakery.openingHours || "12h - 14h"}
            </p>
          </div>
        </div>

        {/* Menu des catégories */}
        <div className="bg-white rounded-lg p-4">
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.slug)}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200",
                  "hover:bg-gray-50 focus:outline-none border-l-4",
                  selectedCategory === category.slug
                    ? "bg-gray-50 text-gray-900 border-gray-900"
                    : "text-gray-700 hover:text-gray-900 border-transparent hover:border-gray-300"
                )}
              >
                {category.name.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
} 