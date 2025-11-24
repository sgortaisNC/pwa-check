# Configuration DATABASE_URL pour Vercel

## ⚠️ Erreur de connexion détectée

Si vous voyez l'erreur "Can't reach database server", voici comment la résoudre :

## ✅ Vérifications dans Vercel

### 1. Vérifier que DATABASE_URL est bien configurée

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Vérifiez que `DATABASE_URL` existe avec la valeur :
   ```
   postgresql://postgres:F9feHC7cRFg0sjyR@db.nytelcwmramnyhdovurc.supabase.co:5432/postgres
   ```

### 2. Vérifier les environnements

Assurez-vous que `DATABASE_URL` est disponible pour :
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### 3. Redéployer après ajout/modification

Après avoir ajouté ou modifié `DATABASE_URL`, vous devez **redéployer** :
- Allez dans **Deployments**
- Cliquez sur les **3 points** (⋯) du dernier déploiement
- Sélectionnez **Redeploy**

## 🔧 Solution alternative : Utiliser le pooler Supabase

Si la connexion directe ne fonctionne pas, utilisez le pooler Supabase :

### Récupérer l'URL du pooler

1. Allez sur https://supabase.com/dashboard/project/nytelcwmramnyhdovurc
2. **Settings** → **Database**
3. Dans **Connection string**, sélectionnez **Session mode** ou **Transaction mode**
4. Copiez l'URL qui ressemble à :
   ```
   postgresql://postgres.nytelcwmramnyhdovurc:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Mettre à jour dans Vercel

Remplacez la valeur de `DATABASE_URL` dans Vercel par l'URL du pooler.

## 🔍 Vérifier le projet Supabase

1. Allez sur https://supabase.com/dashboard/project/nytelcwmramnyhdovurc
2. Vérifiez que le projet est **Active** (pas en pause)
3. Si le projet est en pause, réactivez-le

## 📝 Format de l'URL correcte

L'URL doit être au format :
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Ou avec SSL :
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

## 🚀 Après configuration

Une fois `DATABASE_URL` correctement configurée dans Vercel :

1. Redéployez l'application
2. Testez l'abonnement depuis l'app déployée
3. Vérifiez dans Supabase (Database → Tables → PushSubscription) que l'abonnement est enregistré

