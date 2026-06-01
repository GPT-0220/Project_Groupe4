const mongoose = require('mongoose');
const Capteur = require('../models/Capteur');
const Releve = require('../models/Releve');
require('dotenv').config();

// Configuration
const NOMBRE_CAPTEURS = 25;
const NOMBRE_RELEVES_PAR_CAPTEUR = 100;
const TYPES_CAPTEURS = ['Thermique', 'Électrique', 'Humidité', 'Vibration'];
const BATIMENTS = ['A', 'B', 'C', 'D'];
const SALLES = ['Salle 101', 'Salle 102', 'Salle 201', 'Salle 202', 'Laboratoire', 'Bureau', 'Stockage'];

// Générateur de données aléatoires
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCapteurId(index) {
  return `CAP-${String(index).padStart(4, '0')}`;
}

// Générer les données des capteurs
async function generateCapteurs() {
  const capteurs = [];
  
  for (let i = 1; i <= NOMBRE_CAPTEURS; i++) {
    const type = randomItem(TYPES_CAPTEURS);
    let seuil_alerte;
    
    // Définir le seuil d'alerte selon le type de capteur
    switch(type) {
      case 'Thermique':
        seuil_alerte = randomInt(35, 45); // Température en °C
        break;
      case 'Électrique':
        seuil_alerte = randomInt(50, 100); // Consommation en kWh
        break;
      case 'Humidité':
        seuil_alerte = randomInt(70, 90); // Humidité en %
        break;
      case 'Vibration':
        seuil_alerte = randomInt(5, 10); // Vibration en mm/s
        break;
    }
    
    capteurs.push({
      capteur_id: generateCapteurId(i),
      nom: `Capteur ${type} ${i}`,
      type: type,
      batiment: `Bâtiment ${randomItem(BATIMENTS)}`,
      etage: randomInt(0, 3),
      salle: randomItem(SALLES),
      seuil_alerte: seuil_alerte,
      actif: Math.random() > 0.1, // 90% actifs
      date_installation: new Date(Date.now() - randomInt(30, 365) * 24 * 60 * 60 * 1000)
    });
  }
  
  return capteurs;
}

// Générer les données des relevés avec schéma flexible
async function generateReleves(capteurs) {
  const releves = [];
  const maintenant = new Date();
  
  for (const capteur of capteurs) {
    for (let i = 0; i < NOMBRE_RELEVES_PAR_CAPTEUR; i++) {
      // Générer une date aléatoire sur les 7 derniers jours
      const dateReleve = new Date(maintenant.getTime() - randomInt(0, 7 * 24 * 60 * 60 * 1000));
      
      let donnees = {};
      
      // Structure flexible selon le type de capteur
      switch(capteur.type) {
        case 'Thermique':
          donnees = {
            temperature_c: parseFloat((randomInt(18, 42) + Math.random()).toFixed(2)),
            qualite_signal: randomInt(70, 100)
          };
          break;
        case 'Électrique':
          donnees = {
            kwh: parseFloat((randomInt(10, 120) + Math.random()).toFixed(2)),
            tension_v: randomInt(220, 240),
            intensite_a: parseFloat((randomInt(5, 30) + Math.random()).toFixed(2))
          };
          break;
        case 'Humidité':
          donnees = {
            humidite_pourcent: parseFloat((randomInt(30, 95) + Math.random()).toFixed(2)),
            temperature_c: parseFloat((randomInt(18, 28) + Math.random()).toFixed(2))
          };
          break;
        case 'Vibration':
          donnees = {
            vibration_mm_s: parseFloat((randomInt(0, 12) + Math.random()).toFixed(2)),
            frequence_hz: randomInt(10, 100),
            amplitude_mm: parseFloat((randomInt(0, 5) + Math.random() * 0.1).toFixed(3))
          };
          break;
      }
      
      releves.push({
        capteur_id: capteur.capteur_id,
        date_releve: dateReleve,
        donnees: donnees
      });
    }
  }
  
  return releves;
}

// Seed de la base de données
async function seedDatabase() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senguinee');
    console.log('MongoDB connecté');
    
    // Nettoyer les collections existantes
    console.log('Nettoyage des collections existantes...');
    await Capteur.deleteMany({});
    await Releve.deleteMany({});
    
    // Générer et insérer les capteurs
    console.log('Génération des capteurs...');
    const capteurs = await generateCapteurs();
    await Capteur.insertMany(capteurs);
    console.log(`${capteurs.length} capteurs insérés`);
    
    // Générer et insérer les relevés
    console.log('Génération des relevés...');
    const releves = await generateReleves(capteurs);
    await Releve.insertMany(releves);
    console.log(`${releves.length} relevés insérés`);
    
    // Créer l'index sur date_releve
    console.log('Création des indexes...');
    await Releve.collection.createIndex({ date_releve: -1 });
    console.log('Index sur date_releve créé');
    
    console.log('Seed terminé avec succès!');
    console.log(`- ${capteurs.length} capteurs`);
    console.log(`- ${releves.length} relevés`);
    
    // Afficher un exemple de chaque type de capteur
    console.log('\nExemples de capteurs par type:');
    for (const type of TYPES_CAPTEURS) {
      const exemple = capteurs.find(c => c.type === type);
      if (exemple) {
        const releveExemple = releves.find(r => r.capteur_id === exemple.capteur_id);
        console.log(`\n${type}:`);
        console.log(`  Capteur: ${exemple.nom} (${exemple.capteur_id})`);
        console.log(`  Seuil alerte: ${exemple.seuil_alerte}`);
        console.log(`  Données: ${JSON.stringify(releveExemple.donnees)}`);
      }
    }
    
  } catch (error) {
    console.error('Erreur lors du seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDéconnexion MongoDB');
  }
}

seedDatabase();
