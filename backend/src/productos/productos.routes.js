// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();
const { requireAuth  } = require('../middlewares/auth.middlewares.js');
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


/**
 * GET /
 * Obtener todos los productos disponibles
 */
// obtener todos los productos
router.get('/', obtenerProductos);

/**
 * GET /emprendimiento/:idEmprendimiento
 * Obtener productos de un emprendimiento (requiere autenticación)
 * Params: idEmprendimiento
 */
// obtener productos por emprendimiento 
router.get('/emprendimiento/:idEmprendimiento',requireAuth, obtenerProductosEmprendimiento);

/**
 * GET /usuarios/:id
 * Obtener todos los productos de los emprendimientos de un usuario (requiere autenticación)
 * Params: id - ID del usuario
 */
// obtener productos por usuario (todos los productos de sus emprendimientos)
router.get('/usuarios/:id',requireAuth, obtenerProductosPorUsuario);

/**
 * GET /nombre/:nombre
 * Buscar productos por nombre parcial
 * Params: nombre - término de búsqueda
 */
// obtener por nombre 
router.get('/nombre/:nombre', obtenerProductoPorNombre);

/**
 * GET /categoria/:idCategoria
 * Obtener productos por categoría (id de la categoría)
 */
// Obtener productos de una categoría específica (poner antes de '/:id')
router.get('/categoria/:idCategoria', obtenerProductosPorCategoria);

/**
 * GET /filtrar
 * Obtener productos aplicando filtros por querystring (ordenar, min, max)
 */
// Obtener todos los productos aplicando filtros por querystring (ordenar,min,max)
router.get('/filtrar', filtrarProductos);

/**
 * GET /:id
 * Obtener un producto por su ID
 * Params: id - ID del producto
 */
// obtener un producto por ID (genérica)
router.get('/:id', obtenerProductoPorId);

/**
 * POST /
 * Crear un nuevo producto (requiere autenticación)
 * Form-data: campos del producto + imagenes[] (hasta 10)
 */
// crear un nuevo producto
router.post('/',requireAuth, subirImagen.array('imagenes', 10), crearProducto);

/**
 * PUT /:id
 * Editar un producto existente (requiere autenticación)
 * Params: id - ID del producto
 * Form-data: campos del producto + imagenes[] (opcional)
 */
// editar un producto existente
router.put('/:id',requireAuth, subirImagen.array('imagenes', 10), actualizarProducto);

/**
 * PATCH /:id/eliminar
 * Eliminar lógicamente un producto (requiere autenticación)
 * Params: id - ID del producto
 */
// borrado lógico de un producto por ID 
router.patch('/:id/eliminar',requireAuth, eliminarProducto);

module.exports = router;
