const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  idProducto: {
    type: String,
    required: [true, "El identificador del producto es obligatorio"],
    unique: true,
  },

  tituloProducto:
    { type: String, required: true, trim: true, minLength: 3, maxLength: 100 },

  idEmprendimiento:
    { type: mongoose.Schema.Types.ObjectId, ref: 'Emprendimiento', required: false },
  /***************************************/
  /* IMPORTANTE CAMBIAR REQUIRED: TRUE  */
  /***************************************/


  descripcionProducto:
    { type: String, required: true, trim: true, minLength: 3, maxLength: 1000 },

  precio:
    { type: Number, required: true, min: 0, default: 0 },

  estadoProducto: { type: String, enum: ['activo', 'inactivo'], default: 'activo', required: true },

  fechaPublicacion: { type: Date, required: true, default: Date.now },

  imagenes: {
    type: [String], // Array de URLs de imágenes
    validate: [
      {
        validator: function (value) {
          return value.length === 0 || value.length >= 1 && value.length <= 10;
        },
        message: 'Debes proporcionar entre 1 y 10 imágenes'
      },
      {
        validator: function (value) {
          return value.every(url => /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i.test(url));
        },
        message: 'Todas las imágenes deben ser URLs válidas con formato jpg, jpeg, png, gif o svg', required: false
      }
    ]
  },
  /***************************************/
  /* IMPORTANTE CAMBIAR REQUIRED: TRUE y value.length === 0 ||*/
  /***************************************/

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: false },
  /***************************************/
  /* IMPORTANTE CAMBIAR REQUIRED: TRUE  */
  /***************************************/

  tags: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Etiqueta' }],
    validate: {
      validator: function (value) {
        return value.length === 0 || value.length >= 1 && value.length <= 10;
      },
      message: 'Debes proporcionar entre 1 y 10 etiquetas', required: false
    }
  },
  /***************************************/
  /* IMPORTANTE CAMBIAR REQUIRED: TRUE y value.length === 0 || */
  /***************************************/

}, { timestamps: true });

module.exports = mongoose.model('Producto', ProductoSchema);