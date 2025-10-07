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
  procesarEliminarProducto
} = require('./productos.services');


// Ruta SIN id (muestra los productos para el usuario autenticado o lista vacía)
router.get('/productos/usuario-productos', listarProductosUsuario);

// Ruta CON id (muestra los productos para el id provisto en la URL)
router.get('/productos/usuario-productos/:id', listarProductosUsuario);

// Ruta GET para mostrar detalle de un producto
router.get('/productos/usuario-productos/ver/:id', mostrarDetalleProducto);

// Ruta POST para crear un nuevo producto (con subida de imágenes)
router.post('/productos/usuario-productos/crear', uploadMemory.array('imagenes', 10), procesarCrearProducto);

// Ruta POST para procesar la edición del producto (proxya al backend vía PUT)
router.post('/productos/usuario-productos/editar/:id', uploadMemory.array('imagenes', 10), procesarEditarProducto);

// Ruta POST para procesar la eliminación de un producto
router.post('/productos/usuario-productos/eliminar/:id', procesarEliminarProducto);

module.exports = router;
