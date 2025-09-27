const express = require('express');
const subirImagen = require('../middlewares/manejadorImg.js');
const router = express.Router();

const {
  obtenerEmprendimientos,
  obtenerEmprendimientoPorId,
  obtenerEmprendimientoPorIdUsuario,
  crearEmprendimiento,
  actualizarEmprendimiento,
  deshabilitarEmprendimiento,
  verificarEmprendimientoActivo
} = require('./emprendimiento.controller');

// obtener todos los emprendimientos
router.get('/', obtenerEmprendimientos);

// obtener un emprendimiento por su ID
router.get('/:id', obtenerEmprendimientoPorId);

// obtener emprendimientos por ID de usuario
router.get('/usuario/:id', obtenerEmprendimientoPorIdUsuario);

// crear un nuevo emprendimiento
router.post('/', subirImagen.single('logo'), crearEmprendimiento);

// actualizar un emprendimiento
router.put('/:id', subirImagen.single('logo'), actualizarEmprendimiento);

// deshabilitar un emprendimiento
router.patch('/:id', deshabilitarEmprendimiento);

// verificar si un emprendimiento está activo
router.get('/verificar-activo/:id', verificarEmprendimientoActivo);

module.exports = router;
