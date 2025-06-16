# 🧠 Smart Memory MCP

Un serveur MCP (Model Context Protocol) intelligent pour gérer la mémoire et le contexte de vos assistants IA avec optimisation automatique.

## ✨ Fonctionnalités

- **Mémoire persistante** avec SQLite
- **Résumés automatiques** via OpenAI (optionnel)
- **Gestion intelligente du contexte** pour éviter les limites de tokens
- **Recherche sémantique** dans les mémoires stockées
- **Tags automatiques** pour la catégorisation
- **Statistiques d'utilisation** et optimisation
- **Compatible** avec Cursor, VSCode, Windsurf, Claude Desktop

## 🚀 Installation et utilisation

### Option 1: Utilisation directe avec npx (recommandée)
```bash
# Utilisation directe sans installation
npx smart-memory-mcp
```

### Option 2: Installation automatique

**Linux/Mac :**
```bash
curl -sSL https://raw.githubusercontent.com/becardev/smart-memory-mcp/main/install-script.sh | bash
```

**Windows (PowerShell) :**
```powershell
# Télécharger et exécuter le script d'initialisation
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/becardev/smart-memory-mcp/main/init-smart-memory.ps1" -OutFile "init-smart-memory.ps1"
.\init-smart-memory.ps1
```

### Option 3: Installation manuelle
```bash
npm install -g smart-memory-mcp
```

### Option 4: Installation locale
```bash
git clone https://github.com/becardev/smart-memory-mcp.git
cd smart-memory-mcp
npm install
npm run build
```

## ⚙️ Configuration

### Variables d'environnement

```bash
export OPENAI_API_KEY="votre-clé-openai"  # Optionnel, pour les résumés automatiques
export SMART_MEMORY_DB_PATH="/chemin/vers/votre/smart_memory.sqlite"  # Optionnel, chemin personnalisé pour la base de données
```

### Options de ligne de commande

```bash
# Spécifier un chemin personnalisé pour la base de données
npx smart-memory-mcp --db-path=/chemin/vers/votre/smart_memory.sqlite
```

### Configuration des éditeurs (utilisation direct sans installation)

#### Cursor / VSCode

**Configuration simple (recommandée) :**
```json
{
  "mcpServers": {
    "smart-memory": {
      "command": "npx",
      "args": ["-y", "smart-memory-mcp"],
      "env": {
        "OPENAI_API_KEY": "votre-clé-openai",
        "OPENAI_MODEL": "gpt-4.1-mini"
      }
    }
  }
}
```

**Configuration avec chemin personnalisé :**
```json
{
  "mcpServers": {
    "smart-memory": {
      "command": "npx",
      "args": ["-y", "smart-memory-mcp"],
      "env": {
        "OPENAI_API_KEY": "votre-clé-openai",
        "OPENAI_MODEL": "gpt-4.1-mini",
        "SMART_MEMORY_DB_PATH": "C:/Users/VotreNom/smart-memory/smart_memory.sqlite"
      }
    }
  }
}
```

#### Claude Desktop

Ajoutez dans `~/.config/claude-desktop/claude_desktop_config.json` (Linux/Mac) ou `%APPDATA%\Claude\claude_desktop_config.json` (Windows) :

**Configuration simple (recommandée) :**
```json
{
  "mcpServers": {
    "smart-memory": {
      "command": "npx",
      "args": ["-y", "smart-memory-mcp"],
      "env": {
        "OPENAI_API_KEY": "votre-clé-openai",
        "OPENAI_MODEL": "gpt-4.1-mini"
      }
    }
  }
}
```

#### Windsurf

Configuration similaire via leur interface MCP.

## 🛠️ Outils disponibles

### `store_memory`
Stocke une information avec résumé automatique
```typescript
{
  key: "project-requirements",
  content: "Le projet doit utiliser React, TypeScript, et avoir une API REST..."
}
```

### `retrieve_memory`
Récupère une mémoire spécifique
```typescript
{ key: "project-requirements" }
```

### `search_memories`
Recherche dans toutes les mémoires
```typescript
{
  query: "React TypeScript",
  limit: 5
}
```

### `get_smart_context`
Obtient un contexte optimisé pour vos requêtes
```typescript
{
  queries: ["projet actuel", "requirements", "architecture"],
  max_length: 8000
}
```

### `list_memories`
Liste les mémoires les plus utilisées
```typescript
{ limit: 10 }
```

### `memory_stats`
Statistiques de la base de mémoire
```typescript
{}
```

## 💡 Exemples d'utilisation

### Premier démarrage
Après avoir configuré votre éditeur, le fichier `smart_memory.sqlite` sera créé automatiquement lors de la première utilisation :

```bash
# Le fichier apparaît dans votre répertoire de travail après la première requête
ls smart_memory.sqlite  # ✅ Fichier créé automatiquement
```

### Stockage de contexte de projet
```bash
# L'assistant peut faire :
store_memory("projet-ecommerce", "Application e-commerce avec React, API Node.js, base MongoDB. Features: panier, paiement Stripe, authentification JWT...")
```

### Récupération intelligente de contexte
```bash
# Pour optimiser le contexte selon la conversation :
get_smart_context(["ecommerce", "paiement", "React"], 6000)
```

### Recherche dans l'historique
```bash
search_memories("base de données MongoDB", 3)
```

## 🗄️ Stockage

- **Base de données** : SQLite (`smart_memory.sqlite`)
- **Création automatique** : Le fichier est créé automatiquement lors du premier démarrage
- **Localisation par défaut** : Répertoire de travail courant (idéal pour le développement)
- **Résumés automatiques** : Via OpenAI (si configuré)
- **Tags automatiques** : Extraction de mots-clés
- **Compression intelligente** : Optimisation du contexte

### 📍 Localisation de la base de données

Le fichier `smart_memory.sqlite` est créé automatiquement lors de la première exécution du serveur MCP.

#### Ordre de priorité pour le chemin de la base de données :
1. **Argument de ligne de commande** : `--db-path=/chemin/personnalisé`
2. **Variable d'environnement** : `SMART_MEMORY_DB_PATH`
3. **Chemin par défaut** : `./smart_memory.sqlite` (répertoire de travail courant)

> **💡 Recommandation** : Par défaut, le fichier `smart_memory.sqlite` est créé dans le répertoire courant, ce qui est idéal pour le développement et l'utilisation locale.

#### Emplacements recommandés :
- **Windows** : `C:/Users/VotreNom/AppData/Local/smart-memory/smart_memory.sqlite`
- **macOS** : `~/Library/Application Support/smart-memory/smart_memory.sqlite`
- **Linux** : `~/.local/share/smart-memory/smart_memory.sqlite`

> **Note** : Le répertoire parent est créé automatiquement si nécessaire. Le fichier n'apparaît qu'après le premier démarrage du serveur MCP.

## 🔧 Dépannage

### Problème : Le fichier `smart_memory.sqlite` ne se crée pas

> **💡 Note** : Par défaut, le fichier est créé dans le répertoire de travail courant. Il apparaît seulement après la première utilisation d'un outil MCP.

**Solutions :**

1. **Spécifier un chemin explicite** dans la configuration MCP :
   ```json
   "args": ["-y", "smart-memory-mcp", "--db-path=C:/Users/VotreNom/smart-memory/smart_memory.sqlite"]
   ```

2. **Utiliser une variable d'environnement** :
   ```json
   "env": {
     "SMART_MEMORY_DB_PATH": "C:/Users/VotreNom/smart-memory/smart_memory.sqlite"
   }
   ```

3. **Utiliser les scripts d'initialisation** :
   ```powershell
   # Windows PowerShell
   .\init-smart-memory.ps1
   ```
   
   ```bash
   # Linux/Mac
   ./init-smart-memory.sh
   ```

4. **Créer manuellement le répertoire** :
   ```powershell
   # Windows PowerShell
   New-Item -ItemType Directory -Force -Path "C:\Users\$env:USERNAME\smart-memory"
   ```
   
   ```bash
   # Linux/Mac
   mkdir -p ~/smart-memory
   ```

5. **Vérifier les permissions** : Assurez-vous que le processus MCP a les droits d'écriture dans le répertoire cible.

### Problème : Erreur de permissions

Si vous obtenez une erreur de permissions, utilisez un répertoire dans votre dossier utilisateur :
- Windows : `%USERPROFILE%\smart-memory\`
- Linux/Mac : `~/smart-memory/`

## 🔧 Développement

### Structure du projet
```
smart-memory-mcp/
├── smart-memory-mcp.ts   # Serveur MCP principal
├── dist/                 # Code compilé
├── package.json
├── tsconfig.json
├── install-script.sh     # Script d'installation
└── README.md
```

### Compilation
```bash
npm run build
```

### Développement
```bash
npm run dev
```

### Test local
```bash
# Compilation du projet
npm run build

# Test du serveur MCP (crée automatiquement smart_memory.sqlite)
node dist/smart-memory-mcp.js

# Test via stdio (dans un autre terminal)
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/smart-memory-mcp.js
```

> **Note** : Le fichier `smart_memory.sqlite` sera créé automatiquement lors du premier test.

## 📦 Déploiement

### Publication npm
```bash
npm run build
npm publish
```

### Installation globale
```bash
npm install -g smart-memory-mcp
```

### Docker (pour VPS avec Coolify)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/smart-memory-mcp.js"]
```

## 🔒 Sécurité

- Base de données locale SQLite
- Pas de données envoyées vers des services tiers (sauf OpenAI pour résumés)
- Clé API OpenAI optionnelle et configurable
- Chiffrement recommandé pour les données sensibles

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Créez une Pull Request

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE)

## 🔧 Dépannage

### Le fichier `smart_memory.sqlite` n'est pas créé

**Problème** : Après installation, le fichier de base de données n'apparaît pas.

**Solution** :
1. Le fichier n'est créé qu'au premier démarrage du serveur MCP
2. Testez en exécutant directement : `node dist/smart-memory-mcp.js`
3. Ou utilisez une fonction MCP comme `store_memory` depuis votre éditeur
4. Vérifiez que le MCP est correctement configuré dans votre éditeur

### Le serveur MCP ne démarre pas

**Vérifications** :
- Node.js version ≥ 18.0.0
- Dépendances installées : `npm install`
- Projet compilé : `npm run build`
- Variables d'environnement configurées (OPENAI_API_KEY optionnel)

### Erreur de connexion MCP

**Solutions** :
- Redémarrez votre éditeur (Cursor/VSCode/Claude Desktop)
- Vérifiez la configuration JSON du serveur MCP
- Consultez les logs de votre éditeur

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/becardev/smart-memory-mcp/issues)
- **Documentation** : [Wiki](https://github.com/becardev/smart-memory-mcp/wiki)
- **Discussions** : [GitHub Discussions](https://github.com/becardev/smart-memory-mcp/discussions)

## 🚀 Roadmap

- [ ] Support des embeddings vectoriels
- [ ] Interface web pour gestion des mémoires
- [ ] Export/import de mémoires
- [ ] Intégration avec d'autres LLM (Anthropic, Ollama)
- [ ] Synchronisation cloud optionnelle
- [ ] Plugin pour IDE populaires

---

**Inspiré par supermemory mais entièrement open-source et auto-hébergé** 🎯