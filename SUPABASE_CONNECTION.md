# Instructions pour récupérer l'URL de connexion Supabase

## 🔍 Vérification de la connexion

Il semble y avoir un problème de connexion à Supabase. Voici comment récupérer la bonne URL :

### 1. Dans le Dashboard Supabase

1. Allez sur https://supabase.com/dashboard/project/nytelcwmramnyhdovurc
2. Allez dans **Settings** → **Database**
3. Dans la section **Connection string**, vous verrez plusieurs options :
   - **URI** : Format complet avec mot de passe
   - **Session mode** : Pour les connexions directes
   - **Transaction mode** : Pour les transactions

### 2. Récupérer l'URL complète

Copiez l'URL qui ressemble à :

```
postgresql://postgres.nytelcwmramnyhdovurc:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

OU

```
postgresql://postgres:[YOUR-PASSWORD]@db.nytelcwmramnyhdovurc.supabase.co:5432/postgres
```

### 3. Vérifier le mot de passe

Le mot de passe que vous avez fourni est : `BEA9frkQWiSOwiZz`

⚠️ **Important** : Assurez-vous que c'est bien le mot de passe de la base de données, pas le mot de passe de votre compte Supabase.

### 4. Si le mot de passe est différent

Si vous avez défini un autre mot de passe lors de la création du projet :

1. Allez dans **Settings** → **Database**
2. Cliquez sur **Reset database password** si nécessaire
3. Utilisez le nouveau mot de passe dans l'URL

### 5. Test de connexion

Une fois l'URL correcte récupérée, testez avec :

```bash
npx dotenv -e .env.local -- npx prisma db pull
```

Cela devrait se connecter et récupérer le schéma de la base.

## 🔧 Alternative : Utiliser le pooler Supabase

Supabase recommande d'utiliser le pooler pour les connexions. L'URL du pooler ressemble à :

```
postgresql://postgres.nytelcwmramnyhdovurc:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Avec les paramètres :
- `?pgbouncer=true` pour utiliser le pooler
- `?sslmode=require` pour SSL

## 📝 Mise à jour de .env.local

Une fois l'URL correcte récupérée, mettez à jour `.env.local` :

```env
DATABASE_URL="postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.nytelcwmramnyhdovurc.supabase.co:5432/postgres?sslmode=require"
```

Puis exécutez :

```bash
npx dotenv -e .env.local -- npx prisma migrate dev --name init
```

