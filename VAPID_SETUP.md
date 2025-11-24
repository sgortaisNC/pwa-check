# Configuration VAPID - Clés générées

## Clés VAPID générées

Les clés VAPID suivantes ont été générées pour votre projet :

### Clé publique (Public Key)
```
BOaYU0wYjwrr36gO9Xaq4rF3EzBQPGSdkTwFSpZdpnYnLdcO4bgwNZKKAo08Kbk8Q7p69WmY6BX8MZ4yamV7v_4
```

### Clé privée (Private Key)
```
Q0wdshoPKsG02IWIVrzrmgi7flA6Gdlwu18a6reJ1NM
```

⚠️ **IMPORTANT** : La clé privée doit rester secrète et ne jamais être partagée publiquement.

## Configuration

### Développement local

Les clés sont déjà configurées dans `.env.local` (non versionné).

Pour utiliser ces variables en développement, SvelteKit les chargera automatiquement.

### Production (Vercel)

1. Allez sur votre projet Vercel : https://vercel.com/dashboard
2. Sélectionnez votre projet `test-ju` (ou le nom de votre projet)
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez les trois variables suivantes :

   | Variable | Valeur |
   |----------|--------|
   | `VAPID_PUBLIC_KEY` | `BOaYU0wYjwrr36gO9Xaq4rF3EzBQPGSdkTwFSpZdpnYnLdcO4bgwNZKKAo08Kbk8Q7p69WmY6BX8MZ4yamV7v_4` |
   | `VAPID_PRIVATE_KEY` | `Q0wdshoPKsG02IWIVrzrmgi7flA6Gdlwu18a6reJ1NM` |
   | `VAPID_EMAIL` | `mailto:votre@email.com` (remplacez par votre email) |

5. **Important** : Modifiez `VAPID_EMAIL` avec votre vraie adresse email (format: `mailto:votre@email.com`)
6. Redéployez l'application après avoir ajouté les variables

## Vérification

Pour vérifier que les clés sont bien configurées :

1. **En développement** : Les variables sont chargées depuis `.env.local`
2. **En production** : Vérifiez dans les logs Vercel que les variables sont bien chargées

## Régénérer les clés

Si vous devez régénérer les clés (par exemple, si la clé privée a été compromise) :

```bash
npx web-push generate-vapid-keys
```

Puis mettez à jour les variables d'environnement avec les nouvelles clés.

## Sécurité

- ✅ La clé privée est dans `.gitignore` et ne sera pas commitée
- ✅ Utilisez des variables d'environnement pour la production
- ⚠️ Ne partagez jamais la clé privée publiquement
- ⚠️ Si la clé privée est compromise, régénérez immédiatement de nouvelles clés

