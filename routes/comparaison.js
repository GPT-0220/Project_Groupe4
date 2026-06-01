const express = require('express');
const router = express.Router();
const Releve = require('../models/Releve');
const Capteur = require('../models/Capteur');
const { auth } = require('../middleware/auth');

// Comparer les capteurs d'un même bâtiment
router.get('/batiment/:batiment', auth, async (req, res) => {
  try {
    const { batiment } = req.params;
    const { dateDebut, dateFin, type } = req.query;
    
    let matchStage = {};
    if (dateDebut || dateFin) {
      matchStage.date_releve = {};
      if (dateDebut) matchStage.date_releve.$gte = new Date(dateDebut);
      if (dateFin) matchStage.date_releve.$lte = new Date(dateFin);
    }
    
    // Récupérer d'abord les capteurs du bâtiment
    let capteurMatch = { batiment: batiment };
    if (type) capteurMatch.type = type;
    
    const capteurs = await Capteur.find(capteurMatch);
    const capteurIds = capteurs.map(c => c.capteur_id);
    
    if (capteurIds.length === 0) {
      return res.json([]);
    }
    
    matchStage.capteur_id = { $in: capteurIds };
    
    // Pipeline d'agrégation pour la comparaison
    const comparaison = await Releve.aggregate([
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
          valeur: {
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
        $group: {
          _id: '$capteur_id',
          nom: { $first: '$capteur_info.nom' },
          type: { $first: '$capteur_info.type' },
          etage: { $first: '$capteur_info.etage' },
          salle: { $first: '$capteur_info.salle' },
          minimum: { $min: '$valeur' },
          maximum: { $max: '$valeur' },
          moyenne: { $avg: '$valeur' },
          nombre_releves: { $sum: 1 },
          seuil_alerte: { $first: '$capteur_info.seuil_alerte' },
          depassements_seuil: {
            $sum: {
              $cond: [
                { $gt: ['$valeur', '$capteur_info.seuil_alerte'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          capteur_id: '$_id',
          nom: 1,
          type: 1,
          etage: 1,
          salle: 1,
          minimum: { $round: ['$minimum', 2] },
          maximum: { $round: ['$maximum', 2] },
          moyenne: { $round: ['$moyenne', 2] },
          nombre_releves: 1,
          seuil_alerte: 1,
          depassements_seuil: 1,
          taux_depassement: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ['$depassements_seuil', '$nombre_releves']
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: { moyenne: -1 }
      }
    ]);
    
    res.json(comparaison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comparer deux capteurs spécifiques
router.get('/capteurs/:capteurId1/:capteurId2', auth, async (req, res) => {
  try {
    const { capteurId1, capteurId2 } = req.params;
    const { dateDebut, dateFin } = req.query;
    
    let matchStage = {
      capteur_id: { $in: [capteurId1, capteurId2] }
    };
    
    if (dateDebut || dateFin) {
      matchStage.date_releve = {};
      if (dateDebut) matchStage.date_releve.$gte = new Date(dateDebut);
      if (dateFin) matchStage.date_releve.$lte = new Date(dateFin);
    }
    
    // Pipeline d'agrégation pour la comparaison de deux capteurs
    const comparaison = await Releve.aggregate([
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
          valeur: {
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
        $group: {
          _id: '$capteur_id',
          nom: { $first: '$capteur_info.nom' },
          type: { $first: '$capteur_info.type' },
          batiment: { $first: '$capteur_info.batiment' },
          etage: { $first: '$capteur_info.etage' },
          minimum: { $min: '$valeur' },
          maximum: { $max: '$valeur' },
          moyenne: { $avg: '$valeur' },
          nombre_releves: { $sum: 1 },
          seuil_alerte: { $first: '$capteur_info.seuil_alerte' }
        }
      },
      {
        $project: {
          _id: 0,
          capteur_id: '$_id',
          nom: 1,
          type: 1,
          batiment: 1,
          etage: 1,
          minimum: { $round: ['$minimum', 2] },
          maximum: { $round: ['$maximum', 2] },
          moyenne: { $round: ['$moyenne', 2] },
          nombre_releves: 1,
          seuil_alerte: 1
        }
      }
    ]);
    
    res.json(comparaison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
