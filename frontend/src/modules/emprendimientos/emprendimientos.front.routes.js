const express = require('express');
const router = express.Router();

const {
  listarEmprendimientosUsuario,
  agregarEmprendimiento
} = require('./emprendimientos.services');

/* Ruta GET para obtener los emprendimientos del usuario */
router.get('/usuario-emprendimientos/:id', listarEmprendimientosUsuario);

/* Ruta POST para agregar un nuevo emprendimiento */
router.post('/usuario-agregar-emprendimiento', agregarEmprendimiento);

module.exports = router;