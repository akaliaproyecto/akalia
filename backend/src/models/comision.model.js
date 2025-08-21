const mongoose = require('mongoose');

const DetalleComisionSchema = new mongoose.Schema({
  idPedido: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pedido', 
    required: [true, 'El ID del pedido es obligatorio'] 
  },
  montoComision: { 
    type: Number, 
    required: [true, 'El monto de la comisión es obligatorio'], 
    min: [0, 'El monto de la comisión no puede ser negativo'] 
  },
  porcentajeComision: { 
    type: Number, 
    required: [true, 'El porcentaje de comisión es obligatorio'], 
    min: [0, 'El porcentaje no puede ser negativo'],
    max: [100, 'El porcentaje no puede ser mayor que 100'] 
  },
});

const ComisionSchema = new mongoose.Schema({
  idUsuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El ID del usuario es obligatorio'] 
  },
  periodoComision: { 
    type: String, 
    required: [true, 'El periodo de comisión es obligatorio'], 
    match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'El periodo debe tener el formato YYYY-MM'] 
  },
  valorTotalPedidosMes: { 
    type: Number, 
    required: [true, 'El valor total de pedidos del mes es obligatorio'], 
    min: [0, 'El valor total no puede ser negativo'] 
  },
  fechaGeneracion: { 
    type: Date, 
    required: [true, 'La fecha de generación es obligatoria'], 
    default: Date.now 
  },
  estadoPagoComision: { 
    type: String, 
    enum: {
      values: ['pendiente', 'pagado'],
      message: 'El estado de pago debe ser "pendiente" o "pagado"'
    },
    required: [true, 'El estado de pago de la comisión es obligatorio'] 
  },
  detalles: {
    type: [DetalleComisionSchema],
    validate: {
      validator: function(value) {
        return value.length > 0;
      },
      message: 'Debe haber al menos un detalle de comisión'
    }
  },
  fechaPagoComision: { 
    type: Date,
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'La fecha de pago de comisión no es válida'
    }
  }
});

module.exports = mongoose.model('Comision', ComisionSchema);
