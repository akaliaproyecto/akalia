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
    pagarPedido,
    verificarPedidoActivo
} = require('./pedidos.services');

/**
 * GET /usuario-pedidos/:id
 * Renderiza la vista de 'Mis ventas' para el usuario (vendedor)
 * Params: id - ID del usuario
 */
// Rutas para listar pedidos del usuario.
router.get('/usuario-pedidos/:id', listarPedidosUsuario);

/**
 * GET /usuario-compras/:id
 * Renderiza la vista de 'Mis compras' para el usuario (comprador)
 * Params: id - ID del usuario
 */
// Rutas para listar pedidos del usuario.
router.get('/usuario-compras/:id', listarComprasUsuario);

/**
 * GET /usuario-compras/detalle/:id
 * Mostrar detalle de una compra (o vista de edición si es vendedor)
 * Params: id - ID del pedido
 */
// Rutas para listar pedidos del usuario.
router.get('/usuario-compras/detalle/:id', detalleCompra);

/**
 * POST /usuario-pedidos/crear
 * Endpoint SSR para crear un pedido (envía datos al backend y redirige)
 */
// Rutas para listar pedidos del usuario.
router.post('/usuario-pedidos/crear', crearPedido);

/**
 * POST /usuario-compras/cancelar/:id
 * Procesa la cancelación de un pedido desde el frontend
 * Params: id - ID del pedido
 */
// Ruta POST para procesar la cancelacion de un pedido
router.post('/usuario-compras/cancelar/:id', cancelarPedido);

/**
 * POST /usuario-pedidos/actualizar/:id
 * Procesa la edición de un pedido (por vendedor)
 * Params: id - ID del pedido
 */
// Ruta POST para procesar la cancelacion de un pedido
router.post('/usuario-pedidos/actualizar/:id', editarPedido);

/**
 * POST /usuario-compras/actualizar-direccion/:id
 * Procesa la actualización de la dirección de envío (comprador)
 * Params: id - ID del pedido
 */
// Ruta POST para actualizar la dirección de un pedido
router.post('/usuario-compras/actualizar-direccion/:id', actualizarDireccionPedido);

/**
 * GET /usuario-pedidos/comprar/:productoId
 * Inicia el proceso de compra para el producto indicado
 * Params: productoId - ID del producto
 */
// Ruta para iniciar un pedido a partir de un producto
router.get('/usuario-pedidos/comprar/:productoId', iniciarPedido);

// Ruta para verificar un pedido existente
router.get('/pedidos/verificar-activo/:idUsuario/:idProducto', verificarPedidoActivo);

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
