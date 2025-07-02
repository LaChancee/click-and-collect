# Guide d'utilisation - Click & Collect pour Boulangeries

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Première connexion](#première-connexion)
3. [Dashboard - Vue d'ensemble](#dashboard---vue-densemble)
4. [Gestion des produits](#gestion-des-produits)
5. [Gestion des catégories](#gestion-des-catégories)
6. [Configuration des créneaux horaires](#configuration-des-créneaux-horaires)
7. [Gestion des commandes](#gestion-des-commandes)
8. [Configuration des paiements Stripe](#configuration-des-paiements-stripe)
9. [Paramètres de la boulangerie](#paramètres-de-la-boulangerie)
10. [FAQ et résolution de problèmes](#faq-et-résolution-de-problèmes)

---

## Introduction

Bienvenue dans votre système Click & Collect ! Cette application vous permet de :

- ✅ **Gérer vos produits** : Ajouter, modifier, supprimer vos articles
- ✅ **Organiser vos ventes** : Créer des catégories pour vos produits
- ✅ **Planifier les retraits** : Définir des créneaux horaires pour les clients
- ✅ **Suivre vos commandes** : Voir toutes les commandes en temps réel
- ✅ **Recevoir les paiements** : Configuration Stripe pour les paiements en ligne
- ✅ **Analyser vos ventes** : Statistiques et tableaux de bord

> **Note importante** : Cette application fonctionne sur tablette, ordinateur ou smartphone. Nous recommandons l'utilisation d'une tablette en magasin pour une meilleure expérience.

<!-- ESPACE POUR IMAGE : Capture d'écran de l'accueil de l'application -->

---

## Première connexion

### Étape 1 : Création de votre compte

1. **Rendez-vous sur la page d'inscription** : `https://votre-domaine.com/auth/signup`
2. **Remplissez vos informations** :
   - Nom de votre boulangerie
   - Votre adresse email
   - Créez un mot de passe sécurisé
3. **Validez votre email** en cliquant sur le lien reçu
4. **Connectez-vous** avec vos identifiants

<!-- ESPACE POUR IMAGE : Page d'inscription -->

### Étape 2 : Configuration initiale

Lors de votre première connexion, le système vous proposera de :

- Créer des catégories de base (Pain, Viennoiseries, Pâtisseries, etc.)
- Ajouter vos premiers produits
- Configurer vos horaires d'ouverture

<!-- ESPACE POUR IMAGE : Assistant de configuration initiale -->

---

## Dashboard - Vue d'ensemble

### Accès au dashboard

Une fois connecté, vous arrivez automatiquement sur votre **dashboard principal** :
`https://votre-domaine.com/orgs/votre-boulangerie`

<!-- ESPACE POUR IMAGE : Dashboard principal avec les 4 cartes de statistiques -->

### Cartes de statistiques

Le dashboard affiche 4 indicateurs clés :

1. **💰 Chiffre d'affaires total**

   - Montant total de vos ventes
   - Evolution du jour

2. **📦 Commandes totales**

   - Nombre total de commandes
   - Nouvelles commandes du jour

3. **⏰ Commandes en attente**

   - Commandes à préparer
   - Alerte si plus de 5 commandes en attente

4. **📋 Produits actifs**
   - Nombre de produits disponibles
   - Nombre de créneaux aujourd'hui

<!-- ESPACE POUR IMAGE : Détail des cartes de statistiques -->

### Sections du dashboard

#### 📊 Graphique des ventes (7 derniers jours)

Visualisez l'évolution de vos ventes sur la semaine écoulée.

<!-- ESPACE POUR IMAGE : Graphique des ventes -->

#### 📋 Commandes récentes

Liste des 5 dernières commandes avec :

- Nom du client
- Montant
- Statut
- Créneau de retrait

<!-- ESPACE POUR IMAGE : Section commandes récentes -->

#### ⏰ Aperçu des créneaux d'aujourd'hui

Vue d'ensemble des créneaux avec leur taux d'occupation.

<!-- ESPACE POUR IMAGE : Aperçu des créneaux -->

---

## Gestion des produits

### Accès à la gestion des produits

**Menu** : `Articles`  
**URL** : `/orgs/votre-boulangerie/articles`

<!-- ESPACE POUR IMAGE : Page de gestion des articles -->

### Vue d'ensemble des produits

La page principale présente :

- **Onglets par catégorie** : Organisez vos produits par type ( Par ailleurs vous pouvez, **la première fois**, créer les catégories de base c'est-à-dire: Pains, Boissons, Patisseries, Sandwich, Boissons )
- **Tableau de gestion** : Liste de tous vos produits
- **Boutons d'action** : Ajouter, modifier, supprimer

<!-- ESPACE POUR IMAGE : Interface avec onglets par catégorie -->

### Ajouter un nouveau produit

#### 1. Cliquer sur "Ajouter un produit"

Le bouton se trouve en haut à droite de la page des articles.

<!-- ESPACE POUR IMAGE : Bouton "Ajouter un produit" -->

#### 2. Remplir le formulaire

**Informations obligatoires :**

- **📝 Nom du produit** : Ex: "Croissant au beurre"
- **💰 Prix** : En euros (ex: 1.50)
- **📂 Catégorie** : Sélectionnez dans la liste

**Informations optionnelles :**

- **📄 Description** : Détails sur le produit
- **📷 Image** : Photo de votre produit
- **📦 Stock** : Quantité disponible (optionnel)
- **🚨 Allergènes** : Indiquez les allergènes présents

<!-- ESPACE POUR IMAGE : Formulaire de création de produit -->

#### 3. Options de disponibilité

- **✅ Actif** : Le produit apparaît dans votre catalogue
- **✅ Disponible** : Le produit peut être commandé
- **📍 Position** : Ordre d'affichage dans la catégorie

#### 4. Upload d'image

Pour ajouter une photo :

1. Cliquez sur "Choisir un fichier"
2. Sélectionnez votre image (formats : JPG, PNG)
3. L'image sera automatiquement redimensionnée

**💡 Conseil** : Utilisez des photos appetissantes de vos produits pour augmenter les ventes !

<!-- ESPACE POUR IMAGE : Interface d'upload d'image -->

### Modifier un produit existant

1. **Cliquez sur l'icône "..." > Voir** dans le tableau
2. **Modifiez les informations** nécessaires
3. **Sauvegardez** les changements

### Gérer la disponibilité

Pour retirer temporairement un produit de la vente :

- **Décochez "Disponible"** : Le produit reste visible mais non commandable
- **Décochez "Actif"** : Le produit disparaît complètement du catalogue

<!-- ESPACE POUR IMAGE : Options de disponibilité -->

---

## Gestion des catégories

### Pourquoi créer des catégories ?

Les catégories permettent de :

- **Organiser** votre catalogue
- **Faciliter** la navigation pour vos clients
- **Grouper** vos produits par type

### Créer une nouvelle catégorie

1. **Aller dans** : `Articles`
2. **Cliquer sur** : "Ajouter une catégorie"
3. **Remplir le formulaire** :
   - **Nom** : Ex: "Pains spéciaux"
   - **Description** : Courte description
   - **Position** : Ordre d'affichage

<!-- ESPACE POUR IMAGE : Formulaire de création de catégorie -->

### Catégories recommandées

Voici des catégories courantes pour une boulangerie :

- 🍞 **Pains** : Baguette, pain de campagne, pain complet...
- 🥐 **Viennoiseries** : Croissant, pain au chocolat, brioche...
- 🎂 **Pâtisseries** : Éclairs, tartes, gâteaux...
- 🍰 **Desserts individuels** : Macarons, petits fours...
- 🥪 **Sandwichs** : Si vous en proposez
- ☕ **Boissons** : Café, thé, jus...

### Bouton "Créer les catégories de base"

Pour vous faire gagner du temps, un bouton permet de créer automatiquement les catégories essentielles d'une boulangerie.

<!-- ESPACE POUR IMAGE : Bouton "Créer les catégories de base" -->

---

## Configuration des créneaux horaires

### Pourquoi des créneaux horaires ?

Les créneaux permettent de :

- **Étaler** les retraits dans la journée
- **Éviter** les files d'attente
- **Organiser** votre production
- **Limiter** le nombre de clients par période

### Accès à la gestion des créneaux

**Menu** : `Organisation > Créneaux horaires`  
**URL** : `/orgs/votre-boulangerie/time-slots`

<!-- ESPACE POUR IMAGE : Page de gestion des créneaux -->

### Paramètres des créneaux

#### Configuration de base

1. **⏰ Heures d'ouverture** : Heure d'ouverture de votre magasin
2. **⏰ Heures de fermeture** : Heure de fermeture
3. **⏱️ Durée des créneaux** : Durée de chaque créneau (15, 30, 60 minutes)
4. **👥 Nombre max de commandes** : Par créneau
5. **📅 Jours à l'avance** : Combien de jours les clients peuvent réserver

<!-- ESPACE POUR IMAGE : Formulaire de paramètres des créneaux -->

#### Exemple de configuration

**Boulangerie ouverte de 7h à 19h :**

- **Créneaux de 15 minutes** : 7h00-7h15, 7h15-7h30, etc.
- **Maximum 3 commandes** par créneau
- **Réservation 3 jours** à l'avance

### Générer les créneaux

#### Génération automatique

1. **Cliquez sur** "Générer des créneaux"
2. **Sélectionnez la période** : Journée, semaine, mois
3. **Confirmez** la génération

<!-- ESPACE POUR IMAGE : Interface de génération de créneaux -->

#### Génération manuelle

Pour des cas particuliers :

- **Horaires spéciaux** (jours fériés)
- **Évènements particuliers**
- **Créneaux supplémentaires**

### Gérer les créneaux existants

#### Vue calendrier

La vue calendrier vous permet de :

- **Voir** tous vos créneaux en un coup d'œil
- **Identifier** les créneaux pleins/libres
- **Modifier** individuellement chaque créneau

<!-- ESPACE POUR IMAGE : Vue calendrier des créneaux -->

#### Actions possibles

- **✏️ Modifier** : Changer les paramètres d'un créneau
- **❌ Supprimer** : Annuler un créneau
- **⏸️ Désactiver** : Rendre indisponible temporairement

---

## Gestion des commandes

### Accès aux commandes

**Menu** : `Commandes`  
**URL** : `/orgs/votre-boulangerie/orders`

<!-- ESPACE POUR IMAGE : Page de gestion des commandes -->

### Vue d'ensemble des commandes

#### Statistiques en haut de page

- **📦 Total commandes** : Nombre total depuis l'ouverture
- **⏰ En attente** : Commandes à traiter
- **👨‍🍳 En préparation** : Commandes en cours
- **✅ Terminées** : Commandes récupérées

<!-- ESPACE POUR IMAGE : Cartes de statistiques des commandes -->

#### Liste des commandes

Chaque commande affiche :

- **👤 Nom du client**
- **📞 Téléphone** (si fourni)
- **📧 Email**
- **🕐 Créneau de retrait**
- **💰 Montant total**
- **📋 Statut** : Pending, Confirmed, Preparing, Ready, Completed
- **💳 Mode de paiement** : Carte en ligne ou sur place

<!-- ESPACE POUR IMAGE : Liste détaillée des commandes -->

### Statuts des commandes

#### 🟡 PENDING (En attente)

- Commande reçue mais non confirmée
- **Action** : Confirmer la commande

#### 🔵 CONFIRMED (Confirmée)

- Commande confirmée, production peut commencer
- **Action** : Passer en préparation

#### 🟠 PREPARING (En préparation)

- Commande en cours de préparation
- **Action** : Marquer comme prête

#### 🟢 READY (Prête)

- Commande prête à être récupérée
- **Action** : Marquer comme récupérée

#### ✅ COMPLETED (Terminée)

- Commande récupérée par le client
- **Action** : Aucune

### Gérer une commande

#### Voir le détail d'une commande

Cliquez sur une commande pour voir :

- **Détail des articles** commandés
- **Quantités** de chaque produit
- **Notes** du client (si présentes)
- **Informations de livraison**
- **Historique** des changements de statut

<!-- ESPACE POUR IMAGE : Détail d'une commande -->

#### Changer le statut

1. **Cliquez** sur le menu déroulant "Statut"
2. **Sélectionnez** le nouveau statut
3. Le client recevra **automatiquement** un email de notification

<!-- ESPACE POUR IMAGE : Menu déroulant de changement de statut -->

#### Notifications automatiques

Le système envoie automatiquement des emails :

- **Confirmation** de commande
- **Changement de statut**
- **Rappel** de retrait

### Filtres et recherche

#### Filtrer par statut

Utilisez les onglets pour filtrer :

- **Toutes** les commandes
- **En attente** uniquement
- **À préparer**
- **Prêtes**

#### Rechercher une commande

- **Par nom** de client
- **Par numéro** de commande
- **Par date**

<!-- ESPACE POUR IMAGE : Barre de recherche et filtres -->

---

## Configuration des paiements Stripe

### Pourquoi configurer Stripe ?

Stripe vous permet de :

- **Recevoir** les paiements par carte bancaire en ligne
- **Éviter** les manipulations d'argent liquide
- **Rassurer** vos clients avec un paiement sécurisé
- **Recevoir** l'argent directement sur votre compte bancaire

### Accès à la configuration Stripe

**Menu** : `Paramètres > Paiements`  
**URL** : `/orgs/votre-boulangerie/settings`

<!-- ESPACE POUR IMAGE : Page de configuration Stripe -->

### Étape 1 : Connexion à Stripe

#### Premier accès

Si vous n'avez pas encore configuré Stripe :

1. **Cliquez** sur "Se connecter avec Stripe"
2. Vous serez **redirigé** vers Stripe
3. **Créez** votre compte Stripe (si vous n'en avez pas)
4. **Remplissez** les informations de votre boulangerie

<!-- ESPACE POUR IMAGE : Bouton "Se connecter avec Stripe" -->

#### Informations demandées par Stripe

Stripe aura besoin de :

- **Informations légales** : Nom, adresse de votre entreprise
- **Documents** : SIRET, RIB, pièce d'identité
- **Coordonnées bancaires** : Pour recevoir les paiements

### Étape 2 : Finalisation du compte

#### Processus d'onboarding

Stripe vous guidera pour :

1. **Vérifier** votre identité
2. **Confirmer** vos informations bancaires
3. **Activer** les paiements

**⏰ Délai** : Cette vérification peut prendre 1-3 jours ouvrés.

<!-- ESPACE POUR IMAGE : Interface d'onboarding Stripe -->

#### Statuts possibles

- **🟡 En attente** : Documents en cours de vérification
- **✅ Activé** : Prêt à recevoir des paiements
- **❌ Problème** : Action requise de votre part

### Étape 3 : Vérification du statut

#### Tableau de bord Stripe

Une fois configuré, vous verrez :

- **Statut du compte** : Activé/En attente/Problème
- **Paiements activés** : Oui/Non
- **Virements activés** : Oui/Non

<!-- ESPACE POUR IMAGE : Tableau de bord du statut Stripe -->

#### Bouton "Actualiser le statut"

Si vous avez finalisé votre configuration sur Stripe, cliquez sur ce bouton pour mettre à jour l'affichage.

### Comment ça fonctionne ?

#### Pour vos clients

1. **Commande** sur votre boutique en ligne
2. **Choix** du paiement par carte
3. **Redirection** vers Stripe (sécurisé)
4. **Paiement** avec leur carte bancaire
5. **Retour** sur votre site avec confirmation

#### Pour vous

1. **Réception** automatique de l'argent
2. **Commission** de 3% prélevée automatiquement
3. **Virement** sur votre compte selon la fréquence choisie
4. **Factures** disponibles sur votre tableau de bord Stripe

<!-- ESPACE POUR IMAGE : Schéma du flux de paiement -->

### Gestion des commissions

#### Taux de commission

- **Frais Stripe** : ~1.4% (selon votre contrat Stripe)
- **Total** : ~1.4% par transaction

#### Calcul automatique

La commission est **prélevée automatiquement** sur chaque paiement. Vous recevez le montant net directement.

**Exemple** :

- Commande : 20€
- Frais Stripe (~1.4%) : 0,28€
- **Vous recevez** : 19,72€

### Dépannage Stripe

#### Problèmes fréquents

**🔴 "Paiements non activés"**

- Finalisez votre dossier sur Stripe
- Vérifiez vos documents

**🔴 "Virements bloqués"**

- Confirmez vos coordonnées bancaires
- Contactez le support Stripe

**🔴 "Compte en attente"**

- Patientez 1-3 jours pour la vérification
- Répondez aux éventuelles demandes de Stripe

<!-- ESPACE POUR IMAGE : Messages d'erreur courants -->

---

## Paramètres de la boulangerie

### Accès aux paramètres

**Menu** : `Paramètres`  
**URL** : `/orgs/votre-boulangerie/settings`

### Onglet "Général"

#### Informations de base

- **🏪 Nom de la boulangerie** : Nom affiché aux clients
- **📧 Email de contact** : Pour les notifications
- **🖼️ Logo** : Image de votre boulangerie

<!-- ESPACE POUR IMAGE : Formulaire des informations générales -->

#### Informations détaillées

- **📍 Adresse complète** : Adresse de votre magasin
- **📞 Téléphone** : Numéro de contact
- **🕐 Horaires d'ouverture** : Horaires affichés aux clients
- **📝 Description** : Présentation de votre boulangerie

### Onglet "Paiements"

Voir la section [Configuration des paiements Stripe](#configuration-des-paiements-stripe).

### Onglet "Zone de danger"

#### Actions sensibles

- **🗑️ Supprimer la boulangerie** : Action irréversible
- **⚠️ Réinitialiser les données** : Supprime toutes les commandes

**⚠️ ATTENTION** : Ces actions sont définitives !

<!-- ESPACE POUR IMAGE : Section "Zone de danger" -->

---

## FAQ et résolution de problèmes

### Questions fréquentes

#### 🤔 "Comment mes clients trouvent-ils ma boutique ?"

Vos clients accèdent à votre boutique via :

- **URL directe** : `votre-domaine.com/shop?bakery=votre-nom`
- **QR Code** : Généré automatiquement pour votre boulangerie
- **Recherche** : Si vous êtes référencé sur la plateforme

#### 🤔 "Puis-je modifier une commande après validation ?"

**Non**, les commandes validées ne peuvent pas être modifiées directement. Vous pouvez :

- **Contacter le client** par téléphone/email
- **Annuler la commande** et la refaire
- **Adapter** lors de la préparation si possible

#### 🤔 "Que se passe-t-il si un client ne vient pas récupérer ?"

- La commande reste au statut "READY"
- **Contactez le client** après le créneau prévu
- **Politique recommandée** : Conservation 24h puis facturation

#### 🤔 "Comment gérer les stocks ?"

Deux options :

- **Stock illimité** : Laissez le champ stock vide
- **Stock limité** : Indiquez la quantité, elle diminuera automatiquement

### Problèmes techniques courants

#### 🔴 "Je ne reçois pas les emails de commande"

**Solutions** :

1. Vérifiez vos **spams/indésirables**
2. Confirmez l'**adresse email** dans les paramètres
3. Ajoutez `noreply@votre-domaine.com` à vos contacts

#### 🔴 "Mes images ne s'affichent pas"

**Solutions** :

1. **Format accepté** : JPG, PNG uniquement
2. **Taille maximale** : 5 Mo par image
3. **Connexion internet** : Vérifiez votre connexion

#### 🔴 "Les créneaux ne s'affichent pas"

**Solutions** :

1. Vérifiez que vous avez **généré** des créneaux
2. **Date/heure** : Vérifiez que les créneaux sont futurs
3. **Paramètres** : Vérifiez les heures d'ouverture

#### 🔴 "Problème de paiement Stripe"

**Solutions** :

1. Vérifiez le **statut** de votre compte Stripe
2. **Actualisez** le statut depuis les paramètres
3. **Contactez** le support si le problème persiste

### Contact et support

#### 🆘 Support technique

- **Email** : `support@votre-domaine.com`
- **Téléphone** : `01 23 45 67 89`
- **Heures** : Lundi-Vendredi, 9h-18h

#### 💡 Formation et aide


- **Documentation** : Guide complet en ligne

<!-- ESPACE POUR IMAGE : Informations de contact -->

---

## 🎯 Conseils pour optimiser vos ventes

### 📸 Photos de qualité

- **Éclairage naturel** : Photographiez près d'une fenêtre
- **Fond neutre** : Évitez les éléments qui distraient
- **Angle appétissant** : Mettez en valeur vos produits

### 📝 Descriptions attractives

- **Ingrédients** : Mentionnez les ingrédients de qualité
- **Origine** : "Farine française", "Beurre fermier"
- **Particularités** : "Recette traditionnelle", "Pâte feuilletée maison"

### ⏱️ Gestion des créneaux

- **Créneaux courts** : 15-30 minutes max
- **Répartition** : Évitez la surcharge aux heures de pointe
- **Flexibilité** : Ajustez selon votre capacité de production

### 💰 Stratégie tarifaire

- **Paiement en ligne** : Pour les commandes > 15€
- **Paiement sur place** : Pour les petites commandes
- **Formules** : Créez des offres combinées attractives

---

**📞 Besoin d'aide ? Contactez notre support au 06 42 26 10 66**

---

_Guide mis à jour le 02/07/2025 - Version 1.0_
