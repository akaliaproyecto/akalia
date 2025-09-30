// Rutas frontend (SSR) para pedidos del usuario
const express = require('express');
const router = express.Router();

// Servicio que renderiza las vistas (llama al backend internamente)
const {
	listarPedidosUsuario,
    iniciarPedido
} = require('./pedidos.services');

// Rutas para listar pedidos del usuario.
router.get('/usuario-pedidos/:id', listarPedidosUsuario);

// Ruta para iniciar un pedido a partir de un producto
router.get('/usuario-pedidos/iniciar/:productoId', iniciarPedido);

module.exports = router;
