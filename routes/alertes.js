const express = require('express');
const router = express.Router();
const Releve = require('../models/Releve');
const Capteur = require('../models/Capteur');
const { auth } = require('../middleware/auth');

// Détecter les alertes (relevés dépassant les seuils)
router.get('/', auth, async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    
    let matchStage = {};
    if (dateDebut || dateFin) {
      matchStage.date_releve = {};
      if (dateDebut) matchStage.date_releve.$gte = new Date(dateDebut);
      if (dateFin) matchStage.date_releve.$lte = new Date(dateFin);
    }
    
    // Pipeline d'agrégation pour détecter les alertes
    const alertes = await Releve.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'capteurs',
          localField: 'capteur_id',
          foreignField: 'capteur_id',
          as: 'capteur_info'
        }
      },
      {
        $unwind: '$capteur_info'
      },
      {
        $addFields: {
          // Déterminer la valeur à vérifier selon le type de capteur
          valeur_verifiee: {
            $switch: {
              branches: [
                { case: { $eq: ['$capteur_info.type', 'Thermique'] }, then: '$donnees.temperature_c' },
                { case: { $eq: ['$capteur_info.type', 'Électrique'] }, then: '$donnees.kwh' },
                { case: { $eq: ['$capteur_info.type', 'Humidité'] }, then: '$donnees.humidite_pourcent' },
                { case: { $eq: ['$capteur_info.type', 'Vibration'] }, then: '$donnees.vibration_mm_s' }
              ],
              default: null
            }
          }
        }
      },
      {
        $match: {
          valeur_verifiee: { $gt: '$capteur_info.seuil_alerte' }
        }
      },
      {
        $project: {
          _id: 0,
          capteur_id: 1,
          date_releve: 1,
          donnees: 1,
          valeur_verifiee: 1,
          seuil_alerte: '$capteur_info.seuil_alerte',
          type: '$capteur_info.type',
          nom: '$capteur_info.nom',
          batiment: '$capteur_info.batiment',
          etage: '$capteur_info.etage',
          salle: '$capteur_info.salle',
          gravite: {
            $cond: {
              if: { $gt: ['$valeur_verifiee', { $multiply: ['$capteur_info.seuil_alerte', 1.5] }] },
              then: 'CRITIQUE',
              else: 'WARNING'
            }
          }
        }
      },
      {
        $sort: { date_releve: -1 }
      }
    ]);
    
    res.json(alertes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compter les alertes par capteur
router.get('/resume', auth, async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    
    let matchStage = {};
    if (dateDebut || dateFin) {
      matchStage.date_releve = {};
      if (dateDebut) matchStage.date_releve.$gte = new Date(dateDebut);
      if (dateFin) matchStage.date_releve.$lte = new Date(dateFin);
    }
    
    // Pipeline d'agrégation pour le résumé des alertes
    const resumeAlertes = await Releve.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'capteurs',
          localField: 'capteur_id',
          foreignField: 'capteur_id',
          as: 'capteur_info'
        }
      },
      {
        $unwind: '$capteur_info'
      },
      {
        $addFields: {
          valeur_verifiee: {
            $switch: {
              branches: [
                { case: { $eq: ['$capteur_info.type', 'Thermique'] }, then: '$donnees.temperature_c' },
                { case: { $eq: ['$capteur_info.type', 'Électrique'] }, then: '$donnees.kwh' },
                { case: { $eq: ['$capteur_info.type', 'Humidité'] }, then: '$donnees.humidite_pourcent' },
                { case: { $eq: ['$capteur_info.type', 'Vibration'] }, then: '$donnees.vibration_mm_s' }
              ],
              default: null
            }
          }
        }
      },
      {
        $match: {
          valeur_verifiee: { $gt: '$capteur_info.seuil_alerte' }
        }
      },
      {
        $group: {
          _id: '$capteur_id',
          nom: { $first: '$capteur_info.nom' },
          type: { $first: '$capteur_info.type' },
          batiment: { $first: '$capteur_info.batiment' },
          nombre_alertes: { $sum: 1 },
          valeur_max: { $max: '$valeur_verifiee' },
          seuil_alerte: { $first: '$capteur_info.seuil_alerte' },
          derniere_alerte: { $max: '$date_releve' }
        }
      },
      {
        $project: {
          _id: 0,
          capteur_id: '$_id',
          nom: 1,
          type: 1,
          batiment: 1,
          nombre_alertes: 1,
          valeur_max: { $round: ['$valeur_max', 2] },
          seuil_alerte: 1,
          derniere_alerte: 1
        }
      },
      {
        $sort: { nombre_alertes: -1 }
      }
    ]);
    
    res.json(resumeAlertes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
