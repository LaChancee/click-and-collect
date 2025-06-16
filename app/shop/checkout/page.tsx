import { notFound } from "next/navigation";
import { CheckoutClient } from "./_components/CheckoutClient";
import { getAvailableTimeSlotsAction } from "./_actions/get-available-time-slots.action";
import type { PageParams } from "@/types/next";

export default async function CheckoutPage(props: PageParams) {
  const searchParams = await props.searchParams;
  const bakerySlug = searchParams?.bakery as string;

  console.log("Checkout page - bakerySlug:", bakerySlug);

  if (!bakerySlug) {
    console.log("Pas de bakerySlug fourni, redirection vers 404");
    notFound();
  }

  try {
    console.log("Récupération des créneaux pour:", bakerySlug);
    const timeSlots = await getAvailableTimeSlotsAction(bakerySlug);
    console.log("Créneaux récupérés:", timeSlots.length);

    return (
      <CheckoutClient
        bakerySlug={bakerySlug}
        timeSlots={timeSlots}
      />
    );
  } catch (error) {
    console.error("Erreur lors du chargement des créneaux:", error);

    // Au lieu de notFound(), retournons une page d'erreur plus informative
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de charger les créneaux de retrait pour cette boulangerie.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Erreur: {error instanceof Error ? error.message : "Erreur inconnue"}
          </p>
          <a
            href={`/shop?bakery=${bakerySlug}`}
            className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Retour au shop
          </a>
        </div>
      </div>
    );
  }
} 