const mongoose = require('mongoose');

const EmprendimientoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', 
    required: true
  },
  nombreEmprendimiento: { 
    type: String, 
    required: [true, 'El nombre del emprendimiento es obligatorio'], 
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede superar los 100 caracteres']
  },
  descripcionEmprendimiento: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede superar los 500 caracteres']
  },
  fechaRegistro: { 
    type: Date, 
    default: Date.now, 
    required: true
  },
  emprendimientoActivo: { 
    type: Boolean, 
    default: true,
    required: true
  },
  ubicacionEmprendimiento: {
    departamento: {
      type: String,
      required: true
    },
    ciudad: {
      type: String,
      required: true
    }
  },
  logo: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/, 'La URL del logo no es válida']
  },
}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente

module.exports = mongoose.model('Emprendimiento', EmprendimientoSchema);