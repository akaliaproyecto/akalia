const mongoose = require('mongoose');

const EtiquetaSchema = new mongoose.Schema({
  nombreEtiqueta: { 
    type: String, 
    required: [true, 'El nombre de la etiqueta es obligatorio'],
    trim: true,
    minlength: [2, 'La etiqueta debe tener al menos 2 caracteres'],
    maxlength: [50, 'La etiqueta no puede superar los 50 caracteres'],
    match: [/^[a-zA-ZÀ-ÿ0-9\s]+$/, 'La etiqueta solo puede contener letras, números y espacios']
  }
}, {
  timestamps: true // Guarda fecha de creación y actualización
});

module.exports = mongoose.model('Etiqueta', EtiquetaSchema);
