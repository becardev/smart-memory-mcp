# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

## [1.0.9] - 2024-12-19

### Modifié
- **BREAKING CHANGE** : Extension du fichier de base de données changée de `.db` à `.sqlite`
- Amélioration de la compatibilité avec les outils SQLite (extensions d'éditeur, DB Browser, etc.)
- Mise à jour de tous les fichiers de documentation et configuration
- Mise à jour du `.gitignore` pour inclure les patterns `*.sqlite` et `*.sqlite-journal`

### Migration
- Les utilisateurs existants peuvent renommer leur fichier `smart_memory.db` en `smart_memory.sqlite`
- Ou laisser le système créer un nouveau fichier `smart_memory.sqlite`

## [1.0.8] - 2024-12-19

### Ajouté
- Section "Localisation de la base de données" dans le README
- Section "Dépannage" complète avec solutions pour les problèmes courants
- Documentation sur la création automatique du fichier `smart_memory.sqlite`
- Instructions de test local améliorées

### Modifié
- Amélioration du code pour utiliser `path.join(process.cwd(), 'smart_memory.sqlite')` pour une localisation prévisible de la base de données
- Mise à jour de la documentation pour clarifier que le fichier DB est créé au premier démarrage
- Section "Test local" avec instructions claires pour créer le fichier de base de données

### Corrigé
- Problème de confusion des utilisateurs concernant la non-apparition immédiate du fichier `smart_memory.sqlite`
- Documentation manquante sur le processus de création de la base de données

## [1.0.7] - 2024-12-18

### Ajouté
- Version initiale du Smart Memory MCP
- Support SQLite pour le stockage persistant
- Intégration OpenAI pour les résumés automatiques
- Outils MCP complets (store_memory, retrieve_memory, search_memories, etc.)
- Configuration pour Cursor, VSCode, et Claude Desktop