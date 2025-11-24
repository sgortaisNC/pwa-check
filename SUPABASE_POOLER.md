# Configuration Supabase Pooler pour Vercel

## ⚠️ Problème IPv4/IPv6

Vercel est IPv4-only et Supabase utilise IPv6 pour les connexions directes. Il faut utiliser le **Session Pooler** ou **Transaction Pooler** de Supabase.

## 🔧 Solution : Utiliser le Session Pooler

### 1. Récupérer l'URL du Session Pooler

1. Allez sur https://supabase.com/dashboard/project/nytelcwmramnyhdovurc
2. **Settings** → **Database**
3. Dans la section **Connection string**, sélectionnez **Session mode**
4. Copiez l'URL qui ressemble à :
   ```
   postgresql://postgres.nytelcwmramnyhdovurc:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### 2. Format de l'URL complète

L'URL complète devrait ressembler à :
```
postgresql://postgres.nytelcwmramnyhdovurc:F9feHC7cRFg0sjyR@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important** : 
- Le port est **6543** (pas 5432)
- Le format du hostname est `postgres.[PROJECT-REF]` au lieu de `postgres`
- Ajoutez `?pgbouncer=true` à la fin

### 3. Mettre à jour dans Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Modifiez ou ajoutez `DATABASE_URL` avec l'URL du pooler
5. Redéployez l'application

## 📝 Exemple d'URL complète

Une fois que vous avez récupéré l'URL du pooler depuis Supabase, elle devrait ressembler à :

```
postgresql://postgres.nytelcwmramnyhdovurc:F9feHC7cRFg0sjyR@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

(Remplacez `us-west-1` par votre région réelle)

## ✅ Avantages du Pooler

- ✅ Compatible IPv4 (fonctionne avec Vercel)
- ✅ Meilleure gestion des connexions
- ✅ Plus performant pour les applications serverless
- ✅ Limite le nombre de connexions simultanées

## 🔍 Vérification

Après avoir configuré le pooler :

1. Redéployez sur Vercel
2. Testez l'abonnement depuis l'app déployée
3. Vérifiez dans Supabase (Database → Tables → PushSubscription) que l'abonnement est enregistré

