# Configuration Notion MCP

Ce guide explique comment configurer Notion MCP pour accéder à votre workspace Notion depuis Cursor.

## 🔗 Documentation officielle

Référence : [Notion MCP Documentation](https://developers.notion.com/docs/get-started-with-mcp#connect-through-your-ai-tool)

## ✅ Configuration effectuée

Le fichier `.cursor/mcp.json` a été créé avec la configuration Notion MCP.

## 🔧 Méthodes de connexion

Notion MCP peut être connecté via plusieurs méthodes :

### 1. Streamable HTTP (Recommandé) ✅

Configuration déjà ajoutée dans `.cursor/mcp.json` :

```json
{
  "mcpServers": {
    "Notion": {
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

### 2. SSE (Server-Sent Events)

Alternative si HTTP ne fonctionne pas :

```json
{
  "mcpServers": {
    "Notion": {
      "type": "sse",
      "url": "https://mcp.notion.com/sse"
    }
  }
}
```

### 3. STDIO (Local Server)

Pour les connexions locales :

```json
{
  "mcpServers": {
    "notionMCP": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.notion.com/mcp"]
    }
  }
}
```

## 🚀 Connexion via l'application Notion

Pour la configuration la plus simple :

1. Ouvrez **Settings** dans l'application Notion
2. Allez dans **Connections** → **Notion MCP**
3. Choisissez votre outil IA (Cursor)
4. Complétez le flux OAuth pour connecter

## 📋 Fonctionnalités disponibles

Une fois connecté, vous pouvez :

- ✅ Accéder aux pages Notion
- ✅ Lire et modifier les bases de données
- ✅ Gérer les commentaires
- ✅ Récupérer du contenu en temps réel
- ✅ Créer des pages depuis des templates

## 🔒 Sécurité

- Les permissions sont basées sur l'accès de votre compte Notion
- Seules les pages et bases de données auxquelles vous avez accès sont disponibles
- L'authentification se fait via OAuth

## 🐛 Dépannage

### Vérifier le support MCP

Assurez-vous que Cursor supporte les connexions MCP distantes. Si ce n'est pas le cas, utilisez la méthode STDIO.

### Vérifier la connexion

Après configuration, redémarrez Cursor et vérifiez que Notion MCP apparaît dans les ressources disponibles.

## 📚 Ressources

- [Documentation Notion MCP](https://developers.notion.com/docs/get-started-with-mcp)
- [Outils supportés par Notion MCP](https://developers.notion.com/docs/supported-tools)
- [Meilleures pratiques de sécurité](https://developers.notion.com/docs/security-best-practices)

