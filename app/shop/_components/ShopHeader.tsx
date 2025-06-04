"use client";

import { Clock, MapPin, Phone, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuthButtonClient } from "@/features/auth/auth-button-client";

interface BakeryInfo {
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

interface ShopHeaderProps {
  bakery: BakeryInfo;
}

export function ShopHeader({ bakery }: ShopHeaderProps) {
  // Calculer si la boulangerie est ouverte (logique simplifiée)
  const isOpen = true; // À améliorer avec la vraie logique des horaires
  const rating = 4.8; // Valeur par défaut, à connecter avec un système de notes
  const deliveryTime = "15-30 min"; // À connecter avec les créneaux

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Main bakery info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {bakery.name}
                </h1>
                {isOpen && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Ouvert
                  </Badge>
                )}
              </div>

              {bakery.description && (
                <p className="text-gray-600 mb-3">
                  {bakery.description}
                </p>
              )}

              {/* Info badges */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{deliveryTime}</span>
                </div>

                {bakery.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="max-w-xs truncate">{bakery.address}</span>
                  </div>
                )}

                {bakery.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{bakery.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-4">
              <AuthButtonClient />
              <Button variant="outline" size="sm">
                Infos
              </Button>
              <Button variant="outline" size="sm">
                Horaires
              </Button>
            </div>
          </div>

          {/* Opening hours if available */}
          {bakery.openingHours && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  Horaires : {bakery.openingHours}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 