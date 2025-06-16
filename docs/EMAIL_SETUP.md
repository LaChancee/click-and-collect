# Configuration Email avec Resend

Ce document explique comment configurer le service d'email avec Resend pour le système Click & Collect.

## Configuration requise

### 1. Variables d'environnement

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Resend Email Service
RESEND_API_KEY="re_your_resend_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### 2. Obtenir une clé API Resend

1. Créez un compte sur [Resend.com](https://resend.com)
2. Allez dans la section "API Keys"
3. Créez une nouvelle clé API
4. Copiez la clé et ajoutez-la à votre `.env.local`

### 3. Configurer le domaine d'envoi

1. Dans Resend, allez dans "Domains"
2. Ajoutez votre domaine (ex: `yourdomain.com`)
3. Configurez les enregistrements DNS selon les instructions
4. Utilisez une adresse email de ce domaine dans `RESEND_FROM_EMAIL`

## Fonctionnalités

### Email de confirmation automatique

Lorsqu'une commande est créée via le checkout, un email de confirmation est automatiquement envoyé au client avec :

- Détails de la commande (articles, quantités, prix)
- Informations de retrait (date, heure, lieu)
- Mode de paiement
- Notes spéciales

### Email de mise à jour de statut

Les boulangers peuvent envoyer des emails lors des changements de statut :

- Commande confirmée
- Commande en préparation
- Commande prête
- Commande terminée

## Templates d'email

Les emails utilisent des templates React avec `@react-email/components` pour :

- Design responsive
- Compatibilité multi-clients email
- Personnalisation facile
- Prévisualisation en développement

## Développement

Pour prévisualiser les emails en développement :

```bash
npm run email
```

Cela lance l'interface de prévisualisation React Email sur `http://localhost:3000`.

## Production

En production, assurez-vous que :

1. Votre domaine est vérifié dans Resend
2. Les enregistrements DNS sont correctement configurés
3. La clé API de production est utilisée
4. L'adresse `RESEND_FROM_EMAIL` utilise votre domaine vérifié

## Dépannage

### Email non reçu

1. Vérifiez les logs de l'application
2. Consultez les logs Resend dans votre dashboard
3. Vérifiez que l'adresse email du destinataire est valide
4. Vérifiez les dossiers spam/indésirables

### Erreur d'authentification

1. Vérifiez que `RESEND_API_KEY` est correcte
2. Assurez-vous que la clé n'a pas expiré
3. Vérifiez les permissions de la clé API

### Domaine non vérifié

1. Vérifiez la configuration DNS
2. Attendez la propagation DNS (jusqu'à 48h)
3. Utilisez l'adresse de test Resend en développement

## Support

- [Documentation Resend](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Guide Next.js + Resend](https://resend.com/docs/send-with-nextjs)
