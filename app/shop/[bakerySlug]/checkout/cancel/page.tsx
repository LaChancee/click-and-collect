import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

interface CancelPageProps {
  params: Promise<{
    bakerySlug: string;
  }>;
}

export default async function CancelPage({ params }: CancelPageProps) {
  const { bakerySlug } = await params;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Paiement annulé
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-lg mb-2">
                Votre paiement a été annulé.
              </p>
              <p className="text-gray-600">
                Aucun montant n'a été débité de votre compte.
                Vous pouvez reprendre votre commande quand vous le souhaitez.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Astuce :</strong> Vos articles sont toujours dans votre panier.
                Vous pouvez finaliser votre commande plus tard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href={`/shop/${bakerySlug}/checkout`}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reprendre ma commande
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href={`/shop/${bakerySlug}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la boutique
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 