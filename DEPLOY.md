# Guide de déploiement sur Vercel

Ce guide vous explique comment déployer votre application PWA SvelteKit sur Vercel.

## Prérequis

- Un compte Vercel (gratuit) : [vercel.com](https://vercel.com)
- Git installé sur votre machine
- Le projet configuré avec l'adapter Vercel

## Méthode 1 : Déploiement via l'interface Vercel (Recommandé)

### Étape 1 : Préparer votre projet

1. Assurez-vous que tous vos changements sont commités :
```bash
git add .
git commit -m "Configuration pour Vercel"
```

2. Poussez votre code sur GitHub, GitLab ou Bitbucket :
```bash
git push origin main
```

### Étape 2 : Connecter votre projet à Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **"Add New..."** puis **"Project"**
3. Importez votre dépôt Git (GitHub, GitLab ou Bitbucket)
4. Vercel détectera automatiquement SvelteKit

### Étape 3 : Configurer le projet

Vercel devrait détecter automatiquement :
- **Framework Preset** : SvelteKit
- **Build Command** : `pnpm build` (ou `npm run build`)
- **Output Directory** : `.svelte-kit/output`
- **Install Command** : `pnpm install` (ou `npm install`)

### Étape 4 : Déployer

1. Cliquez sur **"Deploy"**
2. Attendez que le build se termine (environ 1-2 minutes)
3. Votre application sera disponible sur une URL Vercel (ex: `https://test-ju.vercel.app`)

## Méthode 2 : Déploiement via CLI Vercel

### Étape 1 : Installer Vercel CLI

```bash
pnpm add -g vercel
# ou
npm install -g vercel
```

### Étape 2 : Se connecter à Vercel

```bash
vercel login
```

### Étape 3 : Déployer

Depuis la racine de votre projet :

```bash
vercel
```

Pour un déploiement en production :

```bash
vercel --prod
```

## Vérification après déploiement

Une fois déployé, vérifiez que :

1. ✅ L'application se charge correctement
2. ✅ Le service worker est enregistré (onglet Application > Service Workers dans Chrome DevTools)
3. ✅ Le manifest.json est accessible (ex: `https://votre-app.vercel.app/manifest.webmanifest`)
4. ✅ Les notifications fonctionnent (HTTPS est automatique sur Vercel)
5. ✅ L'application peut être installée comme PWA

## Configuration HTTPS

Vercel fournit automatiquement HTTPS pour tous les déploiements. Les notifications push fonctionneront donc parfaitement !

## Mises à jour automatiques

Si vous avez connecté votre dépôt Git à Vercel, chaque push sur la branche principale déclenchera automatiquement un nouveau déploiement.

## Variables d'environnement

Si vous avez besoin de variables d'environnement :

1. Allez dans votre projet sur Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez vos variables
4. Redéployez

## Support

- Documentation Vercel : [vercel.com/docs](https://vercel.com/docs)
- Documentation SvelteKit : [kit.svelte.dev](https://kit.svelte.dev)
- Documentation PWA : [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps)

