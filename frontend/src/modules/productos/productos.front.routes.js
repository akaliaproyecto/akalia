// Rutas frontend relacionadas con productos (versión simple y comentada)
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Usamos memoryStorage en el frontend para recibir archivos temporalmente
// y poder reenviarlos al backend usando axios/form-data.
const almacenamientoEnMemoria = multer.memoryStorage();
const uploadMemory = multer({ storage: almacenamientoEnMemoria });

//const productosServices = require('./productos.services');

const {
  listarProductosUsuario,
  mostrarDetalleProducto,
  procesarCrearProducto,
  procesarEditarProducto,
  procesarEliminarProducto,
  mostrarProductosPorCategoria,
  mostrarProductosFiltrados,
 mostrarResultadosBusqueda
} = require('./productos.services');


/**
 * GET /productos/usuario-productos
 * Mostrar productos del usuario autenticado (lista)
 */
// Ruta SIN id (muestra los productos para el usuario autenticado o lista vacía)
router.get('/productos/usuario-productos', listarProductosUsuario);

/**
 * GET /productos/usuario-productos/:id
 * Mostrar productos para el usuario con id especificado
 * Params: id - ID del usuario
 */
// Ruta CON id (muestra los productos para el id provisto en la URL)
router.get('/productos/usuario-productos/:id', listarProductosUsuario);

/**
 * GET /productos/usuario-productos/ver/:id
 * Mostrar detalle de un producto para edición/visualización
 * Params: id - ID del producto
 */
// Ruta GET para mostrar detalle de un producto
router.get('/productos/usuario-productos/ver/:id', mostrarDetalleProducto);

/**
 * POST /productos/usuario-productos/crear
 * Procesar creación de producto desde formulario (subida en memoria)
 */
// Ruta POST para crear un nuevo producto (con subida de imágenes)
router.post('/productos/usuario-productos/crear', uploadMemory.array('imagenes', 10), procesarCrearProducto);
//uploadMemory.array('imagenes', 10) es un middleware de multer que: espera un campo del formulario llamado "imagenes". acepta hasta 10 archivos en ese campo. guarda cada archivo en memoria (memoryStorage) como Buffer en req.files (no crea archivos en disco).

/**
 * POST /productos/usuario-productos/editar/:id
 * Procesar edición de producto (envía multipart/form-data al backend)
 */
// Ruta POST para procesar la edición del producto (proxya al backend vía PUT)
router.post('/productos/usuario-productos/editar/:id', uploadMemory.array('imagenes', 10), procesarEditarProducto);

/**
 * POST /productos/usuario-productos/eliminar/:id
 * Procesar eliminación lógica de un producto (SSR)
 */
// Ruta POST para procesar la eliminación de un producto
router.post('/productos/usuario-productos/eliminar/:id', procesarEliminarProducto);

/**
 * GET /productos/categoria/:id
 * Mostrar productos filtrados por categoría (SSR)
 */
// Ruta SSR: mostrar productos filtrados por categoría
router.get('/productos/categoria/:id', mostrarProductosPorCategoria);

/**
 * GET /productos/filtrar
 * Mostrar productos con filtros (orden, min, max)
 */
// Ruta SSR alternativa para compatibilidad con el cliente que usa /productos/filtrar
router.get('/productos/filtrar', mostrarProductosFiltrados);

/**
 * GET /buscar?q=termino
 * Buscar productos por término (desde navbar)
 */
// Ruta simple para búsqueda desde el navbar: /buscar?q=termino
router.get('/buscar', mostrarResultadosBusqueda);

module.exports = router;
