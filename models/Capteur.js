const mongoose = require('mongoose');

const capteurSchema = new mongoose.Schema({
  capteur_id: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Thermique', 'Électrique', 'Humidité', 'Vibration']
  },
  batiment: {
    type: String,
    required: true
  },
  etage: {
    type: Number,
    required: true
  },
  salle: {
    type: String,
    required: true
  },
  seuil_alerte: {
    type: Number,
    required: true
  },
  actif: {
    type: Boolean,
    default: true
  },
  date_installation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
capteurSchema.index({ capteur_id: 1 });
capteurSchema.index({ batiment: 1, etage: 1 });
capteurSchema.index({ type: 1 });

module.exports = mongoose.model('Capteur', capteurSchema);
