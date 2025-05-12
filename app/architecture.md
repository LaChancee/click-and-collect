# Architecture Technique du Projet Click&Collect

Ce document décrit l'organisation des dossiers et l'architecture technique du projet Click&Collect pour "Les délices d'Erwann".

## Structure des dossiers

```
/app
  /api                 # Routes API (Next.js API routes)
  /(auth)              # Routes d'authentification
    /login
    /register
    /reset-password
  /(shop)              # Interface client (publique)
    /page.tsx          # Page d'accueil (catalogue)
    /cart              # Panier d'achat
    /checkout          # Processus de commande
    /account           # Gestion du compte client
    /favorites         # Produits favoris
    /orders            # Historique des commandes
  /(admin)             # Interface d'administration
    /products          # Gestion des produits
    /categories        # Gestion des catégories
    /orders            # Tableau de bord des commandes
    /stats             # Statistiques et rapports
    /settings          # Configuration du système
  /components          # Composants partagés
    /ui                # Composants UI réutilisables
    /forms             # Composants de formulaires
    /layouts           # Layouts réutilisables
    /shop              # Composants spécifiques à l'interface client
    /admin             # Composants spécifiques à l'interface admin
  /hooks               # Custom hooks React
  /lib                 # Utilitaires et fonctions
    /actions           # Server Actions
    /email             # Templates d'emails
    /utils             # Fonctions utilitaires
    /auth              # Configuration auth
    /stripe            # Intégration Stripe
  /types               # Types TypeScript
  /prisma              # Configuration Prisma
  /public              # Fichiers statiques
```

## Détails techniques par section

### API Routes (`/app/api`)

Les routes API sont organisées par domaine fonctionnel :

- `/api/auth/*` - Routes d'authentification (gérées par NextAuth.js)
- `/api/products` - Gestion des produits
- `/api/orders` - Gestion des commandes
- `/api/timeslots` - Gestion des créneaux horaires
- `/api/webhook` - Webhooks Stripe et autres services externes

### Server Actions (`/app/lib/actions`)

Les Server Actions sont organisées par entité :

- `product.action.ts` - Actions pour la gestion des produits
- `order.action.ts` - Actions pour la gestion des commandes
- `timeSlot.action.ts` - Actions pour la gestion des créneaux
- `user.action.ts` - Actions pour la gestion des utilisateurs

### Authentification

L'authentification est gérée par NextAuth.js avec deux approches :

- **Authentification par email/mot de passe** - Pour les clients réguliers
- **Authentification OAuth** - Pour une connexion rapide via Google, Facebook, etc.

Les rôles déterminent l'accès aux différentes sections :

- `CLIENT` - Accès à l'interface client uniquement
- `STAFF` - Accès à certaines parties de l'interface admin (préparation commandes)
- `ADMIN` - Accès complet à l'interface admin

### Interface Client vs. Interface Admin

Les deux interfaces sont séparées dans l'arborescence pour faciliter le développement :

- `/(shop)/*` - Interface client avec design optimisé pour mobile
- `/(admin)/*` - Interface admin avec design optimisé pour tablette/desktop

### État Client

La gestion d'état côté client utilise :

- **React Context** - Pour les états globaux comme le panier d'achat
- **React Query** - Pour la gestion des requêtes et du cache
- **useMutation** - Pour les mutations côté client
- **NUQS** - Pour synchroniser certains états avec l'URL (filtres, pagination)

### Validation des données

Toute validation est effectuée avec Zod :

- Validation côté client avant soumission
- Validation côté serveur dans les Server Actions
- Schémas partagés entre client et serveur

### Gestion des emails

Les emails transactionnels sont envoyés via Resend :

- Confirmation de commande
- Rappel avant le créneau de retrait
- Modifications de commande
- Récupération de mot de passe

### Internationalisation

L'application est prête pour la multi-langue en utilisant :

- Fichiers de traduction JSON par langue
- Composants d'internationalisation pour les textes
- Route de sélection de langue

### Sécurité

Mesures de sécurité implémentées :

- CSRF Protection via Next.js
- Rate limiting sur les routes sensibles
- Validation des entrées avec Zod
- Authentication avec NextAuth.js
- Authorization basée sur les rôles
