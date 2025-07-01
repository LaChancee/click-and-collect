"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useCart, type CartItem } from "../../../src/stores/cart-context";

const deliveryFee: number = 0; // Gratuit pour le click & collect

export function CartSidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const {
    state,
    updateQuantity,
    removeItem,
    getTotalItems,
    getTotalPrice
  } = useCart();

  const cartItems = state.items;
  const bakeryName = state.bakeryName;
  const bakerySlug = state.bakerySlug;
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryFee;
  const itemCount = getTotalItems();
  const canCheckout = cartItems.length > 0 && bakerySlug;

  const handleUpdateQuantity = useCallback((id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  }, [removeItem, updateQuantity]);

  const handleCheckout = useCallback(() => {
    if (canCheckout && bakerySlug) {
      // Fermer le modal mobile si ouvert
      setIsOpen(false);
      // Utiliser router.push au lieu de window.location.href
      router.push(`/shop/checkout?bakery=${bakerySlug}`);
    }
  }, [canCheckout, bakerySlug, router]);

  const CartContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-4 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Mon panier</h3>
          <Badge variant="secondary">{itemCount} article{itemCount > 1 ? 's' : ''}</Badge>
        </div>

        {/* Bakery Info */}
        {bakeryName && (
          <div className="mt-2 lg:mt-3 space-y-1.5 lg:space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>Retrait chez {bakeryName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Prêt dans 15-30 min</span>
            </div>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-6 lg:py-8">
            <ShoppingCart className="h-10 lg:h-12 w-10 lg:w-12 mx-auto text-gray-400 mb-3 lg:mb-4" />
            <p className="text-gray-500">Votre panier est vide</p>
            <p className="text-sm text-gray-400">Ajoutez des articles pour commencer</p>
          </div>
        ) : (
          cartItems.map((item: CartItem) => (
            <div key={item.id} className="flex items-center gap-3 p-2.5 lg:p-3 bg-gray-50 rounded-lg touch-manipulation">
              {/* Image */}
              <div className="w-11 lg:w-12 h-11 lg:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="h-7 w-7 lg:h-8 lg:w-8 p-0 rounded-full touch-manipulation mobile-tap active:scale-95"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-medium text-sm min-w-[20px] text-center">
                  {item.quantity}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="h-7 w-7 lg:h-8 lg:w-8 p-0 rounded-full bg-black hover:bg-gray-800 touch-manipulation mobile-tap active:scale-95"
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
        <div className="border-t p-3 lg:p-4 pb-6 lg:pb-4 space-y-3 lg:space-y-4 safe-area-inset">
          {/* Summary */}
          <div className="space-y-1.5 lg:space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frais de service</span>
              <span>{deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(2)}€`}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1.5 lg:pt-2">
              <span>Total</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="pb-4 my-4 lg:pb-0">
            <Button
              className="w-full bg-black hover:bg-gray-800 text-white h-11 lg:h-12 text-base font-medium touch-manipulation mobile-tap active:scale-[0.98]"
              disabled={!canCheckout}
              onClick={handleCheckout}
            >
              Commander • {total.toFixed(2)}€
            </Button>
          </div>
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
          <div className="fixed bottom-4 left-4 right-4 z-50 safe-area-inset">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  className="w-full bg-black hover:bg-gray-800 text-white h-14 text-base font-medium shadow-lg touch-manipulation mobile-tap active:scale-[0.98] rounded-xl"
                >
                  <ShoppingCart className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="flex-1 text-left">Voir le panier • {total.toFixed(2)}€</span>
                  <Badge className="ml-2 bg-white text-black min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs font-medium">
                    {itemCount}
                  </Badge>
                </Button>
              </SheetTrigger>

              <SheetContent side="bottom" className="h-[75vh] lg:h-[85vh] p-0 rounded-t-xl">
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