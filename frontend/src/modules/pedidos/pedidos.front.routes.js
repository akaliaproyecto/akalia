// Rutas frontend (SSR) para pedidos del usuario
const express = require('express');
const router = express.Router();

// Servicio que renderiza las vistas (llama al backend internamente)
const {
	listarPedidosUsuario,
    iniciarPedido,
    detalleCompra,
    editarPedido,
    crearPedido,
    cancelarPedido,
    actualizarDireccionPedido,
    listarComprasUsuario,
    pagarPedido
} = require('./pedidos.services');

// Rutas para listar pedidos del usuario.
router.get('/usuario-pedidos/:id', listarPedidosUsuario);

// Rutas para listar pedidos del usuario.
router.get('/usuario-compras/:id', listarComprasUsuario);

// Rutas para listar pedidos del usuario.
router.get('/usuario-compras/detalle/:id', detalleCompra);

// Rutas para listar pedidos del usuario.
router.post('/usuario-pedidos/crear', crearPedido);

// Ruta POST para procesar la cancelacion de un pedido
router.post('/usuario-compras/cancelar/:id', cancelarPedido);

// Ruta POST para procesar la cancelacion de un pedido
router.post('/usuario-pedidos/actualizar/:id', editarPedido);

// Ruta POST para actualizar la dirección de un pedido
router.post('/usuario-compras/actualizar-direccion/:id', actualizarDireccionPedido);

// Ruta para iniciar un pedido a partir de un producto
router.get('/usuario-pedidos/comprar/:productoId', iniciarPedido);

// Ruta para procesar el pago de un pedido
router.post('/pagar', pagarPedido)

// Rutas de retorno desde MercadoPago
router.get('/success', (req, res) => {
  res.render('pages/pago-success', { datos: req.query });
});

router.get('/failure', (req, res) => {
  res.render('pages/pago-failure', { datos: req.query });
});

router.get('/pending', (req, res) => {
  res.render('pages/pago-pending', { datos: req.query });
});




module.exports = router;
