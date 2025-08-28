// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();
const subirImagen = require('../middlewares/manejadorImg.js'); // Importa el middleware de subida de imágenes

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
router.get('/', obtenerProductos);

// obtener un producto por ID
router.get('/:id', obtenerProductoPorId);

// obtener un producto por nombre
router.get('/nombre/:nombre', obtenerProductoPorNombre);

// crear un nuevo producto
router.post('/', subirImagen.array('imagenes', 10), crearProducto);

// editar un producto existente
router.put('/:id', subirImagen.array('imagenes', 10), actualizarProducto);

// borrado lógico de un producto por ID 
router.patch('/:id/eliminar', eliminarProducto);

module.exports = router;
