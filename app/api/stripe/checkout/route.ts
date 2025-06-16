import { NextRequest, NextResponse } from "next/server";
import { StripeService } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CheckoutSchema = z.object({
  timeSlotId: z.string(),
  items: z.array(
    z.object({
      articleId: z.string(),
      quantity: z.number().min(1),
    }),
  ),
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CheckoutSchema.parse(body);

    // Récupérer le créneau et la boulangerie
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: data.timeSlotId },
      include: {
        bakery: {
          select: {
            id: true,
            name: true,
            slug: true,
            stripeAccountId: true,
            stripeChargesEnabled: true,
          },
        },
      },
    });

    if (!timeSlot) {
      return NextResponse.json(
        { error: "Créneau non trouvé" },
        { status: 404 },
      );
    }

    if (
      !timeSlot.bakery.stripeAccountId ||
      !timeSlot.bakery.stripeChargesEnabled
    ) {
      return NextResponse.json(
        { error: "Cette boulangerie n'a pas configuré les paiements Stripe" },
        { status: 400 },
      );
    }

    // Récupérer les articles et calculer le total
    const articles = await prisma.article.findMany({
      where: {
        id: { in: data.items.map((item) => item.articleId) },
        bakeryId: timeSlot.bakery.id,
        isActive: true,
        isAvailable: true,
      },
    });

    if (articles.length !== data.items.length) {
      return NextResponse.json(
        { error: "Certains articles ne sont pas disponibles" },
        { status: 400 },
      );
    }

    // Calculer le montant total
    let totalAmount = 0;
    const orderItems = data.items.map((item) => {
      const article = articles.find((a) => a.id === item.articleId);
      if (!article) throw new Error("Article non trouvé");

      const itemTotal = Number(article.price) * item.quantity;
      totalAmount += itemTotal;

      return {
        articleId: article.id,
        name: article.name,
        quantity: item.quantity,
        unitPrice: Number(article.price),
        total: itemTotal,
      };
    });

    const stripeService = StripeService.getInstance();

    // Calculer la commission (3% par exemple)
    const applicationFeeAmount = stripeService.calculateApplicationFee(
      Math.round(totalAmount * 100), // Convertir en centimes
      3, // 3% de commission
    );

    // URLs de redirection
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/shop/${timeSlot.bakery.slug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/shop/${timeSlot.bakery.slug}/checkout/cancel`;

    // Créer la session de checkout
    const session = await stripeService.createCheckoutSession({
      priceData: {
        currency: "eur",
        product_data: {
          name: `Commande - ${timeSlot.bakery.name}`,
          description: `${orderItems.length} article(s) - Retrait le ${new Date(timeSlot.startTime).toLocaleDateString("fr-FR")}`,
        },
        unit_amount: Math.round(totalAmount * 100), // Convertir en centimes
      },
      successUrl,
      cancelUrl,
      customerEmail: data.customerInfo.email,
      stripeAccountId: timeSlot.bakery.stripeAccountId,
      applicationFeeAmount,
      metadata: {
        timeSlotId: data.timeSlotId,
        bakeryId: timeSlot.bakery.id,
        customerName: data.customerInfo.name,
        customerEmail: data.customerInfo.email,
        customerPhone: data.customerInfo.phone || "",
        notes: data.notes || "",
        items: JSON.stringify(orderItems),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la session checkout:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 },
    );
  }
}
