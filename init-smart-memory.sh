#!/bin/bash

# Script d'initialisation Smart Memory MCP
# Usage: ./init-smart-memory.sh [chemin-optionnel]

DB_PATH="${1:-./smart_memory.sqlite}"

echo "🧠 Initialisation de Smart Memory MCP"
echo "================================="

# Créer le répertoire parent si nécessaire
DB_DIR=$(dirname "$DB_PATH")
if [ ! -d "$DB_DIR" ]; then
    echo "📁 Création du répertoire: $DB_DIR"
    mkdir -p "$DB_DIR"
fi

echo "📍 Chemin de la base de données: $DB_PATH"

# Tester la création de la base de données
echo "🔧 Test de création de la base de données..."

# Exporter la variable d'environnement
export SMART_MEMORY_DB_PATH="$DB_PATH"
echo "✅ Variable d'environnement définie: SMART_MEMORY_DB_PATH=$DB_PATH"

echo ""
echo "📋 Configuration recommandée pour vos éditeurs:"
echo ""
echo "Pour Cursor/VSCode (settings.json):"

if [ "$DB_PATH" = "./smart_memory.sqlite" ]; then
cat << EOF
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
EOF
else
cat << EOF
{
  "mcpServers": {
    "smart-memory": {
      "command": "npx",
      "args": ["-y", "smart-memory-mcp"],
      "env": {
        "OPENAI_API_KEY": "votre-clé-openai",
        "OPENAI_MODEL": "gpt-4.1-mini",
        "SMART_MEMORY_DB_PATH": "$DB_PATH"
      }
    }
  }
}
EOF
fi

echo ""
echo "Pour Claude Desktop (~/.config/claude-desktop/claude_desktop_config.json):"

if [ "$DB_PATH" = "./smart_memory.sqlite" ]; then
cat << EOF
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
EOF
else
cat << EOF
{
  "mcpServers": {
    "smart-memory": {
      "command": "npx",
      "args": ["-y", "smart-memory-mcp"],
      "env": {
        "OPENAI_API_KEY": "votre-clé-openai",
        "OPENAI_MODEL": "gpt-4.1-mini",
        "SMART_MEMORY_DB_PATH": "$DB_PATH"
      }
    }
  }
}
EOF
fi

echo ""
echo "🎉 Smart Memory MCP est prêt à être utilisé !"
echo "📝 N'oubliez pas de redémarrer vos éditeurs après avoir mis à jour la configuration."

# Rendre le script exécutable
chmod +x "$0" 2>/dev/null || true 