// Rutas frontend relacionadas con productos (versión simple y comentada)
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Usamos memoryStorage en el frontend para recibir archivos temporalmente
// y poder reenviarlos al backend usando axios/form-data.
const almacenamientoEnMemoria = multer.memoryStorage();
const uploadMemory = multer({ storage: almacenamientoEnMemoria });

const productosServices = require('./productos.services');


// Ruta SIN id (muestra los productos para el usuario autenticado o lista vacía)
router.get('/productos/usuario-productos', productosServices.listarProductosUsuario);

// Ruta CON id (muestra los productos para el id provisto en la URL)
router.get('/productos/usuario-productos/:id', productosServices.listarProductosUsuario);

// Nueva ruta POST que procesa el formulario multipart enviado desde el modal de creación
// Recibe hasta 10 archivos en el campo 'imagenes' (coincide con el backend)
// La función `procesarCrearProducto` en productos.services se encargará de reenviar
// la información al backend y devolver la respuesta adecuada.
router.post('/productos/usuario-productos/crear', uploadMemory.array('imagenes', 10), productosServices.procesarCrearProducto);

module.exports = router;
