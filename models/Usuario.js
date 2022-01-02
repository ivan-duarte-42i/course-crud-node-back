const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
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
  email: {
    type: String,
    requiered: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    requiered: true,
    trim: true,
  },
  fecha: {
    type: Date,
    default: Date.now(),
  }
});

module.exports = mongoose.model('User', UserSchema)