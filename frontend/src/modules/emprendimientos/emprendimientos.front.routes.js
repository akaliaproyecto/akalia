const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer();

const {
  listarEmprendimientosUsuario,
  agregarEmprendimiento,
  obtenerDetalleEmprendimiento,
  editarEmprendimiento,
  eliminarEmprendimiento
} = require('./emprendimientos.services');

/* Ruta GET para obtener los emprendimientos del usuario */
router.get('/usuario-emprendimientos/:id',  listarEmprendimientosUsuario);

/* Ruta POST para agregar un nuevo emprendimiento */
router.post('/usuario-agregar-emprendimiento', upload.single('logo'), agregarEmprendimiento);

/* Nueva ruta: detalle (proxy) para la modal */
router.get('/emprendimiento-detalle/:id', obtenerDetalleEmprendimiento);

router.post('/emprendimiento-editar/:id', upload.single('logo'),editarEmprendimiento);

router.post('/emprendimiento/eliminar/:id',eliminarEmprendimiento);




module.exports = router;