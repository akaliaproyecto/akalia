// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();

// Importa las funciones del controlador que se van a ejecutar cuando se llame cada ruta
const {
  obtenerProductos,
  obtenerProductoPorId,
  obtenerProductoPorNombre,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('./productos.controller');


// obtener todos los productos
router.get('/productos', obtenerProductos);

// obtener un producto por ID
router.get('/productos/:id', obtenerProductoPorId);

// obtener un producto por nombre
router.get('/productos/nombre/:nombre', obtenerProductoPorNombre);

// crear un nuevo producto
router.post('/productos', crearProducto);

// editar un producto existente
router.put('/productos/:id', actualizarProducto);

// eliminar un producto por ID
router.delete('/productos/:id', eliminarProducto);

module.exports = router;
