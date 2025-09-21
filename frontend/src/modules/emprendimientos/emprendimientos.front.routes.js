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
  redirigirSiNoHayIdEnUrl
} = require('./emprendimientos.services');

/* Rutas GET para obtener los emprendimientos del usuario
  - /usuario-emprendimientos -> usa id desde sesión (req.usuarioAutenticado)
  - /usuario-emprendimientos/:id -> compatibilidad (no recomendado exponer id en URL)
*/
router.get('/usuario-emprendimientos', listarEmprendimientosUsuario);
//router.get('/usuario-emprendimientos/:id',  listarEmprendimientosUsuario);

/* Ruta POST para agregar un nuevo emprendimiento */
router.post('/usuario-agregar-emprendimiento', upload.single('logo'), agregarEmprendimiento);

router.get('/emprendimiento-detalle', redirigirSiNoHayIdEnUrl);
router.get('/emprendimiento-detalle/:id', obtenerDetalleEmprendimiento);

router.post('/emprendimiento-editar/:id', upload.single('logo'), editarEmprendimiento);

router.post('/emprendimiento/eliminar/:id', eliminarEmprendimiento);




module.exports = router;