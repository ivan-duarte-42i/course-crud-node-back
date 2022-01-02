const mongoose = require('mongoose');

const PedidoSchema = mongoose.Schema({
  pedido: {
    type: Array,
    requiered: true,
  },
  total: {
    type: Number,
    requiered: true,
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    requiered: true,
    ref: 'Cliente'
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    requiered: true,
    ref: 'Usuario'
  },
  estado: {
    type: String,
    default: 'PENDIENTE',
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Pedido', PedidoSchema);