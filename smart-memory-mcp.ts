#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import Database from 'better-sqlite3';
import OpenAI from 'openai';
import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs';

interface MemoryEntry {
  id?: number;
  key: string;
  content: string;
  summary: string;
  embedding?: string;
  tags: string;
  timestamp: string;
  usage_count: number;
}

class SmartMemoryMCP {
  private db: Database.Database;
  private openai: OpenAI;
  private maxContextLength = 8000; // Limite de contexte par défaut

  constructor(dbPath?: string) {
    // Initialisation de la base de données avec chemin configurable
    // Priorité : argument > variable d'environnement > répertoire courant
    const finalDbPath = dbPath || 
      process.env.SMART_MEMORY_DB_PATH || 
      path.join(process.cwd(), 'smart_memory.sqlite');
    
    // Créer le répertoire parent si nécessaire (seulement si ce n'est pas le répertoire courant)
    const dbDir = path.dirname(finalDbPath);
    const currentDir = process.cwd();
    
    if (dbDir !== currentDir && !fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    console.error(`📍 Base de données Smart Memory: ${finalDbPath}`);
    this.db = new Database(finalDbPath);
    this.initDatabase();
    
    // Initialisation OpenAI (optionnel)
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-api-key'
    });
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        content TEXT,
        summary TEXT,
        embedding TEXT,
        tags TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        usage_count INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS idx_tags ON memories(tags);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON memories(timestamp);
      CREATE INDEX IF NOT EXISTS idx_usage ON memories(usage_count);
    `);
  }

  private generateHash(content: string): string {
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  private async generateSummary(content: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback: prendre les 200 premiers caractères
      return content.length > 200 ? content.substring(0, 200) + '...' : content;
    }

    try {
      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'Résume ce contenu en 2-3 phrases courtes et précises. Garde les informations les plus importantes.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      return response.choices[0]?.message.content || content.substring(0, 200);
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      return content.substring(0, 200) + '...';
    }
  }

  private extractTags(content: string): string[] {
    // Extraction simple de mots-clés
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Prendre les mots les plus fréquents
    const wordCount = new Map();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  async storeMemory(key: string, content: string): Promise<string> {
    const summary = await this.generateSummary(content);
    const tags = this.extractTags(content).join(',');
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memories (key, content, summary, tags, usage_count)
      VALUES (?, ?, ?, ?, COALESCE((SELECT usage_count FROM memories WHERE key = ?), 0))
    `);

    try {
      stmt.run(key, content, summary, tags, key);
      return `✅ Mémoire stockée: ${key} (${content.length} caractères, résumé: ${summary.length} caractères)`;
    } catch (error) {
      return `❌ Erreur lors du stockage: ${error}`;
    }
  }

  retrieveMemory(key: string): MemoryEntry | null {
    const stmt = this.db.prepare('SELECT * FROM memories WHERE key = ?');
    const result = stmt.get(key) as MemoryEntry | undefined;
    
    if (result) {
      // Incrémenter le compteur d'utilisation
      const updateStmt = this.db.prepare('UPDATE memories SET usage_count = usage_count + 1 WHERE key = ?');
      updateStmt.run(key);
    }
    
    return result || null;
  }

  searchMemories(query: string, limit: number = 5): MemoryEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE content LIKE ? OR summary LIKE ? OR tags LIKE ? OR key LIKE ?
      ORDER BY usage_count DESC, timestamp DESC
      LIMIT ?
    `);
    
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm, limit) as MemoryEntry[];
  }

  getContextOptimized(queries: string[], maxLength: number = this.maxContextLength): string {
    let totalLength = 0;
    let context = '';
    const usedKeys = new Set();

    // Rechercher les mémoires pertinentes pour chaque query
    for (const query of queries) {
      const memories = this.searchMemories(query, 3);
      
      for (const memory of memories) {
        if (usedKeys.has(memory.key)) continue;
        
        const memoryText = `[${memory.key}] ${memory.summary}\n`;
        
        if (totalLength + memoryText.length > maxLength) {
          break;
        }
        
        context += memoryText;
        totalLength += memoryText.length;
        usedKeys.add(memory.key);
      }
    }

    return context || 'Aucune mémoire pertinente trouvée.';
  }

  listMemories(limit: number = 10): MemoryEntry[] {
    const stmt = this.db.prepare(`
      SELECT key, summary, tags, timestamp, usage_count 
      FROM memories 
      ORDER BY usage_count DESC, timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit) as MemoryEntry[];
  }

  deleteMemory(key: string): string {
    const stmt = this.db.prepare('DELETE FROM memories WHERE key = ?');
    const result = stmt.run(key);
    return result.changes > 0 ? `✅ Mémoire "${key}" supprimée` : `❌ Mémoire "${key}" non trouvée`;
  }

  getStats(): object {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as total FROM memories');
    const sizeStmt = this.db.prepare('SELECT SUM(LENGTH(content)) as total_size FROM memories');
    const recentStmt = this.db.prepare('SELECT COUNT(*) as recent FROM memories WHERE timestamp > datetime("now", "-7 days")');
    
    const total = totalStmt.get() as { total: number };
    const size = sizeStmt.get() as { total_size: number };
    const recent = recentStmt.get() as { recent: number };

    return {
      total_memories: total.total,
      total_size_chars: size.total_size || 0,
      recent_memories: recent.recent,
      db_size_mb: Math.round((size.total_size || 0) / 1024 / 1024 * 100) / 100
    };
  }
}

// Interfaces pour les arguments des outils
interface StoreMemoryArgs {
  key: string;
  content: string;
}

interface RetrieveMemoryArgs {
  key: string;
}

interface SearchMemoriesArgs {
  query: string;
  limit?: number;
}

interface GetSmartContextArgs {
  queries: string[];
  max_length?: number;
}

interface ListMemoriesArgs {
  limit?: number;
}

interface DeleteMemoryArgs {
  key: string;
}

interface MemoryStats {
  total_memories: number;
  total_size_chars: number;
  db_size_mb: number;
  recent_memories: number;
}

// Récupération du chemin de base de données depuis les arguments de ligne de commande
const dbPathArg = process.argv.find(arg => arg.startsWith('--db-path='));
const dbPath = dbPathArg ? dbPathArg.split('=')[1] : undefined;

// Initialisation du serveur MCP
const smartMemory = new SmartMemoryMCP(dbPath);
const server = new Server({
  name: 'smart-memory',
  version: '1.0.0',
});

// Liste des outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'store_memory',
        description: 'Stocker une information dans la mémoire avec résumé automatique',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Clé unique pour identifier cette mémoire',
            },
            content: {
              type: 'string',
              description: 'Contenu à stocker',
            },
          },
          required: ['key', 'content'],
        },
      },
      {
        name: 'retrieve_memory',
        description: 'Récupérer une mémoire spécifique par sa clé',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Clé de la mémoire à récupérer',
            },
          },
          required: ['key'],
        },
      },
      {
        name: 'search_memories',
        description: 'Rechercher dans les mémoires stockées',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Terme de recherche',
            },
            limit: {
              type: 'number',
              description: 'Nombre maximum de résultats (défaut: 5)',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_smart_context',
        description: 'Obtenir un contexte optimisé basé sur des requêtes',
        inputSchema: {
          type: 'object',
          properties: {
            queries: {
              type: 'array',
              items: { type: 'string' },
              description: 'Liste de requêtes pour trouver le contexte pertinent',
            },
            max_length: {
              type: 'number',
              description: 'Longueur maximale du contexte (défaut: 8000)',
              default: 8000,
            },
          },
          required: ['queries'],
        },
      },
      {
        name: 'list_memories',
        description: 'Lister les mémoires les plus utilisées',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Nombre de mémoires à lister (défaut: 10)',
              default: 10,
            },
          },
        },
      },
      {
        name: 'delete_memory',
        description: 'Supprimer une mémoire',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Clé de la mémoire à supprimer',
            },
          },
          required: ['key'],
        },
      },
      {
        name: 'memory_stats',
        description: 'Obtenir des statistiques sur la mémoire',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Gestionnaire des appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error('Arguments manquants');
    }

    switch (name) {
      case 'store_memory': {
        const argsObj = args as any;
        if (!argsObj.key || !argsObj.content) {
          throw new Error('Paramètres key et content requis');
        }
        const result = await smartMemory.storeMemory(argsObj.key, argsObj.content);
        return { content: [{ type: 'text', text: result }] };
      }

      case 'retrieve_memory': {
        const argsObj = args as any;
        if (!argsObj.key) {
          throw new Error('Paramètre key requis');
        }
        const memory = smartMemory.retrieveMemory(argsObj.key);
        const memoryText = memory 
          ? `**${memory.key}**\n\n${memory.content}\n\n*Résumé: ${memory.summary}*\n*Tags: ${memory.tags}*\n*Utilisations: ${memory.usage_count}*`
          : `Aucune mémoire trouvée pour la clé: ${argsObj.key}`;
        return { content: [{ type: 'text', text: memoryText }] };
      }

      case 'search_memories': {
        const argsObj = args as any;
        if (!argsObj.query) {
          throw new Error('Paramètre query requis');
        }
        const searchResults = smartMemory.searchMemories(argsObj.query, argsObj.limit || 5);
        const searchText = searchResults.length > 0
          ? searchResults.map(m => `**${m.key}**: ${m.summary} (utilisé ${m.usage_count} fois)`).join('\n\n')
          : `Aucun résultat pour: ${argsObj.query}`;
        return { content: [{ type: 'text', text: searchText }] };
      }

      case 'get_smart_context': {
        const argsObj = args as any;
        if (!argsObj.queries || !Array.isArray(argsObj.queries)) {
          throw new Error('Paramètre queries (array) requis');
        }
        const context = smartMemory.getContextOptimized(argsObj.queries, argsObj.max_length || 8000);
        return { content: [{ type: 'text', text: `**Contexte optimisé:**\n\n${context}` }] };
      }

      case 'list_memories': {
        const argsObj = args as any;
        const memories = smartMemory.listMemories(argsObj.limit || 10);
        const listText = memories.length > 0
          ? memories.map(m => `**${m.key}**: ${m.summary} (${m.usage_count} utilisations)`).join('\n')
          : 'Aucune mémoire stockée';
        return { content: [{ type: 'text', text: listText }] };
      }

      case 'delete_memory': {
        const argsObj = args as any;
        if (!argsObj.key) {
          throw new Error('Paramètre key requis');
        }
        const deleteResult = smartMemory.deleteMemory(argsObj.key);
        return { content: [{ type: 'text', text: deleteResult }] };
      }

      case 'memory_stats': {
        const stats = smartMemory.getStats() as any;
        const statsText = `**Statistiques de la mémoire:**
- Total des mémoires: ${stats.total_memories}
- Taille totale: ${stats.total_size_chars} caractères (${stats.db_size_mb} MB)
- Mémoires récentes (7 derniers jours): ${stats.recent_memories}`;
        return { content: [{ type: 'text', text: statsText }] };
      }

      default:
        throw new Error(`Outil inconnu: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return {
      content: [{ type: 'text', text: `Erreur: ${errorMessage}` }],
      isError: true,
    };
  }
});



// Démarrage du serveur
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Smart Memory MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});