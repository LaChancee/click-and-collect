import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import type { NextRequest } from "next/server";
// Créer le gestionnaire
const handler = createRouteHandler({
  router: ourFileRouter,
});

// Fonction POST personnalisée qui gère les webhooks
export async function POST(request: NextRequest) {
  // Les webhooks UploadThing proviennent de leurs serveurs et n'ont pas de session
  // Détectez si c'est un webhook en vérifiant l'en-tête signature
  const signature = request.headers.get("uploadthing-hook-signature");

  if (signature) {
    // C'est un webhook d'UploadThing, laissez-le passer sans vérification de session
    console.log(
      "Webhook UploadThing détecté, contournement de l'authentification",
    );
    return await handler.POST(request);
  }

  // Pour les autres requêtes normales, continuez comme avant
  // ... le reste de votre code
  return handler.POST(request);
}

// Gestionnaire GET standard
export async function GET(request: NextRequest) {
  return handler.GET(request);
}
