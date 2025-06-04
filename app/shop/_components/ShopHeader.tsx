  "use client";

import Image from "next/image";

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
    <div className="bg-white p-4 sm:p-6 lg:p-8">
      {/* Hero Banner avec padding */}
      <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden rounded-2xl shadow-lg">
        {/* Background Image - Photo réaliste de boulangerie */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
            alt="Devanture de boulangerie"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Overlay subtil */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Logo Badge - Centré et stylisé */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl transform rotate-2 border-4 border-orange-400">
            <div className="text-center font-bold">
              {bakery.name.split(' ').map((word, index) => (
                <div key={index} className="text-base sm:text-lg lg:text-xl leading-tight">
                  {word.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 