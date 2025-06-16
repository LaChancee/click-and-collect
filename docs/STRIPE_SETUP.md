# Configuration Stripe Connect

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Stripe Connect
STRIPE_CLIENT_ID="ca_your_client_id_here"
NEXT_PUBLIC_STRIPE_CONNECT_REDIRECT_URI="http://localhost:3000/api/stripe/connect/callback"
```

## Configuration Stripe Connect

1. **Créer une application Stripe Connect** :

   - Allez dans votre Dashboard Stripe
   - Naviguez vers "Connect" > "Settings"
   - Créez une nouvelle application Connect
   - Notez votre `client_id`

2. **Configurer les URLs de redirection** :

   - URL de redirection : `http://localhost:3000/api/stripe/connect/callback`
   - URL de production : `https://yourdomain.com/api/stripe/connect/callback`

3. **Webhooks** :
   - Créez un endpoint webhook : `/api/webhooks/stripe`
   - Événements à écouter :
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `account.updated`

## Flux de paiement

1. **Connexion boulangerie** : La boulangerie se connecte à Stripe via OAuth
2. **Paiement client** : Les paiements sont traités avec Stripe Connect
3. **Transfert automatique** : Les fonds vont directement sur le compte de la boulangerie
4. **Commission** : Une commission peut être prélevée automatiquement
