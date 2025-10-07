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
  obtenerProductosEmprendimiento,
  obtenerProductosPorUsuario,
  obtenerProductosPorCategoria,
  filtrarProductos,
} = require('./productos.controller');


// obtener todos los productos
router.get('/', obtenerProductos);

// obtener productos por emprendimiento 
router.get('/emprendimiento/:idEmprendimiento',requireAuth, obtenerProductosEmprendimiento);

// obtener productos por usuario (todos los productos de sus emprendimientos)
router.get('/usuarios/:id',requireAuth, obtenerProductosPorUsuario);

// obtener por nombre 
router.get('/nombre/:nombre', obtenerProductoPorNombre);

// Obtener productos de una categoría específica (poner antes de '/:id')
router.get('/categoria/:idCategoria', obtenerProductosPorCategoria);

// Obtener todos los productos aplicando filtros por querystring (ordenar,min,max)
router.get('/filtrar', filtrarProductos);

// obtener un producto por ID (genérica)
router.get('/:id', obtenerProductoPorId);

// crear un nuevo producto
router.post('/',requireAuth, subirImagen.array('imagenes', 10), crearProducto);

// editar un producto existente
router.put('/:id',requireAuth, subirImagen.array('imagenes', 10), actualizarProducto);

// borrado lógico de un producto por ID 
router.patch('/:id/eliminar',requireAuth, eliminarProducto);

module.exports = router;
