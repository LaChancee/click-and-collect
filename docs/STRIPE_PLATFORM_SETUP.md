# Configuration du Profil de Plateforme Stripe Connect

## 🚨 Erreur Courante

Si vous obtenez cette erreur lors de la création d'un compte Stripe Connect :

```
Please review the responsibilities of managing losses for connected accounts at
https://dashboard.stripe.com/settings/connect/platform-profile
```

Cela signifie que votre profil de plateforme Stripe Connect n'est pas encore configuré.

## 📋 Étapes de Configuration

### 1. Accéder au Dashboard Stripe

1. Connectez-vous à votre compte Stripe : https://dashboard.stripe.com
2. Assurez-vous d'être en **mode Test** pour le développement

### 2. Naviguer vers les Paramètres Connect

1. Dans le menu de gauche, cliquez sur **"Paramètres"** (Settings)
2. Dans la section Paramètres, cliquez sur **"Connect"**
3. Sélectionnez **"Profil de plateforme"** (Platform Profile)

### 3. Remplir le Profil de Plateforme

#### Informations de base

- **Nom de la plateforme** : `Click & Collect - Boulangeries`
- **Description** : `Plateforme de commande en ligne pour boulangeries avec retrait en magasin`
- **URL du site web** : `https://votre-domaine.com` (ou `http://localhost:3000` pour le dev)

#### Modèle économique

- **Type de plateforme** : Sélectionnez `Marketplace`
- **Secteur d'activité** : `Food & Beverage` ou `Retail`
- **Pays principal** : `France`

#### Responsabilités des pertes

**⚠️ IMPORTANT** : Cette section détermine qui est responsable des chargebacks et disputes.

**Option recommandée pour débuter** :

- Sélectionnez : **"La plateforme assume la responsabilité des pertes"**
- Cela signifie que votre compte principal sera débité en cas de chargeback

**Alternative** (plus complexe) :

- **"Les comptes connectés assument la responsabilité"**
- Nécessite une configuration plus avancée

### 4. Configuration des Frais

#### Frais de plateforme

- **Commission** : `3%` (ou le pourcentage de votre choix)
- **Frais fixes** : `0€` (optionnel)

#### Méthode de prélèvement

- **Automatique** : Recommandé pour simplifier la gestion
- **Manuel** : Si vous préférez contrôler chaque prélèvement

### 5. Paramètres Avancés

#### Onboarding

- **Type d'onboarding** : `Hosted by Stripe` (recommandé)
- **Champs requis** : Laissez les paramètres par défaut

#### Dashboard

- **Accès au dashboard** : `Express Dashboard` (recommandé pour débuter)

## ✅ Vérification de la Configuration

Une fois la configuration terminée :

1. **Statut** : Vérifiez que le profil affiche "Activé" ✅
2. **Aucun avertissement** : Assurez-vous qu'aucune alerte rouge n'apparaît
3. **Test** : Retournez sur votre application et testez la création d'un compte Connect

## 🧪 Test de la Configuration

Après avoir configuré le profil :

1. Allez sur votre application : `/orgs/[orgSlug]/settings`
2. Cliquez sur l'onglet **"Paiements"**
3. Cliquez sur **"Se connecter avec Stripe"**
4. Vous devriez être redirigé vers l'onboarding Stripe (au lieu d'avoir l'erreur)

## 🔧 Mode Test vs Production

### Mode Test (Développement)

- Utilisez des clés de test : `sk_test_...` et `pk_test_...`
- Les paiements ne sont pas réels
- Parfait pour tester l'intégration

### Mode Production (Live)

- Nécessite une validation complète du profil de plateforme
- Stripe peut demander des documents supplémentaires
- Les paiements sont réels

## 📞 Support

Si vous rencontrez des difficultés :

1. **Documentation Stripe** : https://docs.stripe.com/connect
2. **Support Stripe** : https://support.stripe.com
3. **Vérifiez les logs** : Dans votre console de développement

## 🎯 Résultat Attendu

Une fois configuré correctement :

- ✅ Les boulangeries peuvent créer leur compte Stripe Connect
- ✅ Les paiements sont traités directement sur leur compte
- ✅ Votre commission de 3% est automatiquement prélevée
- ✅ Chaque boulangerie a accès à son dashboard financier

---

**Note** : Cette configuration n'est à faire qu'une seule fois par compte Stripe principal.
