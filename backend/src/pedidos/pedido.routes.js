// Importa Express y crea un router para definir las rutas de pedidos
const express = require('express');
const router = express.Router();

// Importa las funciones del controlador que se van a ejecutar cuando se llame cada ruta
const {
  obtenerPedidos,
  obtenerPedidosPorId,
  obtenerVentas,
  obtenerCompras,
  crearPedido,
  editarPedido,
  actualizarPedido,
  cancelarPedido,
  eliminarPedido,
  verificarPedidoActivo
} = require('./pedido.controller');

/**
 * GET /
 * Obtener todos los pedidos (panel admin).
 * Respuesta: Array de pedidos.
 */
//obtener todos los pedidos
router.get('/', obtenerPedidos);

/**
 * GET /ventas/:id
 * Obtener ventas para un vendedor especificado por id.
 * Params: id - ID del vendedor.
 */
//obtener todos los pedidos
router.get('/ventas/:id', obtenerVentas);

/**
 * GET /compras/:id
 * Obtener compras para un comprador especificado por id.
 * Params: id - ID del comprador.
 */
//obtener todos los pedidos
router.get('/compras/:id', obtenerCompras);

/**
 * GET /:id
 * Obtener un pedido por su ID.
 * Params: id - ID del pedido.
 */
//obtener un pedido por id
router.get('/:id', obtenerPedidosPorId);

/**
 * POST /
 * Crear un nuevo pedido.
 * Body: objeto con detalle, direccionEnvio, total, etc.
 */
//crear un nuevo pedido
router.post('/', crearPedido);

/**
 * GET /verificar-activo/:idUsuario/:idProducto
 * Verificar si un usuario tiene un pedido activo para un producto.
 * Params: idUsuario, idProducto
 */
//verificar si un usuario tiene pedido activo para un producto
router.get('/verificar-activo/:idUsuario/:idProducto', verificarPedidoActivo);

/**
 * PUT /:id
 * Editar un pedido existente (por ejemplo, actualizar estado o detalles).
 * Params: id - ID del pedido.
 */
//editar un pedido existente
router.put('/:id', editarPedido);

/**
 * PATCH /:id/cancelar
 * Cancelar un pedido (marcar como cancelado según reglas de negocio).
 * Params: id - ID del pedido.
 */
//cancelar un pedido (delete lógico con PATCH)
router.patch('/:id/cancelar', cancelarPedido);

/**
 * PATCH /:id/actualizar
 * Actualizar la dirección de envío de un pedido (comprador).
 * Params: id - ID del pedido. Body: direccionEnvio
 */
//actualizar direccion de un pedido (PATCH)
router.patch('/:id/actualizar', actualizarPedido);

/**
 * PATCH /:id/eliminar
 * Eliminar lógicamente un pedido (marcar flag de eliminación).
 * Params: id - ID del pedido.
 */
//eliminar un pedido (delete lógico con PATCH)
router.patch('/:id/eliminar', eliminarPedido);

module.exports = router;
