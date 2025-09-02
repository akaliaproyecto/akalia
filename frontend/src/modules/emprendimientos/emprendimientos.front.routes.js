const express = require('express');
const router = express.Router();

const { listarEmprendimientosUsuario } = require('./emprendimientos.services');

// Ruta que coincide con el enlace en sidebar.ejs
router.get('/usuario-emprendimientos/:id', listarEmprendimientosUsuario);

module.exports = router;