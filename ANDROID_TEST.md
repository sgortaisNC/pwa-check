# Guide de test sur Android

Ce guide vous explique comment tester les notifications push sur Android.

## Prérequis

- **Android 5.0+** (Lollipop) : Support des notifications web
- **Chrome** ou **Firefox** : Navigateurs recommandés
- **HTTPS** : Les notifications nécessitent HTTPS (déjà configuré sur Vercel)

## Test sur Android

### Étape 1 : Accéder à l'application

1. Ouvrez Chrome ou Firefox sur votre appareil Android
2. Allez sur : `https://pwa-check-tau.vercel.app/`
3. L'application devrait se charger avec le design sombre

### Étape 2 : Installer la PWA

1. Chrome affichera une bannière "Ajouter à l'écran d'accueil"
2. Ou allez dans le menu (⋮) → **"Ajouter à l'écran d'accueil"**
3. Confirmez l'installation

### Étape 3 : Tester les notifications

1. Ouvrez la PWA depuis l'écran d'accueil
2. Cliquez sur **"🔔 Demander les permissions"**
3. Autorisez les notifications quand Android le demande
4. Cliquez sur **"📨 Tester une notification"**
5. Vous devriez recevoir une notification système

## Fonctionnalités Android

✅ **Notifications système** : Fonctionnent parfaitement  
✅ **Installation PWA** : Support complet  
✅ **Service Worker** : Fonctionne hors ligne  
✅ **Icônes** : Affichage correct dans le launcher  

## Dépannage

### Les notifications ne fonctionnent pas

1. **Vérifiez les permissions** :
   - Paramètres Android → Apps → Votre PWA → Notifications
   - Assurez-vous que les notifications sont activées

2. **Vérifiez HTTPS** :
   - L'URL doit commencer par `https://`
   - Vercel fournit HTTPS automatiquement

3. **Videz le cache** :
   - Paramètres → Apps → Chrome → Stockage → Vider le cache
   - Rechargez la PWA

### La PWA ne s'installe pas

1. Vérifiez que vous êtes sur HTTPS
2. Vérifiez que le manifest.json est accessible
3. Essayez en navigation privée pour éviter les problèmes de cache

## Test avec Chrome DevTools (optionnel)

Pour déboguer sur Android depuis votre ordinateur :

1. Connectez votre téléphone en USB
2. Activez le débogage USB dans les options développeur Android
3. Sur votre ordinateur, ouvrez Chrome → `chrome://inspect`
4. Inspectez votre appareil et la PWA

## Résultat attendu

Sur Android, vous devriez voir :
- ✅ Le titre "🚀 Test PWA"
- ✅ Le bouton "🔔 Demander les permissions" (si pas encore autorisé)
- ✅ Le bouton "📨 Tester une notification" (si autorisé)
- ✅ Les notifications système fonctionnent parfaitement

