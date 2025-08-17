const mongoose = require('mongoose');

const SancionSchema = new mongoose.Schema({
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
  motivoSancion: { type: String, required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  duracionSancion: { type: Number, required: true },
  idAdminResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  estadoSancion: { type: String, enum: ['activa', 'finalizada'], required: true },
  tipoReporte: String
});

const ReporteSchema = new mongoose.Schema({
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
  descripcionReporte: { type: String, required: true },
  fechaCreacion: { type: Date, required: true, default: Date.now },
  fechaSolucion: Date,
  estadoReporte: { type: String, enum: ['pendiente', 'resuelto'], required: true },
  accionTomada: String,
  sanciones: [SancionSchema]
});

module.exports = mongoose.model('Reporte', ReporteSchema);
