import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin path)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|admin).*)",
  ],
};

export async function middleware(request: NextRequest) {
  // ✅ Middleware simplifié - pas d'authentification pour éviter l'erreur better-auth
  // TODO: Réactiver la logique d'authentification quand better-auth sera compatible Edge Runtime
  
  // Pour l'instant, on laisse passer toutes les requêtes
  return NextResponse.next();
}
