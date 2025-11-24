# Configuration Supabase pour les abonnements push

## ✅ Projet Supabase créé

- **Nom du projet** : testPWA
- **Mot de passe** : `BEA9frkQWiSOwiZz`

## 📋 Étapes de configuration

### 1. Récupérer l'URL de connexion Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet `testPWA`
3. Allez dans **Settings** → **Database**
4. Dans la section **Connection string**, copiez l'URI de connexion
   - Format : `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Remplacez `[YOUR-PASSWORD]` par votre mot de passe : `BEA9frkQWiSOwiZz`

### 2. Configurer les variables d'environnement

#### Développement local

Ajoutez dans `.env.local` :

```env
DATABASE_URL="postgresql://postgres:BEA9frkQWiSOwiZz@db.[VOTRE-PROJECT-REF].supabase.co:5432/postgres"
```

Remplacez `[VOTRE-PROJECT-REF]` par la référence de votre projet Supabase (visible dans l'URL de connexion).

#### Production (Vercel)

1. Allez sur votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez :
   - **Variable** : `DATABASE_URL`
   - **Valeur** : L'URL de connexion Supabase complète
   - **Environments** : Production, Preview, Development

### 3. Créer la base de données

Une fois l'URL configurée, exécutez :

```bash
npx prisma migrate dev --name init
```

Cela créera la table `PushSubscription` dans votre base Supabase.

### 4. Vérifier la connexion

Vous pouvez vérifier que tout fonctionne avec Prisma Studio :

```bash
npx prisma studio
```

Cela ouvrira une interface web pour visualiser vos données.

## 🔒 Sécurité

⚠️ **Important** : 
- Ne commitez JAMAIS votre mot de passe dans le code
- Utilisez toujours les variables d'environnement
- Le fichier `.env.local` est déjà dans `.gitignore`

## 📊 Structure de la table

La table `PushSubscription` sera créée avec :
- `id` : Identifiant unique
- `endpoint` : URL unique de l'abonnement
- `p256dh` : Clé publique de l'abonnement
- `auth` : Clé d'authentification
- `userAgent` : Navigateur de l'utilisateur
- `createdAt` : Date de création
- `updatedAt` : Date de mise à jour

## 🚀 Avantages de Supabase

✅ **Gratuit** jusqu'à 500MB de données  
✅ **PostgreSQL** : Base de données robuste et scalable  
✅ **Interface web** : Gestion facile via le dashboard Supabase  
✅ **Backup automatique** : Vos données sont sauvegardées  
✅ **HTTPS** : Connexion sécurisée

## 🐛 Dépannage

### Erreur de connexion

Vérifiez que :
- L'URL de connexion est correcte
- Le mot de passe est correct (`BEA9frkQWiSOwiZz`)
- La référence du projet est correcte
- Le projet Supabase est actif

### Erreur "relation does not exist"

Exécutez la migration :

```bash
npx prisma migrate deploy
```

### Vérifier la connexion depuis Supabase

1. Allez dans **Database** → **Tables**
2. Vous devriez voir la table `PushSubscription` après la migration

