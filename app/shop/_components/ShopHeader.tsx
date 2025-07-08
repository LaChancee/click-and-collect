"use client";

import Image from "next/image";
import { MapPin, Clock, Phone } from "lucide-react";
import { AdminAccessButton } from "./AdminAccessButton";

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
  return (
    <div className="relative">
      {/* Image de fond de la boulangerie */}
      <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
        {bakery.logo ? (
          <Image
            src={bakery.logo}
            alt={bakery.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          // Image par défaut d'une boulangerie (couleur bordeaux comme sur la photo)
          <div className="w-full h-full bg-gradient-to-r from-red-800 via-red-700 to-red-600" />
        )}

        {/* Overlay léger pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Nom de la boulangerie en overlay - style "LES DELICES D'ERWANN" */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg transform -rotate-1 border-2 border-orange-300">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide text-center">
              {bakery.name}
            </h1>
          </div>
        </div>

        {/* Bouton d'administration en haut à droite - Desktop only */}
        <div className="absolute top-4 right-4 hidden lg:block">
          <AdminAccessButton bakery={bakery} />
        </div>
      </div>

      {/* Informations pratiques en bas */}
      {(bakery.address || bakery.openingHours || bakery.phone) && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              {bakery.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{bakery.address}</span>
                </div>
              )}

              {bakery.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{bakery.openingHours}</span>
                </div>
              )}

              {bakery.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{bakery.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 