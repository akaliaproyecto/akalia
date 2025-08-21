const express = require('express');
const router = express.Router();

const {
  obtenerComisiones,     
  obtenerComisionPorId,
  insertarComision,
  actualizarComision,
  deshabilitarComision
} = require('./comision.controller');

// Obtener todas las comisiones activas
router.get('/comisiones', obtenerComisiones);

// Obtener comisión por ID
router.get('/comisiones/:id', obtenerComisionPorId);

// Insertar nueva comisión
router.post('/comisiones', insertarComision);

// Actualizar comisión
router.put('/comisiones/:id', actualizarComision);  

// Deshabilitar comisión
router.patch('/comisiones/:id/deshabilitar', deshabilitarComision);

module.exports = router;