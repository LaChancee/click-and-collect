"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, MapPin, Phone, Mail, ShoppingBag, ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  article: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  notes: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: string;
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
    bakery: {
      name: string;
      address: string | null;
      phone: string | null;
    };
  };
  items: OrderItem[];
}

interface OrderConfirmationClientProps {
  order: Order;
}

export function OrderConfirmationClient({ order }: OrderConfirmationClientProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">En attente</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800">Confirmée</Badge>;
      case "PREPARING":
        return <Badge className="bg-orange-100 text-orange-800">En préparation</Badge>;
      case "READY":
        return <Badge className="bg-green-100 text-green-800">Prête</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-600 text-white">Terminée</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    switch (method) {
      case "CARD_ONLINE":
        return "Carte en ligne";
      case "CARD_INSTORE":
        return "Carte en magasin";
      case "CASH_INSTORE":
        return "Espèces en magasin";
      default:
        return "Non défini";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
            <p className="text-gray-600">
              Votre commande <span className="font-medium">{order.orderNumber}</span> a été enregistrée avec succès.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Détails de retrait */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Informations de retrait
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{order.timeSlot.bakery.name}</p>
                    {order.timeSlot.bakery.address && (
                      <p className="text-sm text-gray-600">{order.timeSlot.bakery.address}</p>
                    )}
                    {order.timeSlot.bakery.phone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{order.timeSlot.bakery.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {format(parseISO(order.timeSlot.startTime), "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Entre {format(parseISO(order.timeSlot.startTime), "HH:mm")} et {format(parseISO(order.timeSlot.endTime), "HH:mm")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle>Vos informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{order.guestName?.charAt(0)}</span>
                  </div>
                  <span className="font-medium">{order.guestName}</span>
                </div>

                {order.guestEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{order.guestEmail}</span>
                  </div>
                )}

                {order.guestPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{order.guestPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au shop
                </Button>
              </Link>
              <Button className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Recevoir par email
              </Button>
            </div>
          </div>

          {/* Récapitulatif de commande */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Récapitulatif
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">Statut:</span>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Articles */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.article.imageUrl ? (
                          <Image
                            src={item.article.imageUrl}
                            alt={item.article.name}
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
                        <p className="font-medium text-sm truncate">{item.article.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {item.unitPrice.toFixed(2)}€
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {(item.quantity * item.unitPrice).toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{order.totalAmount.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frais de service</span>
                    <span>Gratuit</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{order.totalAmount.toFixed(2)}€</span>
                  </div>
                </div>

                {/* Paiement */}
                <div className="pt-2">
                  <div className="flex justify-between text-sm">
                    <span>Mode de paiement:</span>
                    <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Statut du paiement:</span>
                    <Badge variant={order.paymentStatus === "PAID" ? "default" : "secondary"}>
                      {order.paymentStatus === "PAID" ? "Payé" : "En attente"}
                    </Badge>
                  </div>
                </div>

                {/* Informations */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Présentez-vous à l'heure de retrait choisie avec votre numéro de commande.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 