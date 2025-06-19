// Service d'email générique pour l'application
// Peut être configuré avec différents providers (Resend, SendGrid, etc.)

import { Resend } from "resend";

// Configuration du service email
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(
    options: EmailOptions,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Utiliser l'adresse email par défaut si non spécifiée
      const fromEmail =
        options.from ||
        process.env.RESEND_FROM_EMAIL ||
        "noreply@yourdomain.com";

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error("Erreur lors de l'envoi d'email avec Resend:", error);
        return { success: false, error: error.message };
      }

      console.log("Email envoyé avec succès via Resend:", data?.id);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'envoi d'email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  static async sendOrderConfirmation(params: {
    to: string;
    customerName: string;
    orderNumber: string;
    status: string;
    bakeryName: string;
    htmlContent: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const statusLabels = {
      PENDING: "En attente",
      CONFIRMED: "Confirmée",
      PREPARING: "En préparation",
      READY: "Prête pour le retrait",
      COMPLETED: "Récupérée",
      CANCELLED: "Annulée",
    };

    const statusLabel =
      statusLabels[params.status as keyof typeof statusLabels] || params.status;

    return this.getInstance().sendEmail({
      to: params.to,
      subject: `${statusLabel} - Commande #${params.orderNumber} - ${params.bakeryName}`,
      html: params.htmlContent,
    });
  }
}

// Configuration pour les variables d'environnement
export const EMAIL_CONFIG = {
  // Provider à utiliser: "console", "resend", "sendgrid"
  PROVIDER: process.env.EMAIL_PROVIDER || "console",

  // Adresse email par défaut pour l'envoi
  FROM: process.env.EMAIL_FROM || "noreply@votre-boulangerie.com",

  // Clés API (à configurer selon le provider choisi)
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
} as const;

// Instructions pour la configuration
export const EMAIL_SETUP_INSTRUCTIONS = `
🔧 Configuration du service d'email :

1. Choisissez votre provider d'email :
   - Console (développement) : EMAIL_PROVIDER=console
   - Resend : EMAIL_PROVIDER=resend
   - SendGrid : EMAIL_PROVIDER=sendgrid

2. Configurez les variables d'environnement dans votre .env :
   
   # Configuration générale
   EMAIL_FROM=noreply@votre-boulangerie.com
   EMAIL_PROVIDER=console
   
   # Pour Resend
   RESEND_API_KEY=your_resend_api_key
   
   # Pour SendGrid
   SENDGRID_API_KEY=your_sendgrid_api_key

3. Installez les dépendances nécessaires :
   - Pour Resend : npm install resend
   - Pour SendGrid : npm install @sendgrid/mail

4. Décommentez le provider choisi dans ce fichier
`;

console.log(EMAIL_SETUP_INSTRUCTIONS);
