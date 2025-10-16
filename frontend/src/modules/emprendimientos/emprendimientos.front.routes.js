/**
 * Rutas del frontend para la sección de emprendimientos.
 * Estas rutas renderizan vistas o actúan como proxy hacia el API backend.
 * No cambian la lógica, solo documentan su propósito.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer();

const {
  listarEmprendimientosUsuario,
  agregarEmprendimiento,
  obtenerDetalleEmprendimiento,
  editarEmprendimiento,
  eliminarEmprendimiento,
  redirigirSiNoHayIdEnUrl,
  verificarEmprendimientoActivo
} = require('./emprendimientos.services');

/* Rutas GET para obtener los emprendimientos del usuario
  - /usuario-emprendimientos -> usa id desde sesión (req.usuarioAutenticado)
  - /usuario-emprendimientos/:id -> compatibilidad (no recomendado exponer id en URL)
*/
/** GET /usuario-emprendimientos -> Listar emprendimientos del usuario (usa sesión) */
router.get('/usuario-emprendimientos', listarEmprendimientosUsuario);
//router.get('/usuario-emprendimientos/:id',  listarEmprendimientosUsuario);

/* Ruta POST para agregar un nuevo emprendimiento */
/** POST /usuario-agregar-emprendimiento -> Form para agregar un emprendimiento (acepta logo) */
router.post('/usuario-agregar-emprendimiento', upload.single('logo'), agregarEmprendimiento);

/** GET /emprendimiento-detalle -> Redirige si no hay id en la URL */
router.get('/emprendimiento-detalle', redirigirSiNoHayIdEnUrl);
/** GET /emprendimiento-detalle/:id -> Muestra detalle de un emprendimiento */
router.get('/emprendimiento-detalle/:id', obtenerDetalleEmprendimiento);

/** POST /emprendimiento-editar/:id -> Editar emprendimiento (acepta logo) */
router.post('/emprendimiento-editar/:id', upload.single('logo'), editarEmprendimiento);

/** POST /emprendimiento/eliminar/:id -> Eliminar (marcar como eliminado) un emprendimiento */
router.post('/emprendimiento/eliminar/:id', eliminarEmprendimiento);

/* Ruta API proxy para verificar si un emprendimiento está activo */
/** GET /emprendimientos/verificar-activo/:id -> Proxy para verificar si un emprendimiento está activo */
router.get('/emprendimientos/verificar-activo/:id', verificarEmprendimientoActivo);

module.exports = router;