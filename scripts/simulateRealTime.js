const mongoose = require('mongoose');
const Capteur = require('../models/Capteur');
const Releve = require('../models/Releve');
const io = require('socket.io-client');
require('dotenv').config();

// Configuration
const INTERVALLE_MS = 5000; // 5 secondes entre chaque relevé

// Fonction pour générer une valeur aléatoire selon le type de capteur
function generateDonnees(capteur) {
  let donnees = {};
  
  switch(capteur.type) {
    case 'Thermique':
      // Température entre 18 et 42°C, avec possibilité de dépasser le seuil
      const baseTemp = 20 + Math.random() * 15;
      const temp = Math.random() > 0.9 ? baseTemp + 10 : baseTemp; // 10% de chance d'alerte
      donnees = {
        temperature_c: parseFloat(temp.toFixed(2)),
        qualite_signal: Math.floor(Math.random() * 30) + 70
      };
      break;
      
    case 'Électrique':
      // Consommation entre 10 et 120 kWh
      const baseKwh = 20 + Math.random() * 80;
      const kwh = Math.random() > 0.9 ? baseKwh + 30 : baseKwh;
      donnees = {
        kwh: parseFloat(kwh.toFixed(2)),
        tension_v: Math.floor(Math.random() * 20) + 220,
        intensite_a: parseFloat((5 + Math.random() * 25).toFixed(2))
      };
      break;
      
    case 'Humidité':
      // Humidité entre 30 et 95%
      const baseHum = 40 + Math.random() * 40;
      const hum = Math.random() > 0.9 ? baseHum + 20 : baseHum;
      donnees = {
        humidite_pourcent: parseFloat(hum.toFixed(2)),
        temperature_c: parseFloat((18 + Math.random() * 10).toFixed(2))
      };
      break;
      
    case 'Vibration':
      // Vibration entre 0 et 12 mm/s
      const baseVib = Math.random() * 8;
      const vib = Math.random() > 0.9 ? baseVib + 5 : baseVib;
      donnees = {
        vibration_mm_s: parseFloat(vib.toFixed(2)),
        frequence_hz: Math.floor(Math.random() * 90) + 10,
        amplitude_mm: parseFloat((Math.random() * 5).toFixed(3))
      };
      break;
  }
  
  return donnees;
}

// Simulation en temps réel
async function simulateRealTime() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senguinee');
    console.log('MongoDB connecté');
    
    // Connexion WebSocket au serveur
    const socket = io('http://localhost:3001');
    socket.on('connect', () => {
      console.log('WebSocket connecté au serveur');
    });
    
    // Récupérer les capteurs actifs
    const capteurs = await Capteur.find({ actif: true });
    console.log(`${capteurs.length} capteurs actifs trouvés`);
    
    if (capteurs.length === 0) {
      console.log('Aucun capteur actif. Exécutez d\'abord: npm run seed');
      process.exit(1);
    }
    
    let index = 0;
    
    // Boucle de simulation
    setInterval(async () => {
      const capteur = capteurs[index % capteurs.length];
      index++;
      
      try {
        const donnees = generateDonnees(capteur);
        
        const nouveauReleve = new Releve({
          capteur_id: capteur.capteur_id,
          date_releve: new Date(),
          donnees: donnees
        });
        
        await nouveauReleve.save();
        
        // Émettre l'événement via WebSocket
        socket.emit('nouveau-releve', nouveauReleve);
        
        // Vérifier si c'est une alerte
        const valeur = Object.values(donnees)[0];
        const estAlerte = valeur > capteur.seuil_alerte;
        
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        const status = estAlerte ? '⚠️ ALERTE' : '✅ OK';
        console.log(`[${timestamp}] ${capteur.nom} (${capteur.type}): ${valeur.toFixed(2)} - ${status}`);
        
      } catch (error) {
        console.error(`Erreur pour le capteur ${capteur.capteur_id}:`, error.message);
      }
    }, INTERVALLE_MS);
    
    console.log(`\nSimulation démarrée. Intervalle: ${INTERVALLE_MS / 1000}s`);
    console.log('Appuyez sur Ctrl+C pour arrêter\n');
    
  } catch (error) {
    console.error('Erreur lors de la simulation:', error);
    process.exit(1);
  }
}

simulateRealTime();
