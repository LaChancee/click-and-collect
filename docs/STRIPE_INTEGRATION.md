# Intégration Stripe Connect - Documentation complète

## Vue d'ensemble

L'intégration Stripe Connect permet aux boulangeries de recevoir les paiements directement sur leur compte bancaire via Stripe, avec une commission automatique prélevée sur chaque transaction.

## Architecture

### 1. Stripe Connect Express

- **Type de compte** : Express (onboarding simplifié)
- **Pays** : France (FR)
- **Capacités** : Paiements par carte et virements

### 2. Flux de paiement

1. **Client** : Passe commande et choisit le paiement par carte
2. **Stripe Checkout** : Session de paiement sécurisée
3. **Webhook** : Confirmation automatique et création de commande
4. **Email** : Confirmation envoyée automatiquement
5. **Transfert** : Fonds transférés vers le compte de la boulangerie

## Fichiers créés/modifiés

### Services et utilitaires

- `lib/stripe/stripe-service.ts` - Service principal Stripe Connect
- `app/api/stripe/connect/route.ts` - Connexion compte boulangerie
- `app/api/stripe/checkout/route.ts` - Création session de paiement
- `app/api/stripe/account/status/route.ts` - Vérification statut compte
- `app/api/webhooks/stripe/route.ts` - Traitement événements Stripe

### Interface boulangerie

- `app/orgs/[orgSlug]/(navigation)/settings/stripe/page.tsx` - Page configuration
- `app/orgs/[orgSlug]/(navigation)/settings/stripe/_components/StripeConnectButton.tsx` - Bouton connexion
- `app/orgs/[orgSlug]/(navigation)/settings/stripe/_components/StripeAccountStatus.tsx` - Statut compte

### Interface client

- `app/shop/checkout/_actions/create-stripe-checkout.action.ts` - Action checkout
- `app/shop/checkout/_components/StripePaymentButton.tsx` - Bouton paiement
- `app/shop/[bakerySlug]/checkout/success/page.tsx` - Page succès
- `app/shop/[bakerySlug]/checkout/cancel/page.tsx` - Page annulation

### Base de données

- Ajout champs Stripe dans `Organization` :
  - `stripeAccountId` : ID du compte Stripe Connect
  - `stripeAccountStatus` : Statut du compte (pending/enabled)
  - `stripeChargesEnabled` : Peut recevoir des paiements
  - `stripePayoutsEnabled` : Peut recevoir des virements
  - `stripeOnboardingUrl` : URL d'onboarding

## Configuration requise

### Variables d'environnement

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Connect
STRIPE_CLIENT_ID="ca_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Webhooks Stripe

Configurer l'endpoint : `/api/webhooks/stripe`

Événements à écouter :

- `checkout.session.completed` - Paiement réussi
- `account.updated` - Mise à jour compte Connect

## Utilisation

### Pour les boulangeries

1. **Connexion initiale** :

   - Aller dans Paramètres > Stripe
   - Cliquer sur "Se connecter avec Stripe"
   - Finaliser l'onboarding Stripe

2. **Vérification du statut** :
   - Statut visible dans l'interface
   - Bouton "Actualiser le statut"
   - Lien vers le dashboard Stripe

### Pour les clients

1. **Paiement par carte** :

   - Sélectionner les articles
   - Choisir le créneau
   - Cliquer sur "Payer par carte bancaire"
   - Redirection vers Stripe Checkout

2. **Après paiement** :
   - Redirection vers page de succès
   - Email de confirmation automatique
   - Commande créée avec statut "CONFIRMED"

## Commission et transferts

### Commission

- **Taux** : 3% par défaut (configurable)
- **Calcul** : Automatique via `applicationFeeAmount`
- **Prélèvement** : Automatique par Stripe

### Transferts

- **Fréquence** : Selon configuration Stripe de la boulangerie
- **Délai** : 2-7 jours ouvrés (standard Stripe)
- **Destination** : Compte bancaire de la boulangerie

## Sécurité

### Validation

- Vérification des permissions (boulangerie uniquement)
- Validation des données avec Zod
- Vérification de l'appartenance des comptes

### Webhooks

- Signature Stripe vérifiée
- Gestion d'erreurs robuste
- Logs détaillés

## Gestion d'erreurs

### Côté boulangerie

- Compte non configuré → Message d'aide
- Onboarding incomplet → Lien de finalisation
- Problème de compte → Contact support

### Côté client

- Boulangerie sans Stripe → Message d'erreur
- Articles indisponibles → Vérification en temps réel
- Paiement échoué → Redirection vers page d'annulation

## Tests

### Mode test Stripe

- Utiliser les clés de test Stripe
- Cartes de test disponibles dans la documentation Stripe
- Webhooks testables avec Stripe CLI

### Cartes de test courantes

- `4242424242424242` - Visa réussie
- `4000000000000002` - Carte déclinée
- `4000000000009995` - Fonds insuffisants

## Monitoring

### Logs

- Création de comptes Connect
- Sessions de checkout
- Webhooks reçus
- Erreurs de paiement

### Métriques importantes

- Taux de conversion checkout
- Montant des commissions
- Statut des comptes boulangeries
- Échecs de paiement

## Support

### Documentation Stripe

- [Stripe Connect Express](https://stripe.com/docs/connect/express-accounts)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Checkout Sessions](https://stripe.com/docs/payments/checkout)

### Dépannage courant

1. **Webhook non reçu** → Vérifier l'URL et la signature
2. **Compte bloqué** → Vérifier les requirements Stripe
3. **Paiement échoué** → Logs Stripe Dashboard
4. **Commission incorrecte** → Vérifier `applicationFeeAmount`
