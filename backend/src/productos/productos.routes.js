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
  eliminarProducto,
  obtenerProductosEmprendimiento
} = require('./productos.controller');


// obtener todos los productos
router.get('/', obtenerProductos);

// obtener productos por emprendimiento 
router.get('/emprendimiento/:idEmprendimiento', obtenerProductosEmprendimiento);

// obtener por nombre 
router.get('/nombre/:nombre', obtenerProductoPorNombre);

// obtener un producto por ID (genérica)
router.get('/:id', obtenerProductoPorId);

// crear un nuevo producto
router.post('/', subirImagen.array('imagenes', 10), crearProducto);

// editar un producto existente
router.put('/:id', subirImagen.array('imagenes', 10), actualizarProducto);

// borrado lógico de un producto por ID 
router.patch('/:id/eliminar', eliminarProducto);

module.exports = router;
