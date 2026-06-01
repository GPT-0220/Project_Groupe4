const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
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
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Droits administratifs requis' });
    }
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Accès refusé' });
  }
};

module.exports = { auth, adminAuth };
