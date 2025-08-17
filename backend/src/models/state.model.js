const mongoose = require('mongoose');

const DepartamentoSchema = new mongoose.Schema({
  nombreDepartamento: { 
    type: String, 
    required: [true, 'El nombre del departamento es obligatorio'], 
    unique: true, 
    trim: true,
    minlength: [3, 'El nombre del departamento debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre del departamento no puede superar los 100 caracteres'],
    match: [/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre del departamento solo puede contener letras y espacios']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Departamento', DepartamentoSchema);