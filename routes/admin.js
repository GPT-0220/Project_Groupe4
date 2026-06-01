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

module.exports = router;
