# Vérification après configuration Vercel

## ✅ Variables d'environnement ajoutées

Vous avez ajouté les variables suivantes sur Vercel :
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`

## 🔄 Redéploiement requis

**Important** : Pour que les variables d'environnement soient prises en compte, vous devez redéployer l'application.

### Option 1 : Redéploiement automatique (recommandé)

1. Faites un commit et push sur votre dépôt GitHub
2. Vercel redéploiera automatiquement avec les nouvelles variables

### Option 2 : Redéploiement manuel

1. Allez sur votre projet Vercel
2. Cliquez sur **Deployments**
3. Cliquez sur les **3 points** (⋯) du dernier déploiement
4. Sélectionnez **Redeploy**

## ✅ Vérification après déploiement

### 1. Vérifier que la clé publique est accessible

Ouvrez dans votre navigateur :
```
https://votre-domaine.vercel.app/api/push/vapid-key
```

Vous devriez voir :
```json
{
  "publicKey": "BOaYU0wYjwrr36gO9Xaq4rF3EzBQPGSdkTwFSpZdpnYnLdcO4bgwNZKKAo08Kbk8Q7p69WmY6BX8MZ4yamV7v_4"
}
```

Si vous voyez `"publicKey": ""` ou un message d'erreur, les variables ne sont pas correctement configurées.

### 2. Tester l'abonnement

1. Ouvrez votre PWA : `https://votre-domaine.vercel.app/`
2. Acceptez les permissions de notification
3. Cliquez sur **"📱 S'abonner aux notifications push"**
4. Vous devriez voir : "✅ Abonnement aux notifications push réussi !"

### 3. Tester l'envoi depuis l'admin

1. Ouvrez la page admin : `https://votre-domaine.vercel.app/admin`
2. Vérifiez que le nombre d'abonnements est > 0
3. Saisissez un message de test
4. Cliquez sur **"📨 Envoyer à X utilisateur(s)"**
5. Vous devriez recevoir la notification sur votre appareil

## 🐛 Dépannage

### La clé publique n'est pas accessible

**Problème** : `/api/push/vapid-key` retourne une clé vide

**Solutions** :
1. Vérifiez que les variables sont bien nommées (sans espaces, exactement comme indiqué)
2. Vérifiez que vous avez redéployé après avoir ajouté les variables
3. Vérifiez les logs Vercel pour voir s'il y a des erreurs

### Erreur "Clés VAPID non configurées"

**Problème** : Lors de l'envoi depuis `/admin`, vous voyez cette erreur

**Solutions** :
1. Vérifiez que `VAPID_PUBLIC_KEY` ET `VAPID_PRIVATE_KEY` sont bien configurées
2. Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
3. Redéployez l'application

### Les notifications ne sont pas reçues

**Vérifications** :
1. L'utilisateur s'est-il bien abonné ? (bouton "S'abonner aux notifications push")
2. Les permissions sont-elles accordées dans le navigateur ?
3. Le service worker est-il actif ? (DevTools → Application → Service Workers)
4. Vérifiez les logs Vercel pour voir les erreurs d'envoi

## 📝 Checklist de vérification

- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Application redéployée
- [ ] `/api/push/vapid-key` retourne la clé publique
- [ ] Abonnement fonctionne depuis la page principale
- [ ] Page admin accessible (`/admin`)
- [ ] Envoi de notification fonctionne depuis l'admin
- [ ] Notification reçue sur l'appareil

## 🎉 Tout fonctionne ?

Si toutes les vérifications passent, votre système de notifications push serveur est opérationnel ! 🚀

