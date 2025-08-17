const mongoose = require('mongoose');

const CiudadSchema = new mongoose.Schema({
  nombreCiudad: { 
    type: String, 
    required: [true, 'El nombre de la ciudad es obligatorio'], 
    trim: true,
    minlength: [2, 'El nombre de la ciudad debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre de la ciudad no puede superar los 100 caracteres'],
    match: [/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre de la ciudad solo puede contener letras y espacios']
  },
  departamento: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Departamento', 
    required: [true, 'El departamento es obligatorio']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ciudad', CiudadSchema);
