const mongoose = require('mongoose');

/**
 * Emprendimiento - esquema de Mongoose
 * @typedef {Object} Emprendimiento
 * @property {import('mongoose').Types.ObjectId} usuario - Referencia al usuario propietario
 * @property {string} nombreEmprendimiento - Nombre del emprendimiento
 * @property {string} [descripcionEmprendimiento] - Descripción del emprendimiento
 * @property {Date} fechaRegistro - Fecha de creación
 * @property {boolean} emprendimientoActivo - Si el emprendimiento está activo
 * @property {boolean} emprendimientoEliminado - Si el emprendimiento fue eliminado lógicamente
 * @property {{departamento:string, ciudad:string}} ubicacionEmprendimiento - Ubicación (departamento y ciudad)
 * @property {string} [logo] - URL del logo (opcional)
 */
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
  emprendimientoEliminado: {
    type: Boolean,
    default: false,
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
    // Aceptar varias extensiones comunes (jpg, jpeg, jfif, png, gif, webp, avif, svg, heic, heif)
    match: [/^https?:\/\/.+\.(jpg|jpeg|jfif|png|gif|webp|avif|svg|heic|heif)$/i, 'La URL del logo no es válida']
  },
}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente

module.exports = mongoose.model('Emprendimiento', EmprendimientoSchema);