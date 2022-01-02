const mongoose = require('mongoose');

const ProductoSchema = mongoose.Schema({
  nombre: {
    type: String,
    requiered: true,
    trim: true,
  },
  existencia: {
    type: Number,
    requiered: true,
    trim: true,
  },
  precio: {
    type: Number,
    requiered: true,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  }
});

ProductoSchema.index({ nombre: "text" })
module.exports = mongoose.model('Producto', ProductoSchema);