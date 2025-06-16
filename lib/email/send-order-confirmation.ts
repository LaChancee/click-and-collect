import { render } from "@react-email/components";
import { EmailService } from "./email-service";
import OrderConfirmationEmail from "../../components/emails/order-confirmation-email";

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  notes?: string;
}

interface SendOrderConfirmationParams {
  to: string;
  orderNumber: string;
  customerName: string;
  bakeryName: string;
  items: OrderItem[];
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: string;
  notes?: string;
}

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams,
) {
  try {
    // Générer le HTML à partir du template React
    const emailHtml = await render(
      OrderConfirmationEmail({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        bakeryName: params.bakeryName,
        items: params.items,
        totalAmount: params.totalAmount,
        pickupDate: params.pickupDate,
        pickupTime: params.pickupTime,
        paymentMethod: params.paymentMethod,
        notes: params.notes,
      }),
    );

    // Envoyer l'email
    const emailService = EmailService.getInstance();
    const result = await emailService.sendEmail({
      to: params.to,
      subject: `Confirmation de commande #${params.orderNumber} - ${params.bakeryName}`,
      html: emailHtml,
    });

    if (result.success) {
      console.log(
        `Email de confirmation envoyé avec succès pour la commande #${params.orderNumber}`,
      );
    } else {
      console.error(
        `Erreur lors de l'envoi de l'email de confirmation pour la commande #${params.orderNumber}:`,
        result.error,
      );
    }

    return result;
  } catch (error) {
    console.error(
      "Erreur lors de la génération ou de l'envoi de l'email de confirmation:",
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
