const express = require('express');
const subirImagen = require('../middlewares/manejadorImg.js');
const router = express.Router();
const { requireAuth  } = require('../middlewares/auth.middlewares.js');

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
router.get('/usuario/:id',requireAuth, obtenerEmprendimientoPorIdUsuario);

// crear un nuevo emprendimiento
router.post('/', requireAuth,subirImagen.single('logo'), crearEmprendimiento);

// actualizar un emprendimiento
router.put('/:id', requireAuth,subirImagen.single('logo'), actualizarEmprendimiento);

// deshabilitar un emprendimiento
router.patch('/:id', requireAuth,deshabilitarEmprendimiento);

// verificar si un emprendimiento está activo
router.get('/verificar-activo/:id', verificarEmprendimientoActivo);

module.exports = router;
