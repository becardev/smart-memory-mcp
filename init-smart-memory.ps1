#!/usr/bin/env pwsh

# Script d'initialisation Smart Memory MCP
# Usage: .\init-smart-memory.ps1 [chemin-optionnel]

param(
    [string]$DbPath = ".\smart_memory.sqlite"
)

Write-Host "🧠 Initialisation de Smart Memory MCP" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Créer le répertoire parent si nécessaire
$DbDir = Split-Path -Parent $DbPath
if (!(Test-Path $DbDir)) {
    Write-Host "📁 Création du répertoire: $DbDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $DbDir | Out-Null
}

Write-Host "📍 Chemin de la base de données: $DbPath" -ForegroundColor Green

# Tester la création de la base de données
Write-Host "🔧 Test de création de la base de données..." -ForegroundColor Yellow

try {
    # Exécuter Smart Memory MCP avec le chemin spécifié pour initialiser la DB
    $env:SMART_MEMORY_DB_PATH = $DbPath
    Write-Host "✅ Variable d'environnement définie: SMART_MEMORY_DB_PATH=$DbPath" -ForegroundColor Green
    
    Write-Host "📋 Configuration recommandée pour vos éditeurs:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour Cursor/VSCode (settings.json):" -ForegroundColor White
    
    if ($DbPath -eq ".\smart_memory.sqlite") {
        Write-Host @"
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
"@ -ForegroundColor Gray
    } else {
        Write-Host @"
{
  "mcpServers": {
    "smart-memory": {
      "command": "npx",
      "args": ["-y", "smart-memory-mcp"],
      "env": {
        "OPENAI_API_KEY": "votre-clé-openai",
        "OPENAI_MODEL": "gpt-4.1-mini",
        "SMART_MEMORY_DB_PATH": "$($DbPath -replace '\\', '/')"
      }
    }
  }
}
"@ -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "Pour Claude Desktop (%APPDATA%\Claude\claude_desktop_config.json):" -ForegroundColor White
    
    if ($DbPath -eq ".\smart_memory.sqlite") {
        Write-Host @"
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
"@ -ForegroundColor Gray
    } else {
        Write-Host @"
{
  "mcpServers": {
    "smart-memory": {
      "command": "npx",
      "args": ["-y", "smart-memory-mcp"],
      "env": {
        "OPENAI_API_KEY": "votre-clé-openai",
        "OPENAI_MODEL": "gpt-4.1-mini",
        "SMART_MEMORY_DB_PATH": "$($DbPath -replace '\\', '/')"
      }
    }
  }
}
"@ -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "🎉 Smart Memory MCP est prêt à être utilisé !" -ForegroundColor Green
    Write-Host "📝 N'oubliez pas de redémarrer vos éditeurs après avoir mis à jour la configuration." -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Erreur lors de l'initialisation: $_" -ForegroundColor Red
    exit 1
} 