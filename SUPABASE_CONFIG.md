# Configuration Supabase - Informations du projet

## ✅ Projet configuré

- **Project URL** : https://nytelcwmramnyhdovurc.supabase.co
- **Project Ref** : `nytelcwmramnyhdovurc`
- **Mot de passe** : `F9feHC7cRFg0sjyR`

## 🔗 URL de connexion PostgreSQL

### ⚠️ Important : Utiliser le Session Pooler pour Vercel

Vercel est IPv4-only, il faut utiliser le **Session Pooler** de Supabase au lieu de la connexion directe.

**Voir `SUPABASE_POOLER.md` pour les instructions détaillées.**

### Connexion directe (ne fonctionne PAS avec Vercel)
```
postgresql://postgres:F9feHC7cRFg0sjyR@db.nytelcwmramnyhdovurc.supabase.co:5432/postgres
```

### Session Pooler (à utiliser avec Vercel)
```
postgresql://postgres.nytelcwmramnyhdovurc:F9feHC7cRFg0sjyR@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Récupérez l'URL exacte depuis Supabase Dashboard → Settings → Database → Connection string → Session mode

## 🔑 API Key (Anon/Public)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dGVsY3dtcmFtbnloZG92dXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NTYxMDEsImV4cCI6MjA3OTUzMjEwMX0.yIWi1Cd-4zDOWK2j4Tc-CHkp0-xf3AszEfmnqFiTEBo
```

⚠️ **Note** : Cette clé API n'est pas utilisée pour Prisma, mais peut être utile pour d'autres intégrations Supabase.

## 📝 Variables d'environnement

### Développement local (`.env.local`)

```env
DATABASE_URL="postgresql://postgres:F9feHC7cRFg0sjyR@db.nytelcwmramnyhdovurc.supabase.co:5432/postgres"
```

### Production (Vercel)

Ajoutez dans les variables d'environnement Vercel :

- **Variable** : `DATABASE_URL`
- **Valeur** : `postgresql://postgres:BEA9frkQWiSOwiZz@db.nytelcwmramnyhdovurc.supabase.co:5432/postgres`
- **Environments** : Production, Preview, Development

## ✅ Migration créée

La table `PushSubscription` a été créée dans votre base Supabase.

## 🔍 Vérification

### Vérifier dans Supabase Dashboard

1. Allez sur https://nytelcwmramnyhdovurc.supabase.co
2. **Database** → **Tables**
3. Vous devriez voir la table `PushSubscription`

### Vérifier avec Prisma Studio

```bash
npx prisma studio
```

Ouvre une interface web sur `http://localhost:5555` pour visualiser vos données.

## 🚀 Prochaines étapes

1. ✅ Base de données configurée
2. ✅ Migration créée
3. ⏳ Tester l'enregistrement d'un abonnement
4. ⏳ Configurer Vercel avec la même `DATABASE_URL`

## 🔒 Sécurité

- ✅ Le mot de passe est dans `.env.local` (non versionné)
- ✅ La base de données est accessible uniquement via HTTPS
- ⚠️ N'oubliez pas d'ajouter `DATABASE_URL` dans Vercel pour la production

