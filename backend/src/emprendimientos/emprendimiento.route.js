const express = require('express');
const subirImagen = require('../middlewares/manejadorImg.js');
const router = express.Router();

const {
  obtenerEmprendimientos,
  obtenerEmprendimientoPorId,
  obtenerEmprendimientoPorIdUsuario,
  crearEmprendimiento,
  actualizarEmprendimiento,
  deshabilitarEmprendimiento   
} = require('./emprendimiento.controller');

// obtener todos los emprendimientos
router.get('/emprendimientos', obtenerEmprendimientos);

// obtener un emprendimiento por su ID
router.get('/emprendimientos/:id', obtenerEmprendimientoPorId);

// obtener emprendimientos por ID de usuario
router.get('/emprendimientos/usuario/:id', obtenerEmprendimientoPorIdUsuario);

// crear un nuevo emprendimiento
router.post('/emprendimientos', subirImagen.single('logo'), crearEmprendimiento);

// actualizar un emprendimiento
router.put('/emprendimientos/:id', subirImagen.single('logo'), actualizarEmprendimiento);

// deshabilitar un emprendimiento
router.patch('/emprendimientos/:id', deshabilitarEmprendimiento);

module.exports = router;
