# Dépannage connexion Supabase

## ⚠️ Problème de connexion détecté

Prisma ne peut pas se connecter à Supabase. Voici les étapes de dépannage :

## 🔍 Vérifications à faire

### 1. Vérifier que le projet Supabase est actif

1. Allez sur https://supabase.com/dashboard/project/nytelcwmramnyhdovurc
2. Vérifiez que le statut du projet est **Active**
3. Si le projet est en pause, réactivez-le

### 2. Vérifier les paramètres de connexion

Dans Supabase Dashboard → **Settings** → **Database**, vérifiez :

- ✅ **Connection pooling** : Activé ou désactivé ?
- ✅ **SSL mode** : Requis ou non ?
- ✅ **Port** : 5432 (direct) ou 6543 (pooler) ?

### 3. Essayer avec le pooler Supabase

Si la connexion directe ne fonctionne pas, utilisez le pooler :

**URL du pooler** (dans Settings → Database → Connection string) :
```
postgresql://postgres.nytelcwmramnyhdovurc:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 4. Ajouter les paramètres SSL

Essayez avec `?sslmode=require` :

```env
DATABASE_URL="postgresql://postgres:F9feHC7cRFg0sjyR@db.nytelcwmramnyhdovurc.supabase.co:5432/postgres?sslmode=require"
```

### 5. Vérifier le firewall/réseau

Si vous êtes sur un réseau d'entreprise ou avec un firewall :
- Vérifiez que le port 5432 n'est pas bloqué
- Essayez depuis un autre réseau (ex: hotspot mobile)

## 🚀 Solution alternative : Créer la table manuellement

Si la connexion Prisma ne fonctionne pas, vous pouvez créer la table directement dans Supabase :

### Via SQL Editor dans Supabase

1. Allez dans **SQL Editor** dans le dashboard Supabase
2. Exécutez cette requête :

```sql
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "endpoint" TEXT NOT NULL UNIQUE,
  "p256dh" TEXT,
  "auth" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "PushSubscription_endpoint_idx" ON "PushSubscription"("endpoint");
```

3. Une fois la table créée, Prisma pourra se connecter et synchroniser

## ✅ Vérification après création manuelle

Après avoir créé la table manuellement :

```bash
npx dotenv -e .env.local -- npx prisma db pull
```

Cela synchronisera Prisma avec votre base de données.

## 📝 Pour Vercel (Production)

Une fois que tout fonctionne en local, ajoutez la même `DATABASE_URL` dans les variables d'environnement Vercel.

