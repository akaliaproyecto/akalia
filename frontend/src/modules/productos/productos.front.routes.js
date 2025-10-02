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
  mostrarEditarProducto,
  procesarEditarProducto,
  procesarEliminarProducto,
  mostrarProductosPorCategoria,
  mostrarProductosFiltrados,
  mostrarResultadosBusqueda
} = require('./productos.services');


// Ruta SIN id (muestra los productos para el usuario autenticado o lista vacía)
router.get('/productos/usuario-productos', listarProductosUsuario);

// Ruta CON id (muestra los productos para el id provisto en la URL)
router.get('/productos/usuario-productos/:id', listarProductosUsuario);

// Ruta GET para mostrar detalle de un producto
router.get('/productos/usuario-productos/ver/:id', mostrarDetalleProducto);

// Ruta POST para crear un nuevo producto (con subida de imágenes)
router.post('/productos/usuario-productos/crear', uploadMemory.array('imagenes', 10), procesarCrearProducto);
//uploadMemory.array('imagenes', 10) es un middleware de multer que: espera un campo del formulario llamado "imagenes". acepta hasta 10 archivos en ese campo. guarda cada archivo en memoria (memoryStorage) como Buffer en req.files (no crea archivos en disco).

// Ruta GET para cargar el formulario de edición (se renderiza como modal en el cliente)
router.get('/productos/usuario-productos/editar/:id', mostrarEditarProducto);

// Ruta POST para procesar la edición del producto (proxya al backend vía PUT)
router.post('/productos/usuario-productos/editar/:id', uploadMemory.array('imagenes', 10), procesarEditarProducto);

// Ruta POST para procesar la eliminación de un producto
router.post('/productos/usuario-productos/eliminar/:id', procesarEliminarProducto);

// Ruta SSR: mostrar productos filtrados por categoría
router.get('/productos/categoria/:id', mostrarProductosPorCategoria);

// Ruta SSR alternativa para compatibilidad con el cliente que usa /productos/filtrar
router.get('/productos/filtrar', mostrarProductosFiltrados);

// Ruta simple para búsqueda desde el navbar: /buscar?q=termino
router.get('/buscar', mostrarResultadosBusqueda);

module.exports = router;
