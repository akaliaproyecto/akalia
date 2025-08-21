const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  nombreCategoria: { 
    type: String, 
    required: [true, 'El nombre de la categoría es obligatorio'],
    trim: true,
    unique: [true, 'El nombre de la categoría no debe repetirse'],
    minlength: [2, 'La categoría debe tener al menos 2 caracteres'],
    maxlength: [50, 'La categoría no puede superar los 50 caracteres'],
    match: [/^[a-zA-ZÀ-ÿ0-9\s]+$/, 'La categoría solo puede contener letras, números y espacios']
  },
  imagen: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/, 'La URL de la imagen no es válida']
  },
  categoriaActiva: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Guarda fecha de creación y actualización
});

module.exports = mongoose.model('Categoria', CategoriaSchema);
