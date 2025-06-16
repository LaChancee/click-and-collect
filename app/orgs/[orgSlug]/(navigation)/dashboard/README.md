# Dashboard de la Boulangerie

Ce dashboard moderne utilise les composants [Shadcn/UI](https://ui.shadcn.com/) pour afficher les données en temps réel de votre boulangerie.

## 🎯 Fonctionnalités

### 📊 Cartes de Statistiques

- **Chiffre d'affaires** : Total et journalier
- **Commandes** : Nombre total et nouvelles du jour
- **Commandes en attente** : Avec alertes si > 5
- **Produits actifs** : Nombre de produits disponibles

### 📈 Graphiques

- **Graphique des ventes** : Évolution sur 7 jours (Area Chart)
- **Statut des commandes** : Répartition par statut (Pie Chart)

### 📋 Données en Temps Réel

- **Commandes récentes** : Les 5 dernières avec détails
- **Produits populaires** : Top 5 des plus vendus
- **Créneaux horaires** : Aperçu d'aujourd'hui avec taux d'occupation

## 🎨 Design

Le dashboard utilise :

- **Shadcn/UI** pour les composants
- **Recharts** pour les graphiques
- **Tailwind CSS** pour le styling
- **Lucide Icons** pour les icônes

## 🔧 Composants

```
dashboard/
├── _components/
│   ├── bakery-stats-cards.tsx      # Cartes de statistiques
│   ├── sales-chart.tsx             # Graphique des ventes
│   ├── orders-status-chart.tsx     # Graphique statut commandes
│   ├── recent-orders-card.tsx      # Commandes récentes
│   ├── popular-products-card.tsx   # Produits populaires
│   └── time-slots-overview.tsx     # Aperçu créneaux
└── README.md
```

## 📱 Responsive

Le dashboard est entièrement responsive :

- **Mobile** : Cartes empilées verticalement
- **Tablet** : Grille 2 colonnes
- **Desktop** : Grille 3-4 colonnes

## 🚀 Performance

- Requêtes Prisma optimisées
- Composants Server Components pour les données
- Client Components uniquement pour l'interactivité
- Chargement progressif des graphiques

## 🔄 Données en Temps Réel

Les données sont récupérées directement depuis la base de données :

- Commandes filtrées par boulangerie
- Calculs d'agrégation optimisés
- Mise à jour automatique au rechargement
