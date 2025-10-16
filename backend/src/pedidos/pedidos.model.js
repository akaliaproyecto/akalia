const mongoose = require('mongoose');

/**
 * @typedef {Object} Mensaje
 * @property {String} remitente - ID o referencia del remitente
 * @property {String} texto - Contenido del mensaje
 * @property {Date} fecha - Fecha del mensaje
 */
const MensajeSchema = new mongoose.Schema({
  idUsuarioRemitente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El remitente es obligatorio']
  },
  contenidoMensaje: {
    type: String,
    required: [true, 'El contenido del mensaje es obligatorio'],
    minlength: [1, 'El mensaje no puede estar vacío'],
    maxlength: [1000, 'El mensaje no puede tener más de 1000 caracteres']
  },
  fechaEnvio: {
    type: Date,
    required: [true, 'La fecha de envío es obligatoria'],
    default: Date.now
  },
  leido: {
    type: Boolean,
    default: false
  }
});

/**
 * @typedef {Object} DetallePedido
 * @property {String} idProducto - ID del producto
 * @property {Number} cantidad - Cantidad pedida
 * @property {Number} precio - Precio unitario al momento del pedido
 * @property {String} comentario - Comentarios adicionales
 */
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
    maxlength: [500, 'La descripción no puede superar los 500 caracteres'],
    default: 'En este espacio se hará la descripción detallada del pedido final'
  },
  unidades: {
    type: Number,
    required: [true, 'Las unidades son obligatorias'],
    min: [1, 'Debe haber al menos 1 unidad'],
    default: 1
  },
  precioPactado: {
    type: Number,
    required: [true, 'El precio pactado es obligatorio'],
    min: [0, 'El precio pactado no puede ser negativo']
  }
});

// Esquema para la dirección de envío
/**
 * @typedef {Object} DireccionEnvio
 * @property {String} departamento
 * @property {String} municipio
 * @property {String} direccion
 * @property {String} nombreDestinatario
 * @property {String} telefono
 */
const DireccionEnvioSchema = new mongoose.Schema({
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true,
    minlength: [5, 'La dirección debe tener al menos 5 caracteres'],
    maxlength: [100, 'La dirección no puede superar los 100 caracteres']
  },
  departamento: {
    type: String,
    required: [true, 'El departamento es obligatorio'],
    trim: true
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad es obligatoria'],
    trim: true
  }
});

/* ESQUEMA PRINCIPAL DE PEDIDO */
/**
 * @typedef {Object} Pedido
 * @property {String} idComprador - Referencia al usuario comprador
 * @property {String} idVendedor - Referencia al usuario vendedor
 * @property {DetallePedido[]} detalle - Array de items pedidos
 * @property {Number} total - Total calculado del pedido
 * @property {DireccionEnvio} direccionEnvio - Datos de envío
 * @property {String} estado - Estado del pedido (creado, enviado, cancelado, etc.)
 * @property {Mensaje[]} mensajes - Conversación asociada al pedido
 * @property {Boolean} estadoEliminacion - Flag para eliminación lógica
 */
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
  idEmprendimiento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emprendimiento'
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
        // Convertir a Date si viene como string y ser tolerante si faltan fechas
        if (!value) return true;
        let fechaAcept = (value instanceof Date) ? value : new Date(value);
        if (isNaN(fechaAcept)) return true; // si no es fecha válida, no bloquear aquí
        let fechaC = (this.fechaCreacion instanceof Date) ? this.fechaCreacion : (this.fechaCreacion ? new Date(this.fechaCreacion) : null);
        if (!fechaC || isNaN(fechaC)) return true; // no hay base para comparar -> no bloquear
        return fechaAcept >= fechaC;
      },
      message: "La fecha de aceptación no puede ser anterior a la fecha de creacion."
    },
  },
  fechaCompletado: {
    type: Date,
    validate: {
      validator: function (value) {
        // Convertir a Date si viene como string y ser tolerante si faltan fechas
        if (!value) return true;
        let fechaComp = (value instanceof Date) ? value : new Date(value);
        if (isNaN(fechaComp)) return true;
        let fechaA = (this.fechaAceptacion instanceof Date) ? this.fechaAceptacion : (this.fechaAceptacion ? new Date(this.fechaAceptacion) : null);
        if (!fechaA || isNaN(fechaA)) return true;
        return fechaComp >= fechaA;
      },
      message: "La fecha de completado no puede ser anterior a la fecha de aceptación."
    },
  },
  estadoPedido: {
    type: String,
    enum: ['pendiente', 'aceptado', 'completado', 'cancelado'],
    required: [true, 'El estado del pedido es obligatorio'],
    default: 'pendiente'
  },
  total: {
    type: Number,
    required: [true, 'El total es obligatorio'],
    min: [0, 'El total no puede ser negativo']
  },
  direccionEnvio: {
    type: DireccionEnvioSchema,
    required: [false, 'La dirección de envío no es obligatoria para crear el pedido']
  },
  estadoEliminacion: {
    type: Boolean,
    default: false,
    required: true
  },
  detallePedido: {
    type: DetallePedidoSchema,
    required: [true, 'El detalle del pedido es obligatorio']
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