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
  eliminarPedido
} = require('./pedido.controller');

//obtener todos los pedidos
router.get('/', obtenerPedidos);

//obtener todos los pedidos
router.get('/ventas/:id', obtenerVentas);

//obtener todos los pedidos
router.get('/compras/:id', obtenerCompras);

//obtener un pedido por id
router.get('/:id', obtenerPedidosPorId);

//crear un nuevo pedido
router.post('/', crearPedido);

//editar un pedido existente
router.put('/:id', editarPedido);

//cancelar un pedido (delete lógico con PATCH)
router.patch('/:id/cancelar', cancelarPedido);

//actualizar direccion de un pedido (PATCH)
router.patch('/:id/actualizar', actualizarPedido);

//eliminar un pedido (delete lógico con PATCH)
router.patch('/:id/eliminar', eliminarPedido);

module.exports = router;
