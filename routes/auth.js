const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email ou nom d\'utilisateur est déjà utilisé' });
    }
    
    // Créer le nouvel utilisateur
    const user = new User({
      username,
      email,
      password,
      role: role || 'user'
    });
    
    await user.save();
    
    // Générer le token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'votre_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'votre_secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Connexion réussie',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vérifier le token
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;
