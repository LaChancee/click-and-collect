# Guide de Test - Système de Paiement Stripe

Ce guide vous permet de tester le système de paiement Stripe pour les boulangeries.

## 🔧 Prérequis

### 1. Configuration Stripe

Assurez-vous que ces variables d'environnement sont définies dans votre `.env` :

```env
# Clés Stripe (mode test)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Boulangerie avec Stripe Connect

Vérifiez qu'au moins une boulangerie a configuré Stripe Connect :

1. Connectez-vous en tant que boulangerie : `/orgs/[orgSlug]`
2. Allez dans **Paramètres** > **Paiements**
3. Cliquez sur **Configurer Stripe Connect**
4. Complétez le processus d'onboarding Stripe

## 🧪 Tests à Effectuer

### Test 1 : Vérification de la Configuration

1. **Accédez au dashboard boulangerie** : `/orgs/[orgSlug]/settings`
2. **Vérifiez l'onglet "Paiements"** :
   - ✅ Statut du compte Stripe : "Activé"
   - ✅ Paiements activés : "Oui"
   - ✅ Virements activés : "Oui"

### Test 2 : Commande avec Paiement en Ligne

1. **Accédez à la boutique** : `/shop?bakery=[bakerySlug]`
2. **Ajoutez des articles au panier** (minimum 1€)
3. **Cliquez sur "Commander"**
4. **Remplissez le formulaire de checkout** :
   - Nom complet
   - Email
   - Téléphone (optionnel)
5. **Sélectionnez un créneau de retrait**
6. **Choisissez "Payer en ligne par carte"**
7. **Cliquez sur "Confirmer la commande"**

### Test 3 : Processus de Paiement Stripe

1. **Vous devriez être redirigé vers Stripe Checkout**
2. **Utilisez une carte de test** :
   - Numéro : `4242 4242 4242 4242`
   - Date : `12/34`
   - CVC : `123`
   - Code postal : `12345`
3. **Complétez le paiement**

### Test 4 : Vérification du Succès

1. **Après paiement réussi** :

   - ✅ Redirection vers `/shop/[bakerySlug]/checkout/success`
   - ✅ Message de confirmation affiché
   - ✅ ID de session Stripe visible

2. **Email de confirmation** :
   - ✅ Email reçu à l'adresse fournie
   - ✅ Détails de la commande corrects
   - ✅ Informations de retrait présentes

### Test 5 : Vérification dans le Dashboard Boulangerie

1. **Accédez aux commandes** : `/orgs/[orgSlug]/orders`
2. **Vérifiez la nouvelle commande** :
   - ✅ Statut : "Confirmée"
   - ✅ Paiement : "Payé"
   - ✅ Méthode : "Carte en ligne"
   - ✅ Montant correct

### Test 6 : Test d'Annulation

1. **Répétez les étapes 1-6 du Test 2**
2. **Sur la page Stripe Checkout, cliquez sur "← Retour"**
3. **Vérifiez la redirection** vers `/shop/[bakerySlug]/checkout/cancel`
4. **Vérifiez le message d'annulation**

## 🔍 Vérifications Techniques

### Webhook Stripe

1. **Vérifiez les logs du webhook** : `/api/webhooks/stripe`
2. **Dans Stripe Dashboard** > **Développeurs** > **Webhooks**
3. **Vérifiez que les événements sont reçus** :
   - `checkout.session.completed`
   - `account.updated`

### Base de Données

Vérifiez que les commandes sont créées correctement :

```sql
SELECT
  orderNumber,
  totalAmount,
  status,
  paymentStatus,
  paymentMethod,
  stripeSessionId,
  guestName,
  guestEmail
FROM "Order"
WHERE paymentMethod = 'CARD_ONLINE'
ORDER BY createdAt DESC
LIMIT 5;
```

### Stripe Dashboard

1. **Accédez au Stripe Dashboard**
2. **Vérifiez les paiements** dans la section "Paiements"
3. **Vérifiez les comptes Connect** dans "Connect"

## 🚨 Problèmes Courants

### Erreur : "Cette boulangerie n'a pas configuré les paiements Stripe"

**Solution** :

1. Vérifiez que `stripeAccountId` est défini pour la boulangerie
2. Vérifiez que `stripeChargesEnabled` est `true`
3. Complétez l'onboarding Stripe Connect

### Erreur : "Signature invalide" dans le webhook

**Solution** :

1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
2. Utilisez `stripe listen --forward-to localhost:3000/api/webhooks/stripe` pour les tests locaux

### Paiement réussi mais commande non créée

**Solution** :

1. Vérifiez les logs du webhook
2. Vérifiez que les métadonnées sont correctement passées
3. Vérifiez la structure de la base de données

## 📊 Métriques à Surveiller

### Pour la Boulangerie

1. **Revenus** : Visible dans `/orgs/[orgSlug]/dashboard`
2. **Commandes payées** : Statut "Payé" dans les commandes
3. **Commission plateforme** : 3% automatiquement déduite

### Pour la Plateforme

1. **Volume de transactions**
2. **Commissions collectées**
3. **Taux de conversion paiement**

## 🎯 Cas de Test Avancés

### Test avec Différents Montants

- Commande < 10€
- Commande > 100€
- Commande avec centimes (ex: 15,67€)

### Test avec Différents Articles

- Article unique
- Plusieurs articles identiques
- Panier mixte (pain + viennoiseries)

### Test de Charge

- Plusieurs commandes simultanées
- Commandes sur différents créneaux
- Commandes pour différentes boulangeries

---

## ✅ Checklist de Validation

- [ ] Configuration Stripe Connect complète
- [ ] Paiement en ligne fonctionnel
- [ ] Redirection succès/annulation
- [ ] Email de confirmation envoyé
- [ ] Commande créée en base
- [ ] Webhook traité correctement
- [ ] Dashboard boulangerie mis à jour
- [ ] Commission plateforme appliquée

**🎉 Si tous les tests passent, le système de paiement Stripe est opérationnel !**
