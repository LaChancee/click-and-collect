"use client";

import Image from "next/image";
import { MapPin, Clock, Phone, Star } from "lucide-react";

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
      {/* Image de fond avec overlay */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {bakery.logo ? (
          <Image
            src={bakery.logo}
            alt={bakery.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100" />
        )}

        {/* Overlay dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Badge "Boulangerie artisanale" */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥖</span>
            <span className="text-sm font-medium text-gray-800">Boulangerie artisanale</span>
          </div>
        </div>

        {/* Badge de note (simulé) */}
        <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full px-3 py-2 shadow-lg">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">4.8</span>
          </div>
        </div>
      </div>

      {/* Informations de la boulangerie */}
      <div className="relative bg-white shadow-lg rounded-t-3xl -mt-8 mx-4 p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {bakery.name}
          </h1>
          {bakery.description && (
            <p className="text-lg text-gray-600 font-medium">
              {bakery.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">(127 avis)</span>
          </div>
        </div>

        {/* Informations pratiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          {bakery.address && (
            <div className="flex items-center justify-center sm:justify-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="bg-orange-100 p-2 rounded-full">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Adresse</div>
                <div className="text-sm text-gray-600">{bakery.address}</div>
              </div>
            </div>
          )}

          {bakery.openingHours && (
            <div className="flex items-center justify-center sm:justify-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Horaires</div>
                <div className="text-sm text-green-600 font-medium">Ouvert • {bakery.openingHours}</div>
              </div>
            </div>
          )}

          {bakery.phone && (
            <div className="flex items-center justify-center sm:justify-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Téléphone</div>
                <div className="text-sm text-blue-600">{bakery.phone}</div>
              </div>
            </div>
          )}
        </div>

        {/* Message d'accueil chaleureux */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👋</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Bienvenue chez {bakery.name} !</h3>
              <p className="text-sm text-gray-700">
                Découvrez nos produits frais, préparés chaque matin avec amour.
                Commandez en ligne et récupérez vos délices à l'heure qui vous convient.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 