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
/**
 * Rutas para el recurso /emprendimientos (API backend)
 * - GET / -> Obtener todos los emprendimientos
 */
router.get('/', obtenerEmprendimientos);

// obtener un emprendimiento por su ID
/** GET /:id -> Obtener un emprendimiento por su ID */
router.get('/:id', obtenerEmprendimientoPorId);

// obtener emprendimientos por ID de usuario
/** GET /usuario/:id -> Obtener emprendimientos de un usuario (protegido) */
router.get('/usuario/:id',requireAuth, obtenerEmprendimientoPorIdUsuario);

// crear un nuevo emprendimiento
/** POST / -> Crear un nuevo emprendimiento (requiere auth, acepta logo) */
router.post('/', requireAuth,subirImagen.single('logo'), crearEmprendimiento);

// actualizar un emprendimiento
/** PUT /:id -> Actualizar un emprendimiento (requiere auth, acepta logo) */
router.put('/:id', requireAuth,subirImagen.single('logo'), actualizarEmprendimiento);

// deshabilitar un emprendimiento
/** PATCH /:id -> Deshabilitar (eliminar lógicamente) un emprendimiento (requiere auth) */
router.patch('/:id', requireAuth,deshabilitarEmprendimiento);

// verificar si un emprendimiento está activo
/** GET /verificar-activo/:id -> Verificar si un emprendimiento está activo */
router.get('/verificar-activo/:id', verificarEmprendimientoActivo);

module.exports = router;
