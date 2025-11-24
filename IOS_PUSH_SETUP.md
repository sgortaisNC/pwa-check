# Guide de configuration des notifications push pour iOS

Ce guide vous explique comment configurer les notifications push web pour iOS avec Apple Push Notification Service (APNs).

## Prérequis

- **iOS 16.4+** : Le support Web Push nécessite iOS 16.4 ou supérieur
- **Compte développeur Apple** : Nécessaire pour générer les certificats APNs
- **Serveur backend** : Pour communiquer avec APNs
- **HTTPS** : Obligatoire pour les notifications push (déjà configuré sur Vercel)

## Étape 1 : Créer un certificat APNs dans Apple Developer

### 1.1 Accéder à Apple Developer

1. Allez sur [developer.apple.com](https://developer.apple.com)
2. Connectez-vous avec votre compte développeur
3. Allez dans **Certificates, Identifiers & Profiles**

### 1.2 Créer une App ID

1. Cliquez sur **Identifiers** → **+** (nouveau)
2. Sélectionnez **App IDs** → **Continue**
3. Choisissez **App** → **Continue**
4. Renseignez :
   - **Description** : Test PWA (ou votre nom)
   - **Bundle ID** : `com.votredomaine.pwa-check` (doit être unique)
5. Cochez **Push Notifications** dans les Capabilities
6. Cliquez sur **Continue** → **Register**

### 1.3 Générer une clé APNs

1. Allez dans **Keys** → **+** (nouveau)
2. Renseignez :
   - **Key Name** : Web Push Key
   - Cochez **Apple Push Notifications service (APNs)**
3. Cliquez sur **Continue** → **Register**
4. **IMPORTANT** : Téléchargez la clé `.p8` (vous ne pourrez la télécharger qu'une seule fois !)
5. Notez le **Key ID** affiché

## Étape 2 : Configurer le manifest PWA pour iOS

Le manifest doit inclure les informations nécessaires pour iOS Web Push.

### Configuration dans vite.config.ts

```typescript
manifest: {
  // ... configuration existante
  // Pour iOS Web Push, ajoutez :
  web_accessible_resources: ['manifest.json'],
  // Les icônes doivent être présentes
  icons: [
    {
      src: 'pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    }
  ]
}
```

## Étape 3 : Créer un serveur backend pour APNs

Vous avez besoin d'un serveur backend qui :
1. Reçoit les abonnements push des clients
2. Stocke les tokens d'abonnement
3. Envoie les notifications via APNs

### Option A : Utiliser un service tiers (recommandé pour commencer)

Services recommandés :
- **OneSignal** : [onesignal.com](https://onesignal.com) - Gratuit jusqu'à 10k utilisateurs
- **Firebase Cloud Messaging** : Supporte iOS via APNs
- **Pusher Beams** : [pusher.com/beams](https://pusher.com/beams)

### Option B : Créer votre propre serveur

Voir le fichier `server-example/` pour un exemple de serveur Node.js.

## Étape 4 : Configuration du service worker

Le service worker doit gérer les abonnements push et recevoir les notifications.

Voir `src/sw.js` pour la configuration complète.

## Étape 5 : Tester sur iOS

### 5.1 Prérequis de test

- iPhone avec iOS 16.4+
- Safari (les autres navigateurs iOS ne supportent pas encore Web Push)
- Application installée comme PWA (ajoutée à l'écran d'accueil)

### 5.2 Processus de test

1. Installez la PWA sur votre iPhone
2. Ouvrez la PWA depuis l'écran d'accueil (pas depuis Safari)
3. Autorisez les notifications quand demandé
4. Testez l'envoi d'une notification

## Étape 6 : Variables d'environnement

Configurez ces variables dans votre serveur backend :

```env
APNS_KEY_ID=votre_key_id
APNS_TEAM_ID=votre_team_id
APNS_KEY_PATH=/chemin/vers/votre/key.p8
APNS_BUNDLE_ID=com.votredomaine.pwa-check
APNS_PRODUCTION=false  # true pour production
```

## Ressources

- [Apple Developer - Web Push Notifications](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns)
- [MDN - Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web.dev - Web Push Notifications](https://web.dev/push-notifications-overview/)

## Notes importantes

⚠️ **Limitations iOS** :
- Web Push nécessite iOS 16.4+
- Fonctionne uniquement dans Safari
- L'application doit être installée comme PWA
- Les notifications ne fonctionnent pas dans Safari normal, seulement dans la PWA installée

✅ **Avantages** :
- Pas besoin d'app native
- Fonctionne avec votre PWA existante
- Support cross-platform (iOS + Android + Desktop)

