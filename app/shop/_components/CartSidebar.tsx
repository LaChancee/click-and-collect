"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// Mock data - à connecter avec le state global du panier
const mockCartItems: CartItem[] = [
  {
    id: "1",
    name: "Croissant au beurre",
    price: 1.20,
    quantity: 2,
    imageUrl: "https://images.unsplash.com/photo-1549312195-99d891b2ecbb?w=100",
  },
  {
    id: "3",
    name: "Éclair au chocolat",
    price: 2.80,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100",
  },
];

const deliveryFee: number = 0; // Gratuit pour le click & collect
const minimumOrder = 10;

export function CartSidebar() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [isOpen, setIsOpen] = useState(false);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal + deliveryFee;
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const canCheckout = total >= minimumOrder;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(items => items.filter(item => item.id !== id));
    } else {
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const CartContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Mon panier</h3>
          <Badge variant="secondary">{itemCount} article{itemCount > 1 ? 's' : ''}</Badge>
        </div>

        {/* Delivery Info */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Retrait en magasin</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Prêt dans 15-30 min</span>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Votre panier est vide</p>
            <p className="text-sm text-gray-400">Ajoutez des articles pour commencer</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {/* Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">
                    🍞
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.price.toFixed(2)}€
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-medium text-sm min-w-[20px] text-center">
                  {item.quantity}
                </span>
                <Button
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-8 w-8 p-0 rounded-full bg-black hover:bg-gray-800"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="border-t p-4 space-y-4">
          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frais de service</span>
              <span>{deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(2)}€`}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>

          {/* Minimum Order Warning */}
          {!canCheckout && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                Commande minimum de {minimumOrder}€
              </p>
              <p className="text-xs text-amber-600">
                Il vous manque {(minimumOrder - total).toFixed(2)}€
              </p>
            </div>
          )}

          {/* Checkout Button */}
          <Button
            className="w-full bg-black hover:bg-gray-800 text-white"
            disabled={!canCheckout}
          >
            {canCheckout ? (
              `Commander • ${total.toFixed(2)}€`
            ) : (
              `Minimum ${minimumOrder}€`
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 ml-8">
        <div className="sticky top-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-h-[calc(100vh-2rem)] overflow-hidden">
            <CartContent />
          </div>
        </div>
      </div>

      {/* Mobile Cart Button & Sheet */}
      <div className="lg:hidden">
        {cartItems.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-medium shadow-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Voir le panier • {total.toFixed(2)}€
                  <Badge className="ml-2 bg-white text-black">
                    {itemCount}
                  </Badge>
                </Button>
              </SheetTrigger>

              <SheetContent side="bottom" className="h-[80vh] p-0">
                <div className="h-full">
                  <CartContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </>
  );
} 