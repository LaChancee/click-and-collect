import { render } from "@react-email/components";
import OrderConfirmationEmail from "../../../../../../../components/emails/order-confirmation-email";
import { Resend } from "resend";
import { Decimal } from "@prisma/client/runtime/library";

interface OrderItem {
  quantity: number;
  unitPrice: Decimal;
  article: {
    name: string;
    price: Decimal;
  };
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

interface SendOrderEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  totalAmount: Decimal;
  timeSlot: TimeSlot;
  bakeryName: string;
}

export async function sendOrderEmail(params: SendOrderEmailParams) {
  try {
    const statusLabels = {
      PENDING: "En attente",
      CONFIRMED: "Confirmée",
      PREPARING: "En préparation",
      READY: "Prête",
      COMPLETED: "Terminée",
      CANCELLED: "Annulée",
    };

    const paymentMethodLabels = {
      CARD_ONLINE: "Carte en ligne",
      CARD_INSTORE: "Carte en magasin",
      CASH_INSTORE: "Espèces en magasin",
    };

    const statusLabel =
      statusLabels[params.status as keyof typeof statusLabels] || params.status;

    // Utiliser le template React Email pour un rendu professionnel
    const emailHtml = await render(
      OrderConfirmationEmail({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        bakeryName: params.bakeryName,
        items: params.items.map((item) => ({
          name: item.article.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        })),
        totalAmount: Number(params.totalAmount),
        pickupDate: new Date(params.timeSlot.startTime).toLocaleDateString(
          "fr-FR",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        ),
        pickupTime: `${params.timeSlot.startTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${params.timeSlot.endTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        paymentMethod: "Selon votre choix", // Valeur par défaut car non disponible dans les paramètres
      }),
    );

    const emailService = new Resend(process.env.RESEND_API_KEY);
    return await emailService.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com",
      to: params.to,
      subject: `${statusLabel} - Commande #${params.orderNumber} - ${params.bakeryName}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

function generateEmailTemplate(params: SendOrderEmailParams): string {
  const {
    customerName,
    orderNumber,
    status,
    items,
    totalAmount,
    timeSlot,
    bakeryName,
  } = params;

  const statusLabels = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    PREPARING: "En préparation",
    READY: "Prête pour le retrait",
    COMPLETED: "Récupérée",
    CANCELLED: "Annulée",
  };

  const statusLabel =
    statusLabels[status as keyof typeof statusLabels] || status;
  const statusColor = getStatusColor(status);

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de commande</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f8f9fa;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 12px 12px 0 0; 
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header h2 {
          margin: 10px 0 0 0;
          font-size: 18px;
          font-weight: 400;
          opacity: 0.9;
        }
        .content { 
          background-color: white; 
          padding: 40px 30px; 
          border-left: 1px solid #e9ecef;
          border-right: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .footer { 
          background-color: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          border-radius: 0 0 12px 12px; 
          font-size: 14px; 
          color: #6c757d;
          border: 1px solid #e9ecef;
          border-top: none;
        }
        .status-badge { 
          display: inline-block; 
          padding: 12px 24px; 
          border-radius: 25px; 
          font-weight: 600; 
          color: white; 
          background-color: ${statusColor}; 
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .order-items { 
          margin: 30px 0; 
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }
        .item { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          padding: 16px 20px; 
          border-bottom: 1px solid #f8f9fa; 
        }
        .item:last-child {
          border-bottom: none;
        }
        .item:nth-child(even) {
          background-color: #f8f9fa;
        }
        .item-info {
          flex: 1;
        }
        .item-name {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }
        .item-details {
          font-size: 14px;
          color: #6c757d;
        }
        .item-price {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
        }
        .total { 
          font-weight: 700; 
          font-size: 20px; 
          margin-top: 30px; 
          padding: 20px; 
          border-top: 2px solid #e9ecef; 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
        }
        .pickup-info { 
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          padding: 25px; 
          border-radius: 12px; 
          margin: 30px 0;
          border-left: 4px solid #2196f3;
        }
        .pickup-info h3 {
          margin-top: 0;
          color: #1976d2;
          font-size: 18px;
        }
        .pickup-info p {
          margin: 8px 0;
          font-size: 15px;
        }
        .ready-alert {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #28a745;
        }
        .ready-alert strong {
          font-size: 18px;
        }
        .button { 
          display: inline-block; 
          padding: 14px 28px; 
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .content { padding: 20px 15px; }
          .item { flex-direction: column; align-items: flex-start; gap: 8px; }
          .item-price { align-self: flex-end; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🥖 ${bakeryName}</h1>
          <h2>Confirmation de commande</h2>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${customerName}</strong>,</p>
          
          <p style="font-size: 16px;">Votre commande <strong>#${orderNumber}</strong> a été mise à jour :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span class="status-badge">${statusLabel}</span>
          </div>
          
          ${
            status === "READY"
              ? `
            <div class="ready-alert">
              <strong>🎉 Votre commande est prête !</strong><br>
              Vous pouvez venir la récupérer pendant votre créneau de retrait.
            </div>
          `
              : ""
          }
          
          <div class="pickup-info">
            <h3>📅 Informations de retrait</h3>
            <p><strong>Date :</strong> ${new Date(
              timeSlot.startTime,
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</p>
            <p><strong>Heure :</strong> ${timeSlot.startTime.toLocaleTimeString(
              "fr-FR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )} - ${timeSlot.endTime.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><strong>Lieu :</strong> ${bakeryName}</p>
          </div>
          
          <h3 style="color: #2c3e50; margin-top: 30px;">📋 Détail de votre commande</h3>
          <div class="order-items">
            ${items
              .map(
                (item) => `
              <div class="item">
                <div class="item-info">
                  <div class="item-name">${item.article.name}</div>
                  <div class="item-details">${item.quantity} × ${Number(item.unitPrice).toFixed(2)}€</div>
                </div>
                <div class="item-price">${(item.quantity * Number(item.unitPrice)).toFixed(2)}€</div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="total">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Total :</span>
              <span style="color: #28a745;">${Number(totalAmount).toFixed(2)}€</span>
            </div>
          </div>
          
          <p style="margin-top: 40px; font-size: 16px;">
            ${
              status === "READY"
                ? "N'oubliez pas d'apporter cette confirmation lors du retrait de votre commande."
                : "Nous vous tiendrons informé de l'évolution de votre commande."
            }
          </p>
          
          <p style="margin-top: 30px; font-size: 16px;">Merci de votre confiance !</p>
          <p style="font-weight: 600; color: #2c3e50;"><strong>L'équipe ${bakeryName}</strong></p>
        </div>
        
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>© ${new Date().getFullYear()} ${bakeryName}. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getStatusColor(status: string): string {
  const colors = {
    PENDING: "#6c757d",
    CONFIRMED: "#007bff",
    PREPARING: "#fd7e14",
    READY: "#28a745",
    COMPLETED: "#28a745",
    CANCELLED: "#dc3545",
  };
  return colors[status as keyof typeof colors] || "#6c757d";
}
