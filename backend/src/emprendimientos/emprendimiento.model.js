const mongoose = require('mongoose');

const EmprendimientoSchema = new mongoose.Schema({
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
  estadoEmprendimiento: { 
    type: String, 
    enum: {
      values: ['activo', 'inactivo'],
      message: 'El estado debe ser "activo" o "inactivo"'
    },
    required: true,
    default: 'activo'
  },
  ubicacionEmprendimiento: {
    idDepartamento: { 
      type: String,  
      required: true },
    idCiudad: { 
      type: String, 
      required: true }
  },
  urlLogoEmprendimiento: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/, 'La URL del logo no es válida']
  },
}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente

module.exports = mongoose.model('Emprendimiento', EmprendimientoSchema);