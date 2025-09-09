const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer();

const {
  listarEmprendimientosUsuario,
  agregarEmprendimiento,
  obtenerDetalleEmprendimiento
} = require('./emprendimientos.services');

/* Ruta GET para obtener los emprendimientos del usuario */
router.get('/usuario-emprendimientos/:id',  listarEmprendimientosUsuario);

/* Ruta POST para agregar un nuevo emprendimiento */
router.post('/usuario-agregar-emprendimiento', upload.single('logo'), agregarEmprendimiento);

/* Nueva ruta: detalle (proxy) para la modal */
router.get('/emprendimiento-detalle/:id', obtenerDetalleEmprendimiento);

module.exports = router;