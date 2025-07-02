import { NextResponse } from "next/server";
import { getBakeryUser, getUser } from "@/lib/auth/auth-user";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { isBakery: false, isClient: false },
        { status: 200 },
      );
    }

    // Vérifier si l'utilisateur est une boulangerie
    const bakeryUser = await getBakeryUser();

    if (bakeryUser) {
      return NextResponse.json({
        isBakery: true,
        isClient: false,
        bakeryInfo: {
          id: bakeryUser.bakery.id,
          name: bakeryUser.bakery.name,
          slug: bakeryUser.bakery.slug,
        },
      });
    }

    // L'utilisateur est un client
    return NextResponse.json({
      isBakery: false,
      isClient: true,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du type d'utilisateur:",
      error,
    );
    return NextResponse.json(
      { isBakery: false, isClient: true },
      { status: 500 },
    );
  }
}
