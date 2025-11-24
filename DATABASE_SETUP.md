# Configuration de la base de données pour les abonnements push

## ✅ Base de données configurée

Les abonnements push sont maintenant persistés dans une base de données SQLite avec Prisma.

## 📦 Installation

Les dépendances ont été installées :
- `prisma` : CLI pour gérer la base de données
- `@prisma/client` : Client TypeScript pour interagir avec la base de données

## 🗄️ Structure de la base de données

### Modèle PushSubscription

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  endpoint  String   @unique
  p256dh    String?
  auth      String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 Première utilisation

### 1. Créer la base de données

```bash
npx prisma migrate dev --name init
```

Cela créera le fichier `prisma/dev.db` (SQLite) avec la structure de la base de données.

### 2. Vérifier la base de données

Vous pouvez visualiser la base de données avec Prisma Studio :

```bash
npx prisma studio
```

Cela ouvrira une interface web sur `http://localhost:5555` pour voir et gérer les données.

## 🔄 Migration vers une base de données cloud (Production)

Pour la production sur Vercel, vous avez plusieurs options :

### Option 1 : Vercel Postgres (Recommandé)

1. Créez une base de données Postgres sur Vercel
2. Récupérez l'URL de connexion
3. Modifiez `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Créez une migration :

```bash
npx prisma migrate dev --name migrate_to_postgres
```

5. Ajoutez `DATABASE_URL` dans les variables d'environnement Vercel

### Option 2 : Supabase (Gratuit jusqu'à 500MB)

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez l'URL de connexion PostgreSQL
3. Suivez les mêmes étapes que pour Vercel Postgres

### Option 3 : PlanetScale (MySQL)

1. Créez une base de données sur [planetscale.com](https://planetscale.com)
2. Modifiez `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

3. Créez une migration et déployez

## 📝 Variables d'environnement

### Développement local

Dans `.env.local` (déjà configuré) :

```env
DATABASE_URL="file:./dev.db"
```

### Production (Vercel)

Ajoutez dans les variables d'environnement Vercel :

```
DATABASE_URL="votre_url_de_connexion_postgres"
```

## 🔍 Vérification

Pour vérifier que tout fonctionne :

1. Démarrez l'application : `pnpm dev`
2. Abonnez-vous aux notifications depuis la page principale
3. Vérifiez dans Prisma Studio que l'abonnement est bien enregistré :

```bash
npx prisma studio
```

## 🗑️ Nettoyage des abonnements invalides

Les abonnements invalides (erreur 410) sont automatiquement supprimés lors de l'envoi de notifications.

Vous pouvez aussi les supprimer manuellement via Prisma Studio ou créer une route API pour le nettoyage.

## 📊 Avantages de la persistance

✅ **Abonnements conservés** : Les abonnements survivent aux redémarrages du serveur  
✅ **Historique** : Vous pouvez voir quand chaque utilisateur s'est abonné  
✅ **Nettoyage automatique** : Les abonnements invalides sont supprimés  
✅ **Scalable** : Facilement migrable vers une base de données cloud  
✅ **Type-safe** : TypeScript avec Prisma pour une sécurité de type

## 🐛 Dépannage

### Erreur "PrismaClient is not configured"

Assurez-vous d'avoir généré le client Prisma :

```bash
npx prisma generate
```

### Erreur "Migration missing"

Créez la migration :

```bash
npx prisma migrate dev
```

### Base de données verrouillée (SQLite)

Si vous voyez "database is locked", fermez Prisma Studio et réessayez.

