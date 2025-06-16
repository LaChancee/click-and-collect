import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface SuccessPageProps {
  params: Promise<{
    bakerySlug: string;
  }>;
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { bakerySlug } = await params;
  const { session_id } = await searchParams;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Paiement réussi !
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-lg mb-2">
                Votre commande a été confirmée et payée avec succès.
              </p>
              <p className="text-gray-600">
                Vous allez recevoir un email de confirmation avec tous les détails de votre commande.
              </p>
            </div>

            {session_id && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>ID de session :</strong> {session_id}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold">Prochaines étapes :</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Receipt className="h-4 w-4 mt-1 text-blue-500" />
                  <span>Vous recevrez un email de confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                  <span>La boulangerie préparera votre commande</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowLeft className="h-4 w-4 mt-1 text-purple-500" />
                  <span>Venez récupérer votre commande au créneau choisi</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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