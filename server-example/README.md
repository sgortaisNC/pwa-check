# Serveur Backend pour Notifications Push iOS

Ce dossier contient un exemple de serveur backend pour gérer les notifications push, notamment pour iOS avec APNs.

## Installation

```bash
cd server-example
npm install express @apns/apns2 jsonwebtoken web-push
```

## Configuration

1. Créez un fichier `.env` :

```env
APNS_KEY_ID=votre_key_id
APNS_TEAM_ID=votre_team_id
APNS_BUNDLE_ID=com.votredomaine.pwa-check
APNS_KEY_PATH=./AuthKey.p8
APNS_PRODUCTION=false
VAPID_PUBLIC_KEY=votre_cle_publique_vapid
VAPID_PRIVATE_KEY=votre_cle_privee_vapid
PORT=3000
```

2. Placez votre fichier `AuthKey.p8` dans ce dossier

3. Générez les clés VAPID (pour Web Push standard) :

```bash
npx web-push generate-vapid-keys
```

## Démarrage

```bash
node server.js
```

## Endpoints

### POST /api/push/subscribe
Enregistre un abonnement push

**Body:**
```json
{
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userAgent": "..."
}
```

### POST /api/push/send
Envoie une notification

**Body:**
```json
{
  "title": "Titre",
  "body": "Message",
  "subscriptionId": "...",
  "data": {}
}
```

## Déploiement

Pour déployer ce serveur, vous pouvez utiliser :
- **Vercel** (fonctions serverless)
- **Railway**
- **Render**
- **Heroku**
- Votre propre serveur Node.js

## Note importante

Ceci est un exemple basique. En production, vous devriez :
- Utiliser une base de données pour stocker les abonnements
- Ajouter l'authentification
- Gérer les erreurs de manière plus robuste
- Implémenter la gestion des abonnements expirés

