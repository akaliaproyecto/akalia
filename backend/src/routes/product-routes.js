const express = require('express');
const router = express.Router();

const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/products.controller');


// obtener todos los productos
router.get('/productos', obtenerProductos);

// obtener un producto por ID
router.get('/productos/:id', obtenerProductoPorId);

// crear un producto
router.post('/productos', crearProducto);

// actualizar un producto
router.put('/productos/:id', actualizarProducto);

// eliminar un producto por ID
router.delete('/productos/:id', eliminarProducto);

module.exports = router;
