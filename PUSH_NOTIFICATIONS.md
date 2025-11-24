# Guide des Notifications Push Serveur

Ce guide explique comment configurer et utiliser le système de notifications push serveur pour envoyer des notifications à tous les utilisateurs abonnés.

## Fonctionnalités

✅ **Notifications locales** : Les utilisateurs peuvent envoyer des notifications à eux-mêmes  
✅ **Notifications push serveur** : L'admin peut envoyer des notifications à tous les utilisateurs abonnés  
✅ **Fonctionne même quand l'app est fermée** : Les notifications push sont reçues même si l'application n'est pas ouverte

## Configuration VAPID

Pour que les notifications push serveur fonctionnent, vous devez générer des clés VAPID (Voluntary Application Server Identification).

### Étape 1 : Générer les clés VAPID

```bash
npx web-push generate-vapid-keys
```

Cela générera deux clés :
- **Public Key** : À utiliser côté client (frontend)
- **Private Key** : À garder secrète côté serveur

### Étape 2 : Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env` (pour le développement) et dans les paramètres Vercel (pour la production) :

```env
VAPID_PUBLIC_KEY=votre_clé_publique_ici
VAPID_PRIVATE_KEY=votre_clé_privée_ici
VAPID_EMAIL=mailto:votre@email.com
```

**Important** : 
- Le `VAPID_EMAIL` doit commencer par `mailto:`
- Ne partagez JAMAIS votre clé privée publiquement
- Utilisez des variables d'environnement pour la production

### Étape 3 : Configuration Vercel

1. Allez sur votre projet Vercel
2. Allez dans **Settings** → **Environment Variables**
3. Ajoutez les trois variables :
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_EMAIL`
4. Redéployez l'application

## Utilisation

### Pour les utilisateurs

1. **Accepter les permissions** : Cliquez sur "🔔 Demander les permissions"
2. **S'abonner aux push** : Une fois les permissions accordées, cliquez sur "📱 S'abonner aux notifications push"
3. **Recevoir les notifications** : Vous recevrez automatiquement les notifications envoyées depuis l'admin, même si l'app est fermée

### Pour l'admin

1. **Accéder à la page admin** : Allez sur `/admin`
2. **Vérifier les abonnements** : Le nombre d'utilisateurs abonnés est affiché
3. **Envoyer une notification** :
   - Saisissez votre message
   - Cliquez sur "📨 Envoyer à X utilisateur(s)"
   - Tous les utilisateurs abonnés recevront la notification

## Architecture

### Routes API

- **`/api/push/vapid-key`** : Retourne la clé publique VAPID pour le frontend
- **`/api/push/subscribe`** : Enregistre un nouvel abonnement push
- **`/api/push/send-all`** : Envoie une notification à tous les abonnés

### Service Worker

Le service worker (`src/service-worker.ts`) gère :
- La réception des événements push
- L'affichage des notifications
- Les clics sur les notifications

### Stockage

⚠️ **Actuellement en mémoire** : Les abonnements sont stockés en mémoire et seront perdus au redémarrage du serveur.

Pour la production, vous devriez utiliser une base de données (PostgreSQL, MongoDB, etc.) pour persister les abonnements.

## Dépannage

### Les notifications push ne fonctionnent pas

1. **Vérifiez les clés VAPID** :
   - Les clés sont-elles configurées dans les variables d'environnement ?
   - La clé publique correspond-elle à la clé privée ?

2. **Vérifiez le service worker** :
   - Le service worker est-il enregistré ?
   - Ouvrez les DevTools → Application → Service Workers

3. **Vérifiez les permissions** :
   - Les notifications sont-elles autorisées dans le navigateur ?
   - Les permissions sont-elles accordées dans les paramètres du système ?

### Erreur "Clés VAPID non configurées"

- Vérifiez que les variables d'environnement sont bien définies
- Redéployez l'application après avoir ajouté les variables

### Les notifications ne sont pas reçues

- Vérifiez que l'utilisateur s'est bien abonné (bouton "S'abonner aux notifications push")
- Vérifiez que le service worker est actif
- Vérifiez les logs du serveur pour voir les erreurs d'envoi

## Limitations

- **iOS Safari** : Les notifications push web nécessitent iOS 16.4+ et une configuration APNs spécifique
- **Stockage en mémoire** : Les abonnements sont perdus au redémarrage (utilisez une base de données en production)
- **HTTPS requis** : Les notifications push nécessitent HTTPS (déjà configuré sur Vercel)

## Prochaines étapes

Pour améliorer le système :

1. **Base de données** : Migrer vers une base de données pour persister les abonnements
2. **Gestion des abonnements** : Permettre aux utilisateurs de se désabonner
3. **Notifications ciblées** : Envoyer des notifications à des groupes spécifiques d'utilisateurs
4. **Historique** : Enregistrer l'historique des notifications envoyées
5. **Analytics** : Suivre les taux d'ouverture et de clic

