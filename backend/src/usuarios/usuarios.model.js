const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema({
  tituloNotificacion: { 
    type: String, 
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  tipoNotificacion: { 
    type: String, 
    required: true,
    enum: ['Nuevo pedido', 'Cambio en el estado del pedido', 'Reporte', 'Nuevo mensaje'] 
  },
  fechaCreacion: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  contenidoNotificacion: { 
    type: String, 
    required: true,
    trim: true,
    minLength: 5,
    maxLength: 500 
  }
});

const DireccionSchema = new mongoose.Schema({
  direccion: { 
    type: String, 
    required: true,
    trim: true,
    minLength: [5, 'La dirección debe tener al menos 5 caracteres'],
    maxLength: [100, 'La dirección no puede superar los 100 caracteres']
  },
  departamento: {
      type: String,
      required: true
    },
    ciudad: {
      type: String,
      required: true
    },
  fechaCreacion: { 
    type: Date, 
    required: true,
    default: Date.now }
});

const UsuarioSchema = new mongoose.Schema({
  nombreUsuario: { 
    type: String, 
    required: true,
    trim: true,
    minLength:3, 
    maxLength:30 },

  apellidoUsuario: { 
    type: String, 
    required: true,
    trim: true,
    minLength: 3, 
    maxLength: 30,
    match: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/
   },

  correo: { 
    type: String, 
    required: true,
    trim: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  contraseña: { 
    type: String, 
    required: true,
    minLength: 8,
    match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
  },
  
  twoFAEnabled: { type: Boolean, default: false },

  totpSecret: { type: String, default: null },

  rolUsuario: { 
    type: String, 
    enum: ['usuario', 'admin'], 
    default: 'usuario',
    required: true },

  estadoUsuario: { 
    type: String, 
    enum: ['activo', 'inactivo', 'suspendido'], 
    required: true,
    default: 'activo' },

    telefono: { 
      type: String,
      default:null, 
      match: /^\+?[0-9]{7,15}$/
    },
    esVendedor: { 
      type: Boolean, 
      default: false },
  
    direcciones: [DireccionSchema],
    notificaciones: [NotificacionSchema],

    fechaRegistro: { 
      type: Date, 
      required: true,
      default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);
