// Importa Express y crea un router para definir las rutas de pedidos
const express = require('express');
const router = express.Router();

// Importa las funciones del controlador que se van a ejecutar cuando se llame cada ruta
const {
  obtenerPedidos,
  obtenerPedidosPorId,
  crearPedido,
  editarPedido,
  eliminarPedido
} = require('./pedido.controller');

//obtener todos los pedidos
router.get('/pedidos', obtenerPedidos);

//obtener un pedido por id
router.get('/pedidos/:id', obtenerPedidosPorId);

//crear un nuevo pedido
router.post('/pedidos', crearPedido);

//editar un pedido existente
router.put('/pedidos/:id', editarPedido);

//borrado lógico de un pedido por ID 
router.patch('/pedidos/:id/eliminar', eliminarPedido);

module.exports = router;
