import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { sendOrderConfirmationEmail } from "../../../../lib/email/send-order-confirmation";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("Erreur de vérification webhook:", error);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: any) {
  console.log("Traitement du paiement réussi:", session.id);

  const metadata = session.metadata;
  if (!metadata) {
    console.error("Métadonnées manquantes dans la session");
    return;
  }

  try {
    // Parser les items depuis les métadonnées
    const items = JSON.parse(metadata.items);

    // Créer la commande dans la base de données
    const order = await prisma.order.create({
      data: {
        orderNumber: `CMD-${nanoid(8).toUpperCase()}`,
        totalAmount: session.amount_total / 100, // Convertir depuis les centimes
        status: "CONFIRMED", // Commande confirmée car paiement réussi
        paymentStatus: "PAID",
        paymentMethod: "CARD_ONLINE",
        notes: metadata.notes || null,
        isGuestOrder: true, // Pour l'instant, on traite tous les paiements comme des commandes invités
        guestName: metadata.customerName,
        guestEmail: metadata.customerEmail,
        guestPhone: metadata.customerPhone || null,
        timeSlotId: metadata.timeSlotId,
        stripeSessionId: session.id,
        items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: null,
            articleId: item.articleId,
          })),
        },
      },
      include: {
        items: {
          include: {
            article: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    // Récupérer les informations de la boulangerie
    const bakery = await prisma.organization.findUnique({
      where: { id: metadata.bakeryId },
      select: { name: true },
    });

    // Envoyer l'email de confirmation
    if (metadata.customerEmail && bakery) {
      await sendOrderConfirmationEmail({
        to: metadata.customerEmail,
        orderNumber: order.orderNumber,
        customerName: metadata.customerName,
        bakeryName: bakery.name,
        items: order.items.map((item) => ({
          name: item.article.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        })),
        totalAmount: Number(order.totalAmount),
        pickupDate: new Date(order.timeSlot.startTime).toLocaleDateString(
          "fr-FR",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        ),
        pickupTime: `${order.timeSlot.startTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${order.timeSlot.endTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        paymentMethod: "Carte bancaire",
        notes: order.notes || undefined,
      });
    }

    console.log(`Commande créée avec succès: ${order.orderNumber}`);
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    throw error;
  }
}

async function handleAccountUpdated(account: any) {
  console.log("Mise à jour du compte Stripe:", account.id);

  try {
    // Mettre à jour le statut du compte dans la base de données
    await prisma.organization.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeAccountStatus: account.details_submitted ? "enabled" : "pending",
      },
    });

    console.log(`Statut du compte ${account.id} mis à jour`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compte:", error);
    throw error;
  }
}
