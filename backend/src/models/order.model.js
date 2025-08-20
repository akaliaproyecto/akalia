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
    default: 1
  },
  subtotal: {
    type: Number,
    required: [true, 'El subtotal es obligatorio'],
    min: [0, 'El subtotal no puede ser negativo'],
    default: 0
  }
});



/* ESQUEMA PRINCIPAL DE PEDIDO */
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
    validate: {
      validator: function (value) {
        // Acepta solo si value es mayor o igual a la fecha actual
        return value >= new Date();
      },
      message: "La fecha de creación no puede ser anterior al momento actual."
    },
    default: Date.now
  },
  fechaAceptacion: {
    type: Date,
    validate: {
      validator: function (value) {
        // Acepta solo si value es mayor o igual a la fecha de creacion
        return value >= this.fechaCreacion;
      },
      message: "La fecha de aceptación no puede ser anterior a la fecha de creacion."
    },
  },
  fechaCompletado: {
    type: Date,
    validate: {
      validator: function (value) {
        // Acepta solo si value es mayor o igual a la fecha actual
        return value >= this.fechaAceptacion;
      },
      message: "La fecha de completado no puede ser anterior a la fecha de aceptación."
    },
  },
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
      validator: function (value) {
        return value.length >= 1; // Al menos un detalle de pedido
      },
      message: 'El pedido debe tener al menos un producto'
    }
  },
  mensajes: [MensajeSchema]
}, {
  timestamps: true,

  reporte: {
    idUsuarioReportante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    idUsuarioReportado: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    idPedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
    motivoReporte: {
      type: String,
      enum: [
        'producto_no_recibido',
        'producto_danado',
        'producto_no_corresponde',
        'incumplimiento_plazos',
        'trato_inadecuado',
        'actividad_fraudulenta',
        'spam_publicidad'
      ],
      required: true
    },
    descripcionReporte: { type: String, required: true, minlength: 20, maxlength: 500 },
    fechaCreacion: { type: Date, required: true, default: Date.now },
    fechaSolucion: {
      type: Date,
      validate: {
        validator: function (value) {
          // Acepta solo si value es mayor o igual a la fecha de creación
          return value >= this.fechaCreacion;
        },
        message: "La fecha de solución no puede ser anterior a la fecha de creación."
      },
    },
    estadoReporte: { type: Boolean, default: false, required: true }, //pendiente: false, resuelto:true
    accionTomada: {
      enum: [
        "advertencia_emitida",
        "suspension_temporal",
        "restriccion_funcionalidad",
        "multa_aplicada",
        "expulsion_definitiva",
        "eliminacion_publicacion",
        "reporte_rechazado",
        "sin_accion"
      ],
      default: "sin_accion"
    },
    sanciones: [{
      tipoSancion: {
        type: String,
        enum: [
          'suspension_temporal',
          'suspension_definitiva',
          'restriccion_publicar',
          'restriccion_mensajes',
          'multa'
        ],
        required: true
      },
      motivoSancion: { type: String, required: true, minlength: 50, maxlength: 500 },
      fechaInicio: { type: Date, required: true, default: Date.now },
      fechaFin: {
        type: Date, required: true,
        validate: {
          validator: function (value) {
            // Acepta solo si value es mayor o igual a la fecha actual
            return value >= new Date();
          },
          message: "La fecha de aceptación no puede ser anterior al momento actual."
        },
      },
      duracionSancion: { type: Number, required: true },
      idAdminResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
      estadoSancion: { type: Boolean, default: false, required: true }, //activa: false, finalizada:true   

    }]
  },
});









module.exports = mongoose.model('Pedido', PedidoSchema);
