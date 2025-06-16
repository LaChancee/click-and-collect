'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package2, Coffee, Cake, Sandwich, Droplets } from "lucide-react";

const DEFAULT_CATEGORIES = [
  {
    name: "Pains",
    icon: Package2,
    description: "Pains traditionnels, de campagne, spéciaux"
  },
  {
    name: "Viennoiseries",
    icon: Coffee,
    description: "Croissants, pains au chocolat, brioches"
  },
  {
    name: "Pâtisseries",
    icon: Cake,
    description: "Éclairs, tartes, gâteaux, desserts"
  },
  {
    name: "Sandwichs",
    icon: Sandwich,
    description: "Sandwichs, paninis, salades"
  },
  {
    name: "Boissons",
    icon: Droplets,
    description: "Café, thé, jus de fruits, sodas"
  },
];

interface DefaultCategoriesInfoProps {
  className?: string;
}

export function DefaultCategoriesInfo({ className }: DefaultCategoriesInfoProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Catégories de base pour boulangerie
        </CardTitle>
        <CardDescription>
          Ces catégories sont spécialement conçues pour organiser les produits d'une boulangerie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {DEFAULT_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.name} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50/50">
                <IconComponent className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="outline" className="text-xs">Catégorie</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Astuce :</strong> Vous pourrez toujours ajouter, modifier ou supprimer ces catégories après leur création.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 