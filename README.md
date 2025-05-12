Welcome to [NOW.TS](https://nowts.app) directory.

## Setup the project

Please follow the [NOW.TS Course](https://codeline.app/courses/clqn8pmte0001lr54itcjzl59/lessons/clqn8pz990003112iia11p7uo) to setup the project.

## Contributions

Feel free to create a pull request with any changes you think valuable.

# Architecture du système Click&Collect - Les délices d'Erwann

Ce document présente l'architecture complète du système de Click&Collect pour la boulangerie "Les délices d'Erwann".

## Architecture technique

Le projet est construit avec les technologies suivantes :

- **Framework** : Next.js 15 (React 19)
- **Langage** : TypeScript
- **Base de données** : PostgreSQL avec Prisma ORM
- **UI** : TailwindCSS et Shadcn UI
- **Authentification** : NextAuth.js (Better-Auth)
- **Paiement** : Stripe
- **Email** : Resend

## Modèle de données

L'architecture de données est organisée autour des entités suivantes :

### Utilisateurs et authentification

- **User** : Modèle Better-Auth pour l'authentification générale
- **Organization** : Modèle multi-usage représentant à la fois les boulangeries et les clients
  - Différenciation par les attributs `isBakery` et `isCustomer`
  - Système de membres associant les utilisateurs à leurs organisations/profils client

### Catalogue de produits

- **Category** : Catégories de produits (pains, viennoiseries, pâtisseries, etc.)
- **Product** : Produits disponibles avec prix, description, etc.
- **Allergen** et **ProductAllergen** : Gestion des allergènes pour chaque produit
- **FavoriteItem** : Produits favoris des clients (Organization de type client)

### Gestion des commandes

- **TimeSlot** : Créneaux horaires disponibles pour le retrait des commandes
- **Order** : Commandes complètes avec statut et informations de paiement
- **OrderItem** : Produits individuels dans une commande
- **Settings** : Configuration du système (horaires, seuils de paiement, etc.)

### Retours client

- **Feedback** : Avis et commentaires des clients

## Architecture applicative

L'application est divisée en plusieurs modules fonctionnels :

### Interface client

1. **Authentification** - Inscription, connexion, gestion de compte
2. **Catalogue** - Affichage et filtrage des produits par catégorie
3. **Panier** - Gestion des articles et quantités
4. **Réservation** - Sélection des créneaux horaires disponibles
5. **Paiement** - Intégration Stripe pour les commandes au-dessus du seuil
6. **Historique** - Suivi des commandes passées et actuelles
7. **Notifications** - Emails de confirmation et rappels

### Interface administration

1. **Gestion du catalogue** - CRUD pour les produits et catégories
2. **Suivi des commandes** - Tableau de bord par créneau horaire
3. **Gestion des stocks** - Suivi des disponibilités avec alertes
4. **Rapports** - Statistiques de ventes et produits populaires
5. **Configuration** - Paramétrage des créneaux et règles métier

## Flux principal

1. Le client s'authentifie (via Better-Auth avec son profil Organization)
2. Il navigue dans le catalogue et ajoute des produits au panier
3. Il sélectionne un créneau horaire pour le retrait
4. Si le montant dépasse le seuil configuré, il procède au paiement en ligne
5. Il reçoit une confirmation par email avec QR code
6. Le staff reçoit la commande sur le tableau de bord
7. Le staff prépare la commande pour le créneau spécifié
8. Le client retire sa commande en magasin
9. Le statut de la commande est mis à jour à chaque étape

## Multi-tenant et points de vente

Le système est conçu avec une architecture multi-tenant où :

- Chaque boulangerie est une Organization (avec `isBakery = true`)
- Chaque client est également une Organization (avec `isCustomer = true`)
- Les produits, catégories et créneaux sont liés à une boulangerie spécifique
- Un même utilisateur (User) peut être associé à plusieurs entités Organization

## Sécurité et performances

- Authentification sécurisée avec NextAuth.js et Better-Auth
- Validation des données avec Zod
- Optimisation des requêtes avec Prisma
- Gestion des états côté client avec React Query et useMutation
- Stockage des images sur un CDN externe

## Extensibilité

L'architecture est conçue pour permettre :

- L'ajout de nouvelles méthodes de paiement
- La gestion de promotions et cartes de fidélité
- L'intégration avec des systèmes de caisse existants
- L'extension à plusieurs points de vente (boulangeries)
