const mongoose = require('mongoose');

const MensajeSchema = new mongoose.Schema({
  idUsuarioRemitente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El remitente es obligatorio'] 
  },
  contenido: { 
    type: String, 
    required: [true, 'El contenido del mensaje es obligatorio'], 
    trim: true,
    minlength: [1, 'El mensaje no puede estar vacío'],
    maxlength: [1000, 'El mensaje no puede tener más de 1000 caracteres']
  },
  fechaEnvio: { 
    type: Date, 
    required: [true, 'La fecha de envío es obligatoria'], 
    default: Date.now
  }
});

const DetallePedidoSchema = new mongoose.Schema({
  idProducto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: [true, 'El producto es obligatorio'] 
  },
  descripcion: { 
    type: String, 
    required: [true, 'La descripción es obligatoria'], 
    trim: true,
    minlength: [3, 'La descripción debe tener al menos 3 caracteres'],
    maxlength: [255, 'La descripción no puede superar los 255 caracteres']
  },
  unidades: { 
    type: Number, 
    required: [true, 'Las unidades son obligatorias'], 
    min: [1, 'Debe haber al menos 1 unidad'],
    max: [1000, 'No se permiten más de 1000 unidades']
  },
  subtotal: { 
    type: Number, 
    required: [true, 'El subtotal es obligatorio'], 
    min: [0, 'El subtotal no puede ser negativo']
  }
});

const PedidoSchema = new mongoose.Schema({
  idUsuarioComprador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El comprador es obligatorio'] 
  },
  idUsuarioVendedor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El vendedor es obligatorio'] 
  },
  fechaCreacion: { 
    type: Date, 
    required: [true, 'La fecha de creación es obligatoria'], 
    default: Date.now 
  },
  fechaAceptacion: Date,
  fechaCompletado: Date,
  estadoPedido: { 
    type: String, 
    enum: ['pendiente', 'aceptado', 'completado', 'cancelado'], 
    required: [true, 'El estado del pedido es obligatorio']
  },
  precioTotal: { 
    type: Number, 
    required: [true, 'El precio total es obligatorio'], 
    min: [0, 'El precio total no puede ser negativo']
  },
  detalles: {
    type: [DetallePedidoSchema],
    validate: {
      validator: function(value) {
        return value.length >= 1; // Al menos un detalle de pedido
      },
      message: 'El pedido debe tener al menos un producto'
    }
  },
  mensajes: [MensajeSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Pedido', PedidoSchema);
