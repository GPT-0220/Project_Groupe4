const mongoose = require('mongoose');

const releveSchema = new mongoose.Schema({
  capteur_id: {
    type: String,
    required: true,
    index: true
  },
  date_releve: {
    type: Date,
    required: true,
    index: true
  },
  donnees: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Index composite pour optimiser les requêtes temporelles par capteur
releveSchema.index({ capteur_id: 1, date_releve: -1 });

module.exports = mongoose.model('Releve', releveSchema);
