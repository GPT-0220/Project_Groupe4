const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function seedAdmin() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senguinee');
    console.log('MongoDB connecté');
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@senguinee.com' });
    if (existingAdmin) {
      console.log('L\'administrateur existe déjà');
      console.log('Email: admin@senguinee.com');
      console.log('Mot de passe: admin123');
      return;
    }
    
    // Créer l'administrateur
    const admin = new User({
      username: 'admin',
      email: 'admin@senguinee.com',
      password: 'admin123',
      role: 'admin'
    });
    
    await admin.save();
    console.log('Administrateur créé avec succès!');
    console.log('Email: admin@senguinee.com');
    console.log('Mot de passe: admin123');
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDéconnexion MongoDB');
  }
}

seedAdmin();
