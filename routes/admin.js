const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Releve = require('../models/Releve');
const Capteur = require('../models/Capteur');
const { auth, adminAuth } = require('../middleware/auth');

// Récupérer tous les utilisateurs (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un utilisateur (admin only)
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email ou nom d\'utilisateur est déjà utilisé' });
    }
    
    const user = new User({
      username,
      email,
      password,
      role: role || 'user'
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un utilisateur (admin only)
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    
    await user.save();
    
    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un utilisateur (admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    if (user.email === 'admin@senguinee.com') {
      return res.status(403).json({ error: 'Impossible de supprimer l\'administrateur principal' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Réinitialiser le mot de passe d'un utilisateur (admin only)
router.post('/users/:id/reset-password', adminAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistiques système (admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const capteurCount = await Capteur.countDocuments();
    const releveCount = await Releve.countDocuments();
    const activeCapteurs = await Capteur.countDocuments({ actif: true });
    const inactiveCapteurs = await Capteur.countDocuments({ actif: false });
    
    const stats = {
      users: userCount,
      capteurs: capteurCount,
      releves: releveCount,
      activeCapteurs,
      inactiveCapteurs
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logs d'activité système (admin only)
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // Pour l'instant, retourner les utilisateurs récents comme logs
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    const logs = recentUsers.map(user => ({
      timestamp: user.createdAt,
      action: 'USER_CREATED',
      details: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }));
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GESTION DES CAPTEURS ====================

// Récupérer tous les capteurs (admin only)
router.get('/capteurs', adminAuth, async (req, res) => {
  try {
    const capteurs = await Capteur.find().sort({ batiment: 1, type: 1 });
    res.json(capteurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouveau capteur (admin only)
router.post('/capteurs', adminAuth, async (req, res) => {
  try {
    const { capteur_id, nom, type, batiment, etage, salle, seuil_alerte, seuil_min, seuil_max, unite } = req.body;
    
    // Vérifier si le capteur existe déjà
    const existingCapteur = await Capteur.findOne({ capteur_id });
    if (existingCapteur) {
      return res.status(400).json({ error: 'Ce capteur_id est déjà utilisé' });
    }
    
    const capteur = new Capteur({
      capteur_id,
      nom,
      type,
      batiment,
      etage,
      salle,
      seuil_alerte,
      actif: true
    });
    
    await capteur.save();
    
    res.status(201).json({
      message: 'Capteur créé avec succès',
      capteur
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un capteur (admin only)
router.put('/capteurs/:id', adminAuth, async (req, res) => {
  try {
    const { nom, type, batiment, etage, salle, seuil_alerte, actif } = req.body;
    
    const capteur = await Capteur.findById(req.params.id);
    if (!capteur) {
      return res.status(404).json({ error: 'Capteur non trouvé' });
    }
    
    if (nom) capteur.nom = nom;
    if (type) capteur.type = type;
    if (batiment) capteur.batiment = batiment;
    if (etage !== undefined) capteur.etage = etage;
    if (salle) capteur.salle = salle;
    if (seuil_alerte !== undefined) capteur.seuil_alerte = seuil_alerte;
    if (actif !== undefined) capteur.actif = actif;
    
    await capteur.save();
    
    res.json({
      message: 'Capteur mis à jour avec succès',
      capteur
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un capteur (admin only)
router.delete('/capteurs/:id', adminAuth, async (req, res) => {
  try {
    const capteur = await Capteur.findById(req.params.id);
    if (!capteur) {
      return res.status(404).json({ error: 'Capteur non trouvé' });
    }
    
    // Supprimer aussi tous les relevés associés
    await Releve.deleteMany({ capteur_id: capteur.capteur_id });
    
    await Capteur.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Capteur et ses relevés supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activer/Désactiver un capteur (admin only)
router.patch('/capteurs/:id/toggle', adminAuth, async (req, res) => {
  try {
    const capteur = await Capteur.findById(req.params.id);
    if (!capteur) {
      return res.status(404).json({ error: 'Capteur non trouvé' });
    }
    
    capteur.actif = !capteur.actif;
    await capteur.save();
    
    res.json({
      message: `Capteur ${capteur.actif ? 'activé' : 'désactivé'} avec succès`,
      capteur
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les capteurs par bâtiment (admin only)
router.get('/capteurs/batiment/:batiment', adminAuth, async (req, res) => {
  try {
    const capteurs = await Capteur.find({ batiment: req.params.batiment }).sort({ type: 1 });
    res.json(capteurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
