# Cahier de Test - Click & Collect "Les délices d'Erwann"

## 📋 Vue d'ensemble

Ce document détaille la stratégie de test pour la solution Click & Collect complète, couvrant les tests unitaires, d'intégration et end-to-end.

## 🎯 Objectifs des tests

- Garantir la fiabilité du processus de commande
- Valider l'intégration avec Stripe
- Vérifier la gestion des créneaux horaires
- Assurer la robustesse du système de panier
- Tester les notifications email
- Valider les permissions et la sécurité

## 📊 Couverture de test actuelle

### ✅ Tests existants

- **Tests unitaires** : Actions serveur, utilitaires, formatage
- **Tests composants** : Dialog manager, formulaires, navigation
- **Tests e2e** : Flux client complet, gestion des commandes
- **Tests d'authentification** : Permissions, rôles

### ❌ Tests manquants (à ajouter)

- Contexte du panier (CartContext)
- Composants de la boutique
- Intégration Stripe
- Gestion des créneaux horaires
- Système d'emails
- Webhooks Stripe

## 🧪 Stratégie de test

### 1. Tests unitaires (Jest/Vitest)

Tests de fonctions isolées, composants sans dépendances

### 2. Tests d'intégration

Tests d'interaction entre composants, APIs

### 3. Tests end-to-end (Playwright)

Tests de parcours utilisateur complets

## 📝 Plan de test détaillé

### 🛒 MODULE PANIER

#### Tests unitaires

- **CartContext** : Ajout, suppression, modification de quantité
- **CartSidebar** : Affichage, interactions utilisateur
- **ArticleGrid** : Ajout au panier, filtrage par catégorie

#### Tests d'intégration

- Persistance localStorage
- Changement de boulangerie
- Synchronisation avec l'API

#### Tests e2e

- Parcours d'achat complet
- Gestion des erreurs
- Navigation entre pages

### 💳 MODULE PAIEMENT

#### Tests unitaires

- **Stripe Service** : Création de sessions, calcul des commissions
- **Checkout Actions** : Validation des données, création de commande
- **Webhook Handler** : Traitement des événements Stripe

#### Tests d'intégration

- Intégration Stripe Connect
- Traitement des paiements
- Gestion des erreurs de paiement

#### Tests e2e

- Paiement en ligne réussi
- Paiement annulé
- Paiement sur place

### 🕐 MODULE CRÉNEAUX HORAIRES

#### Tests unitaires

- **TimeSlot Generator** : Génération de créneaux
- **TimeSlot Validator** : Validation des disponibilités
- **TimeSlot Settings** : Configuration des paramètres

#### Tests d'intégration

- Réservation de créneaux
- Gestion des conflits
- Mise à jour des disponibilités

#### Tests e2e

- Sélection de créneaux
- Créneaux complets
- Modification de créneaux

### 📧 MODULE NOTIFICATIONS

#### Tests unitaires

- **Email Service** : Envoi d'emails
- **Email Templates** : Rendu des templates
- **Email Actions** : Déclenchement des notifications

#### Tests d'intégration

- Intégration Resend
- Envoi d'emails de confirmation
- Gestion des erreurs d'envoi

### 🏢 MODULE ORGANISATION

#### Tests unitaires

- **Organization Service** : Gestion des boulangeries
- **Member Management** : Gestion des membres
- **Permissions** : Contrôle d'accès

#### Tests d'intégration

- Multi-tenant
- Séparation des données
- Permissions par rôle

### 📊 MODULE STATISTIQUES

#### Tests unitaires

- **Stats Calculator** : Calcul des statistiques
- **Revenue Tracker** : Suivi du chiffre d'affaires
- **Order Analytics** : Analyse des commandes

#### Tests d'intégration

- Agrégation des données
- Mise à jour en temps réel
- Filtrage par période

## 🔧 Configuration des tests

### Environnement de test

```bash
# Variables d'environnement pour les tests
NODE_ENV=test
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."
RESEND_API_KEY="re_test_..."
```

### Outils utilisés

- **Vitest** : Framework de test unitaire
- **Playwright** : Tests end-to-end
- **Testing Library** : Tests de composants React
- **MSW** : Mock des APIs externes
- **Faker** : Génération de données de test

## 📋 Cas de test spécifiques

### Cas de test critique : Commande complète

1. **Préconditions** : Boulangerie configurée, articles disponibles, créneaux ouverts
2. **Étapes** :
   - Naviguer vers la boutique
   - Ajouter des articles au panier
   - Sélectionner un créneau
   - Remplir les informations client
   - Procéder au paiement
   - Recevoir la confirmation
3. **Résultat attendu** : Commande créée, email envoyé, créneau réservé

### Cas de test critique : Paiement Stripe

1. **Préconditions** : Compte Stripe Connect configuré
2. **Étapes** :
   - Créer une session de checkout
   - Simuler un paiement réussi
   - Traiter le webhook
   - Mettre à jour la commande
3. **Résultat attendu** : Paiement confirmé, commande marquée comme payée

### Cas de test critique : Gestion des créneaux

1. **Préconditions** : Paramètres de créneaux configurés
2. **Étapes** :
   - Générer des créneaux
   - Réserver un créneau
   - Vérifier la disponibilité
   - Gérer les créneaux complets
3. **Résultat attendu** : Créneaux gérés correctement, disponibilités mises à jour

## 🚀 Processus de test

### Tests en continu (CI/CD)

- Exécution automatique à chaque push
- Tests unitaires et d'intégration
- Tests e2e sur les PR importantes

### Tests de régression

- Suite complète avant chaque release
- Tests de performance
- Tests de charge

### Tests manuels

- Tests d'acceptation utilisateur
- Tests sur différents navigateurs
- Tests d'accessibilité

## 📈 Métriques de qualité

### Couverture de code

- **Objectif** : 85% minimum
- **Critique** : 95% pour les modules de paiement
- **Monitoring** : Rapports automatiques

### Performance

- **Temps de réponse** : < 200ms pour les APIs
- **Chargement des pages** : < 3 secondes
- **Tests de charge** : 100 utilisateurs simultanés

## 🔍 Debugging et maintenance

### Logs de test

- Tests échoués avec stack traces
- Captures d'écran pour les tests e2e
- Métriques de performance

### Maintenance

- Mise à jour des données de test
- Nettoyage des tests obsolètes
- Amélioration continue

## 📚 Documentation

### Guides pour les développeurs

- Comment écrire des tests
- Patterns de test recommandés
- Debugging des tests

### Rapports de test

- Rapports quotidiens
- Tendances de qualité
- Alertes sur les régressions

---

**Dernière mise à jour** : [Date]
**Responsable** : Équipe de développement
**Révision** : À chaque sprint
