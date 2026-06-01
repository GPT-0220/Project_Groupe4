const express = require('express');
const router = express.Router();
const Releve = require('../models/Releve');
const Capteur = require('../models/Capteur');
const { auth } = require('../middleware/auth');

// Calculer les statistiques (min, max, moyenne) pour un capteur sur une période
router.get('/capteur/:capteurId', auth, async (req, res) => {
  try {
    const { capteurId } = req.params;
    const { dateDebut, dateFin } = req.query;
    
    let matchStage = { capteur_id: capteurId };
    
    if (dateDebut || dateFin) {
      matchStage.date_releve = {};
      if (dateDebut) matchStage.date_releve.$gte = new Date(dateDebut);
      if (dateFin) matchStage.date_releve.$lte = new Date(dateFin);
    }
    
    // Récupérer d'abord les infos du capteur pour connaître son type
    const capteur = await Capteur.findOne({ capteur_id: capteurId });
    if (!capteur) {
      return res.status(404).json({ error: 'Capteur non trouvé' });
    }
    
    // Déterminer le champ de données selon le type de capteur
    let champDonnee;
    switch(capteur.type) {
      case 'Thermique':
        champDonnee = '$donnees.temperature_c';
        break;
      case 'Électrique':
        champDonnee = '$donnees.kwh';
        break;
      case 'Humidité':
        champDonnee = '$donnees.humidite_pourcent';
        break;
      case 'Vibration':
        champDonnee = '$donnees.vibration_mm_s';
        break;
      default:
        return res.status(400).json({ error: 'Type de capteur non reconnu' });
    }
    
    // Pipeline d'agrégation pour les statistiques
    const statistiques = await Releve.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: '$capteur_id',
          minimum: { $min: champDonnee },
          maximum: { $max: champDonnee },
          moyenne: { $avg: champDonnee },
          nombre_releves: { $sum: 1 },
          date_premier_releve: { $min: '$date_releve' },
          date_dernier_releve: { $max: '$date_releve' }
        }
      },
      {
        $project: {
          _id: 0,
          capteur_id: '$_id',
          minimum: { $round: ['$minimum', 2] },
          maximum: { $round: ['$maximum', 2] },
          moyenne: { $round: ['$moyenne', 2] },
          nombre_releves: 1,
          date_premier_releve: 1,
          date_dernier_releve: 1
        }
      }
    ]);
    
    if (statistiques.length === 0) {
      return res.json({
        capteur_id: capteurId,
        minimum: null,
        maximum: null,
        moyenne: null,
        nombre_releves: 0
      });
    }
    
    res.json(statistiques[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculer les statistiques globales par type de capteur
router.get('/globales', auth, async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    
    let matchStage = {};
    if (dateDebut || dateFin) {
      matchStage.date_releve = {};
      if (dateDebut) matchStage.date_releve.$gte = new Date(dateDebut);
      if (dateFin) matchStage.date_releve.$lte = new Date(dateFin);
    }
    
    // Pipeline d'agrégation pour les statistiques globales
    const statistiquesGlobales = await Releve.aggregate([
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
        $group: {
          _id: '$capteur_info.type',
          nombre_capteurs: { $addToSet: '$capteur_id' },
          total_releves: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          nombre_capteurs: { $size: '$nombre_capteurs' },
          total_releves: 1
        }
      }
    ]);
    
    res.json(statistiquesGlobales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
