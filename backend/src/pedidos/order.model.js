const mongoose = require('mongoose');

const MensajeSchema = new mongoose.Schema({
  idUsuarioRemitente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El remitente es obligatorio']
  },
  contenidoMensaje: {
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
  mensajes: [MensajeSchema],
  reporte: {
    idUsuarioReportante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    idUsuarioReportado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    idPedido: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pedido'
    },
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
      ]
    },
    descripcionReporte: {
      type: String,
      minlength: [20, 'La descripción debe tener al menos 20 caracteres'],
      maxlength: [500, 'La descripción no puede superar los 500 caracteres']
    },
    fechaCreacion: {
      type: Date,
      default: Date.now
    },
    fechaSolucion: {
      type: Date,
      validate: {
        validator: function (value) {
          // Acepta solo si value es mayor o igual a la fecha de creación
          return !value || value >= this.reporte.fechaCreacion;
        },
        message: "La fecha de solución no puede ser anterior a la fecha de creación."
      }
    },
    estadoReporte: {
      type: Boolean,
      default: false
    }, //pendiente: false, resuelto:true
    accionTomada: {
      type: String,
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
        ]
      },
      motivoSancion: {
        type: String,
        minlength: [50, 'El motivo debe tener al menos 50 caracteres'],
        maxlength: [500, 'El motivo no puede superar los 500 caracteres']
      },
      fechaInicio: {
        type: Date,
        default: Date.now
      },
      fechaFin: {
        type: Date,
        validate: {
          validator: function (value) {
            // Acepta solo si value es mayor o igual a la fecha de inicio
            return !value || value >= this.fechaInicio;
          },
          message: "La fecha de fin no puede ser anterior a la fecha de inicio."
        }
      },
      duracionSancion: {
        type: Number,
        min: [1, 'La duración debe ser al menos 1 día']
      },
      idAdminResponsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
      },
      estadoSancion: {
        type: Boolean,
        default: false
      } //activa: false, finalizada:true   
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pedido', PedidoSchema);