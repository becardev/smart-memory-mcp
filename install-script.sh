#!/bin/bash

# Script d'installation Smart Memory MCP
# Similaire à supermemory mais auto-hébergé

set -e

echo "🧠 Installation de Smart Memory MCP..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installez Node.js 18+ d'abord."
    exit 1
fi

# Créer le répertoire du projet
PROJECT_DIR="$HOME/.smart-memory-mcp"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Télécharger et installer
echo "📦 Téléchargement des fichiers..."

# Si vous publiez sur npm
npm install -g smart-memory-mcp

# OU installation locale
# git clone https://github.com/votre-username/smart-memory-mcp.git .
# npm install
# npm run build

echo "⚙️  Configuration..."

# Créer le fichier de configuration
cat > config.json << EOF
{
  "openai_api_key": "${OPENAI_API_KEY:-}",
  "max_context_length": 8000,
  "db_path": "$PROJECT_DIR/smart_memory.sqlite"
}
EOF

# Créer le script de démarrage
cat > start.sh << 'EOF'
#!/bin/bash
export OPENAI_API_KEY=$(grep -o '"openai_api_key": "[^"]*"' config.json | cut -d'"' -f4)
smart-memory-mcp
EOF

chmod +x start.sh

# Instructions pour les éditeurs
echo "🎯 Configuration des éditeurs..."

# Cursor/VSCode
VSCODE_SETTINGS="$HOME/.cursor/User/settings.json"
if [ ! -f "$VSCODE_SETTINGS" ]; then
    VSCODE_SETTINGS="$HOME/.config/Code/User/settings.json"
fi

if [ -f "$VSCODE_SETTINGS" ]; then
    echo "Configuration détectée pour Cursor/VSCode"
    echo "Ajoutez cette configuration à vos settings.json :"
    echo '{
  "mcp.servers": {
    "smart-memory": {
      "command": "'$PROJECT_DIR'/start.sh"
    }
  }
}'
fi

echo "✅ Installation terminée!"
echo ""
echo "🚀 Pour utiliser Smart Memory MCP:"
echo "1. Configurez votre clé OpenAI (optionnel) :"
echo "   export OPENAI_API_KEY='votre-clé'"
echo ""
echo "2. Dans votre éditeur, ajoutez la configuration MCP :"
echo "   Command: $PROJECT_DIR/start.sh"
echo ""
echo "3. Outils disponibles :"
echo "   - store_memory: Stocker des informations"
echo "   - retrieve_memory: Récupérer une mémoire"
echo "   - search_memories: Rechercher dans les mémoires"
echo "   - get_smart_context: Contexte intelligent optimisé"
echo "   - list_memories: Lister les mémoires"
echo "   - memory_stats: Statistiques"
echo ""
echo "📁 Base de données: $PROJECT_DIR/smart_memory.sqlite"
echo "⚙️  Configuration: $PROJECT_DIR/config.json"

# Tester l'installation
echo "🧪 Test de l'installation..."
cd "$PROJECT_DIR"
timeout 5s ./start.sh &
PID=$!
sleep 2

if kill -0 $PID 2>/dev/null; then
    echo "✅ Le serveur MCP démarre correctement"
    kill $PID
else
    echo "⚠️  Vérifiez la configuration si nécessaire"
fi

echo ""
echo "🎉 Smart Memory MCP est prêt à l'emploi!"
echo "📖 Documentation: https://github.com/votre-repo/smart-memory-mcp"