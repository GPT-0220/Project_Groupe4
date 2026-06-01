# SensGuinée - Système de Surveillance IoT

Système de supervision et de surveillance basé sur l'Internet des Objets (IoT) pour collecter, stocker et analyser en temps réel les relevés de capteurs hétérogènes.

## 🏗️ Architecture

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite + TailwindCSS + Socket.IO
- **Base de données**: MongoDB (NoSQL pour schéma flexible)

## ✨ Fonctionnalités

### 1. Tableau de bord en temps réel
- Affichage instantané des dernières valeurs de tous les capteurs
- Mise à jour automatique via WebSocket
- Indicateur visuel des alertes

### 2. Historique et Filtrage
- Consultation des relevés passés par capteur
- Filtrage par plage de dates
- Affichage des données brutes (schéma flexible)

### 3. Système d'Alertes
- Détection automatique des dépassements de seuils
- Classification des alertes (WARNING / CRITIQUE)
- Résumé des alertes par capteur

### 4. Analyses Statistiques
- Calcul des métriques (Minimum, Maximum, Moyenne)
- Statistiques par capteur sur une période
- Statistiques globales par type de capteur

### 5. Module de Comparaison
- Comparaison des capteurs d'un même bâtiment
- Graphiques comparatifs
- Analyse des dépassements de seuils

### 6. Surveillance de l'Infrastructure
- Détection des capteurs inactifs
- Statistiques par bâtiment
- Vue d'ensemble de l'infrastructure

## 📊 Contraintes MongoDB Respectées

✅ **Volumétrie**: 25+ capteurs, 2500+ relevés
✅ **Schéma flexible**: 4 types de capteurs avec structures distinctes
✅ **Pipelines d'agrégation**: 6+ pipelines avec $match, $group, $project
✅ **Indexation**: Index sur date_releve
✅ **Temps réel**: Simulation et affichage en temps réel

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v18+)
- MongoDB (v6+)
- npm ou yarn

### 1. Installation des dépendances backend

```bash
npm install
```

### 2. Installation des dépendances frontend

```bash
cd frontend
npm install
cd ..
```

### 3. Configuration

Vérifiez le fichier `.env` à la racine du projet:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/senguinee
NODE_ENV=development
```

### 4. Initialisation de la base de données

```bash
npm run seed
```

Cette commande va:
- Créer 25 capteurs de différents types
- Générer 2500+ relevés sur plusieurs jours
- Créer les indexes MongoDB nécessaires

### 5. Démarrage du backend

```bash
npm start
```

Ou en mode développement avec auto-reload:

```bash
npm run dev
```

Le backend sera accessible sur `http://localhost:3001`

### 6. Démarrage du frontend

```bash
cd frontend
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

### 7. Simulation temps réel (optionnel)

Pour simuler l'insertion de nouveaux relevés en temps réel:

```bash
node scripts/simulateRealTime.js
```

Cette commande génère un nouveau relevé toutes les 5 secondes et l'envoie via WebSocket.

## 📁 Structure du Projet

```
senguinee-iot/
├── models/                 # Modèles MongoDB
│   ├── Capteur.js         # Modèle des capteurs
│   └── Releve.js          # Modèle des relevés (schéma flexible)
├── routes/                # Routes API Express
│   ├── capteurs.js        # API capteurs
│   ├── releves.js         # API relevés
│   ├── statistiques.js    # API statistiques
│   ├── alertes.js         # API alertes
│   └── comparaison.js     # API comparaison
├── scripts/               # Scripts utilitaires
│   ├── seedDatabase.js    # Initialisation de la BD
│   └── simulateRealTime.js # Simulation temps réel
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/   # Composants React
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Historique.jsx
│   │   │   ├── Alertes.jsx
│   │   │   ├── Statistiques.jsx
│   │   │   ├── Comparaison.jsx
│   │   │   ├── Infrastructure.jsx
│   │   │   └── Navigation.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server.js              # Point d'entrée Express
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Capteurs
- `GET /api/capteurs` - Liste tous les capteurs
- `GET /api/capteurs/:id` - Détails d'un capteur
- `GET /api/capteurs/batiment/:batiment` - Capteurs par bâtiment
- `GET /api/capteurs/status/inactifs` - Capteurs sans récent relevé

### Relevés
- `GET /api/releves/derniers` - Derniers relevés (dashboard)
- `GET /api/releves/capteur/:capteurId` - Historique d'un capteur
- `POST /api/releves` - Ajouter un relevé

### Statistiques
- `GET /api/statistiques/capteur/:capteurId` - Stats par capteur
- `GET /api/statistiques/globales` - Stats globales

### Alertes
- `GET /api/alertes` - Liste des alertes
- `GET /api/alertes/resume` - Résumé par capteur

### Comparaison
- `GET /api/comparaison/batiment/:batiment` - Comparer capteurs d'un bâtiment
- `GET /api/comparaison/capteurs/:id1/:id2` - Comparer deux capteurs

## 🎯 Types de Capteurs

### Thermique
- Champ: `temperature_c`
- Unité: °C
- Seuil typique: 35-45°C

### Électrique
- Champ: `kwh`
- Unité: kWh
- Seuil typique: 50-100 kWh

### Humidité
- Champ: `humidite_pourcent`
- Unité: %
- Seuil typique: 70-90%

### Vibration
- Champ: `vibration_mm_s`
- Unité: mm/s
- Seuil typique: 5-10 mm/s

## 🔧 Pipelines d'Agrégation

Le système utilise 6+ pipelines d'agrégation MongoDB:

1. **Derniers relevés par capteur** (`$match` → `$sort` → `$group` → `$lookup` → `$project`)
2. **Historique avec filtre temporel** (`$match` → `$sort` → `$lookup` → `$project`)
3. **Statistiques par capteur** (`$match` → `$group` → `$project`)
4. **Détection des alertes** (`$match` → `$lookup` → `$addFields` → `$match` → `$project`)
5. **Résumé des alertes** (`$match` → `$lookup` → `$addFields` → `$match` → `$group` → `$project`)
6. **Comparaison par bâtiment** (`$match` → `$lookup` → `$addFields` → `$group` → `$project`)

Tous les pipelines commencent par `$match` pour filtrer les données au plus tôt.

## 📈 Performance

- **Index sur date_releve**: Optimise les requêtes temporelles
- **Index composite**: `(capteur_id, date_releve)` pour les requêtes par capteur
- **Pipelines optimisés**: Filtrage précoce avec `$match`

## 🧪 Tests

Pour vérifier le bon fonctionnement:

1. Vérifiez que MongoDB est en cours d'exécution
2. Exécutez `npm run seed` pour initialiser les données
3. Démarrez le backend avec `npm start`
4. Démarrez le frontend avec `cd frontend && npm run dev`
5. Optionnel: Lancez la simulation avec `node scripts/simulateRealTime.js`

## 📝 Notes

- Le système utilise MongoDB pour sa flexibilité de schéma
- Les données des capteurs sont hétérogènes et évolutives
- L'interface se met à jour en temps réel via WebSocket
- Les alertes sont détectées automatiquement selon les seuils configurés

## 🤝 Auteur

Projet réalisé pour le cours de développement Web - SensGuinée
