const mongoose = require('mongoose');

const ClienteSchema = mongoose.Schema({
  nombre: {
    type: String,
    requiered: true,
    trim: true,
  },
  apellido: {
    type: String,
    requiered: true,
    trim: true,
  },
  empresa: {
    type: String,
    requiered: true,
    trim: true,
  },
  email: {
    type: String,
    requiered: true,
    trim: true,
    unique: true
  },
  telefono: {
    type: String,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    requiered: true,
    ref: 'Usuario'
  }
});

module.exports = mongoose.model('Cliente', ClienteSchema);