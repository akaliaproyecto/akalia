const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  tituloProducto:
    { type: String, required: true, trim: true, minLength: 3, maxLength: 100 },

  idEmprendimiento:
    { type: mongoose.Schema.Types.ObjectId, ref: 'Emprendimiento', required: true },

  descripcionProducto:
    { type: String, required: true, trim: true, minLength: 3, maxLength: 1000 },

  precio:
    { type: Number, required: true, min: 0, default: 0 },

  // Campo para manejar el borrado lógico
  productoActivo: {
    type: Boolean,
    default: true,
    required: true
  },
  productoEliminado: {
    type: Boolean,
    default: false,
    required: true
  },

  imagenes: {
    type: [String], // Array de URLs de imágenes
    validate: [
      {
        validator: function (value) {
          return value.length >= 1 && value.length <= 10;
        },
        message: 'Debes proporcionar entre 1 y 10 imágenes'
      },
      {
        validator: function (value) {
          // Validar que todas las URLs apunten a imágenes con extensiones permitidas
          return value.every(url => /^https?:\/\/.+\.(jpg|jpeg|jfif|png|gif|webp|avif|svg|heic|heif)$/i.test(url));
        },
        message: 'Todas las imágenes deben ser URLs válidas con formato jpg, jpeg, png, gif o svg'
      }
    ]
  },
  categoria: { type: String, required: true },
  etiquetas: {
    type: [{ type: String, required: true }],
    validate: {
      validator: function (value) {
        return value.length >= 1 && value.length <= 10;
      },
      message: 'Debes proporcionar entre 1 y 10 etiquetas'
    }
  },
}, { timestamps: true });

module.exports = mongoose.model('Producto', ProductoSchema);