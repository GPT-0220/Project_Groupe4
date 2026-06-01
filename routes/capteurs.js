const express = require('express');
const router = express.Router();
const Capteur = require('../models/Capteur');
const Releve = require('../models/Releve');
const { auth } = require('../middleware/auth');

// Récupérer tous les capteurs
router.get('/', auth, async (req, res) => {
  try {
    const capteurs = await Capteur.find().sort({ batiment: 1, etage: 1, salle: 1 });
    res.json(capteurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un capteur par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const capteur = await Capteur.findOne({ capteur_id: req.params.id });
    if (!capteur) {
      return res.status(404).json({ error: 'Capteur non trouvé' });
    }
    res.json(capteur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les capteurs par bâtiment
router.get('/batiment/:batiment', auth, async (req, res) => {
  try {
    const capteurs = await Capteur.find({ batiment: req.params.batiment });
    res.json(capteurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les capteurs inactifs (plus d'une heure sans relevé)
router.get('/status/inactifs', auth, async (req, res) => {
  try {
    const uneHeureIlYA = new Date(Date.now() - 60 * 60 * 1000);
    
    // Pipeline d'agrégation pour détecter les capteurs inactifs
    const capteursInactifs = await Capteur.aggregate([
      {
        $match: {
          actif: true
        }
      },
      {
        $lookup: {
          from: 'releves',
          let: { capteurId: '$capteur_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$capteur_id', '$$capteurId'] },
                    { $gte: ['$date_releve', uneHeureIlYA] }
                  ]
                }
              }
            },
            {
              $limit: 1
            }
          ],
          as: 'dernier_releve'
        }
      },
      {
        $match: {
          dernier_releve: { $eq: [] }
        }
      },
      {
        $project: {
          capteur_id: 1,
          nom: 1,
          type: 1,
          batiment: 1,
          etage: 1,
          salle: 1,
          actif: 1,
          date_installation: 1
        }
      }
    ]);
    
    res.json(capteursInactifs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
