"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../../src/stores/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, CreditCard, Banknote, MapPin, ShoppingCart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { createOrderAction } from "../_actions/create-order.action";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  availableSpots: number;
}

interface CheckoutClientProps {
  bakerySlug: string;
  timeSlots: TimeSlot[];
}

export function CheckoutClient({ bakerySlug, timeSlots }: CheckoutClientProps) {
  const router = useRouter();
  const { state, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = state.items;
  const bakeryName = state.bakeryName;
  const subtotal = getTotalPrice();
  const total = subtotal;
  const itemCount = getTotalItems();

  // Rediriger si le panier est vide
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push(`/shop?bakery=${bakerySlug}`);
    }
  }, [cartItems.length, router, bakerySlug]);

  // Grouper les créneaux par date
  const timeSlotsByDate = timeSlots.reduce((acc, slot) => {
    const date = format(parseISO(slot.startTime), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const handleSubmit = async () => {
    if (!selectedTimeSlot || !paymentMethod || !customerInfo.name || !customerInfo.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        timeSlotId: selectedTimeSlot,
        paymentMethod: paymentMethod as "CARD_ONLINE" | "CARD_INSTORE" | "CASH_INSTORE",
        customerInfo,
        notes,
        items: cartItems.map(item => ({
          articleId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        totalAmount: total,
      };

      const result = await createOrderAction(orderData);

      if (result.success) {
        clearCart();
        toast.success("Commande créée avec succès !");

        if (paymentMethod === "CARD_ONLINE") {
          // Rediriger vers Stripe (à implémenter plus tard)
          toast.info("Redirection vers le paiement...");
          // router.push(`/checkout/payment?orderId=${result.orderId}`);
        } else {
          // Rediriger vers la page de confirmation
          router.push(`/shop/order-confirmation?orderNumber=${result.orderNumber}`);
        }
      } else {
        toast.error(result.error || "Erreur lors de la création de la commande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Le useEffect redirigera
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/shop?bakery=${bakerySlug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour au shop</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Finaliser ma commande</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4" />
                <span>Retrait chez {bakeryName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle>Vos informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sélection du créneau */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Choisir un créneau de retrait
                </CardTitle>
                {!selectedTimeSlot && (
                  <p className="text-sm text-gray-600">
                    Sélectionnez l'heure à laquelle vous souhaitez récupérer votre commande
                  </p>
                )}
                {selectedTimeSlot && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Créneau sélectionné</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <div className="space-y-6">
                    {Object.entries(timeSlotsByDate).map(([date, slots]) => (
                      <div key={date} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-px bg-gray-200 flex-1"></div>
                          <h3 className="font-semibold text-gray-900 px-3 py-1 bg-gray-50 rounded-full text-sm">
                            {format(parseISO(slots[0].startTime), "EEEE d MMMM", { locale: fr })}
                          </h3>
                          <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {slots.map((slot) => {
                            const isSelected = selectedTimeSlot === slot.id;
                            const isLowAvailability = slot.availableSpots <= 2;

                            return (
                              <div key={slot.id} className="relative">
                                <RadioGroupItem
                                  value={slot.id}
                                  id={slot.id}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={slot.id}
                                  className={`
                                    flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 relative
                                    ${isSelected
                                      ? 'border-black bg-black text-white shadow-lg transform scale-105'
                                      : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  {isSelected && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}

                                  <Clock className={`h-5 w-5 mb-2 ${isSelected ? 'text-white' : 'text-gray-600'}`} />

                                  <span className={`font-semibold text-base mb-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                    {format(parseISO(slot.startTime), "HH:mm")} - {format(parseISO(slot.endTime), "HH:mm")}
                                  </span>

                                  <Badge
                                    variant={isSelected ? "secondary" : isLowAvailability ? "destructive" : "outline"}
                                    className={`text-xs font-medium ${isSelected
                                      ? 'bg-white/20 text-white border-white/30'
                                      : isLowAvailability
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-green-50 text-green-700 border-green-200'
                                      }`}
                                  >
                                    {slot.availableSpots > 0
                                      ? `${slot.availableSpots} place${slot.availableSpots > 1 ? 's' : ''}`
                                      : 'Complet'
                                    }
                                  </Badge>

                                  {isLowAvailability && slot.availableSpots > 0 && (
                                    <span className="text-xs text-orange-600 mt-1 font-medium">
                                      Dernières places !
                                    </span>
                                  )}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {timeSlots.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun créneau disponible
                    </h3>
                    <p className="text-gray-600">
                      Tous les créneaux sont complets pour le moment. Veuillez réessayer plus tard.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mode de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Mode de paiement
                </CardTitle>
                {!paymentMethod && (
                  <p className="text-sm text-gray-600">
                    Choisissez comment vous souhaitez régler votre commande
                  </p>
                )}
                {paymentMethod && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Mode de paiement sélectionné</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="relative">
                      <RadioGroupItem value="CARD_ONLINE" id="card-online" className="peer sr-only" />
                      <Label
                        htmlFor="card-online"
                        className={`
                          flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                          ${paymentMethod === "CARD_ONLINE"
                            ? 'border-black bg-black text-white shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md hover:bg-gray-50'
                          }
                        `}
                      >
                        {paymentMethod === "CARD_ONLINE" && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <CreditCard className={`h-6 w-6 ${paymentMethod === "CARD_ONLINE" ? 'text-white' : 'text-blue-600'}`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${paymentMethod === "CARD_ONLINE" ? 'text-white' : 'text-gray-900'}`}>
                            Payer en ligne par carte
                          </div>
                          <div className={`text-sm ${paymentMethod === "CARD_ONLINE" ? 'text-white/80' : 'text-gray-600'}`}>
                            Paiement sécurisé avec Stripe
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${paymentMethod === "CARD_ONLINE" ? 'bg-white/20 text-white border-white/30' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                        >
                          Recommandé
                        </Badge>
                      </Label>
                    </div>

                    <div className="relative">
                      <RadioGroupItem value="CARD_INSTORE" id="card-instore" className="peer sr-only" />
                      <Label
                        htmlFor="card-instore"
                        className={`
                          flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                          ${paymentMethod === "CARD_INSTORE"
                            ? 'border-black bg-black text-white shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md hover:bg-gray-50'
                          }
                        `}
                      >
                        {paymentMethod === "CARD_INSTORE" && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <CreditCard className={`h-6 w-6 ${paymentMethod === "CARD_INSTORE" ? 'text-white' : 'text-green-600'}`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${paymentMethod === "CARD_INSTORE" ? 'text-white' : 'text-gray-900'}`}>
                            Payer par carte en magasin
                          </div>
                          <div className={`text-sm ${paymentMethod === "CARD_INSTORE" ? 'text-white/80' : 'text-gray-600'}`}>
                            Paiement au moment du retrait
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="relative">
                      <RadioGroupItem value="CASH_INSTORE" id="cash-instore" className="peer sr-only" />
                      <Label
                        htmlFor="cash-instore"
                        className={`
                          flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                          ${paymentMethod === "CASH_INSTORE"
                            ? 'border-black bg-black text-white shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md hover:bg-gray-50'
                          }
                        `}
                      >
                        {paymentMethod === "CASH_INSTORE" && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <Banknote className={`h-6 w-6 ${paymentMethod === "CASH_INSTORE" ? 'text-white' : 'text-orange-600'}`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${paymentMethod === "CASH_INSTORE" ? 'text-white' : 'text-gray-900'}`}>
                            Payer en espèces en magasin
                          </div>
                          <div className={`text-sm ${paymentMethod === "CASH_INSTORE" ? 'text-white/80' : 'text-gray-600'}`}>
                            Paiement au moment du retrait
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes (optionnel)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Commentaires ou instructions particulières..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Récapitulatif de commande */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Récapitulatif
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Articles */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
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
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            🍞
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {item.price.toFixed(2)}€
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {(item.quantity * item.price).toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total ({itemCount} articles)</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frais de service</span>
                    <span>Gratuit</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                </div>

                {/* Bouton de commande */}
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedTimeSlot || !paymentMethod || !customerInfo.name || !customerInfo.email || isSubmitting}
                  className="w-full h-12 text-base font-medium"
                >
                  {isSubmitting ? "Création en cours..." : `Confirmer la commande • ${total.toFixed(2)}€`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  En confirmant votre commande, vous acceptez nos conditions générales de vente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 