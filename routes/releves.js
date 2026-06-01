const express = require('express');
const router = express.Router();
const Releve = require('../models/Releve');
const Capteur = require('../models/Capteur');
const { auth } = require('../middleware/auth');

// Récupérer le dernier relevé de tous les capteurs (tableau de bord temps réel)
router.get('/derniers', auth, async (req, res) => {
  try {
    // Pipeline d'agrégation pour obtenir le dernier relevé par capteur
    const derniersReleves = await Releve.aggregate([
      {
        $match: {
          date_releve: { $exists: true }
        }
      },
      {
        $sort: { date_releve: -1 }
      },
      {
        $group: {
          _id: '$capteur_id',
          dernier_releve: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$dernier_releve' }
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
        $project: {
          capteur_id: 1,
          date_releve: 1,
          donnees: 1,
          'capteur_info.nom': 1,
          'capteur_info.type': 1,
          'capteur_info.batiment': 1,
          'capteur_info.etage': 1,
          'capteur_info.salle': 1,
          'capteur_info.seuil_alerte': 1
        }
      }
    ]);
    
    res.json(derniersReleves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer l'historique d'un capteur avec filtre de dates
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
    
    // Pipeline d'agrégation avec filtre temporel
    const historique = await Releve.aggregate([
      {
        $match: matchStage
      },
      {
        $sort: { date_releve: -1 }
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
        $project: {
          capteur_id: 1,
          date_releve: 1,
          donnees: 1,
          'capteur_info.nom': 1,
          'capteur_info.type': 1,
          'capteur_info.seuil_alerte': 1
        }
      }
    ]);
    
    res.json(historique);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un nouveau relevé (pour la simulation temps réel)
router.post('/', auth, async (req, res) => {
  try {
    const releve = new Releve(req.body);
    await releve.save();
    
    // Émettre l'événement WebSocket pour le temps réel
    const io = req.app.get('io');
    io.emit('nouveau-releve', releve);
    
    res.status(201).json(releve);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
