// Rutas frontend relacionadas con productos (version simple y comentada)
const express = require('express');
const router = express.Router();

const productosServices = require('./productos.services');


// Ruta SIN id (muestra los productos para el usuario autenticado o lista vacía)
router.get('/productos/usuario-productos', productosServices.listarProductosUsuario);

// Ruta CON id (muestra los productos para el id provisto en la URL)
router.get('/productos/usuario-productos/:id', productosServices.listarProductosUsuario);

module.exports = router;
