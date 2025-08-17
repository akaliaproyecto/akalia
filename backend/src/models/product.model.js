const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  tituloProducto: { type: String, required: true, trim: true, minLength: 3, maxLength: 100 },
  idEmprendimiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Emprendimiento', required: true },
  descripcionProducto: { type: String, required: true, trim: true, minLength: 3, maxLength: 1000 },
  precio: { type: Number, required: true, min: 0, default: 0 },
  estadoProducto: { type: String, enum: ['activo', 'inactivo'], default: 'activo', required: true },
  fechaPublicacion: { type: Date, required: true, default: Date.now },
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
          return value.every(url => /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i.test(url));
        },
        message: 'Todas las imágenes deben ser URLs válidas con formato jpg, jpeg, png, gif o svg'
      }
    ]
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  tags: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Etiqueta' }],
    validate: {
      validator: function (value) {
        return value.length >= 1 && value.length <= 10;
      },
      message: 'Debes proporcionar entre 1 y 10 etiquetas'
    }
  },
 timestamps: true
});

module.exports = mongoose.model('Producto', ProductoSchema);