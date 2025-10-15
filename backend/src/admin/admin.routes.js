const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middlewares/auth.middlewares.js');
const subirImagen = require('../middlewares/manejadorImg.js');

// Controladores (los crearemos después)
const {
  obtenerEstadisticas,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  obtenerEmprendimientos,
  obtenerEmprendimientoPorId,
  actualizarEmprendimiento,
  eliminarEmprendimiento,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerEtiquetas,
  crearEtiqueta,
  actualizarEtiqueta,
  eliminarEtiqueta
} = require('./admin.controllers.js');

// Log para debug de rutas admin
router.use((req, res, next) => {
  console.log('Admin Route:', req.method, req.path);
  console.log('Cookies:', req.cookies);
  console.log('Session ID:', req.session?.id);
  console.log(' Usuario en sesión:', req.session?.usuario);
  next();
});

// Middleware de autenticación y admin para todas las rutas
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard - Estadísticas
router.get('/estadisticas', obtenerEstadisticas);

// Gestión de Usuarios
router.get('/usuarios', obtenerUsuarios);
router.get('/usuarios/:id', obtenerUsuarioPorId);
router.put('/usuarios/:id', actualizarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);

// Gestión de Productos
router.get('/productos', obtenerProductos);
router.get('/productos/:id', obtenerProductoPorId);
router.put('/productos/:id', actualizarProducto);
router.delete('/productos/:id', eliminarProducto);

// Gestión de Emprendimientos
router.get('/emprendimientos', obtenerEmprendimientos);
router.get('/emprendimientos/:id', obtenerEmprendimientoPorId);
router.put('/emprendimientos/:id', actualizarEmprendimiento);
router.delete('/emprendimientos/:id', eliminarEmprendimiento);

// Gestión de Pedidos
router.get('/pedidos', obtenerPedidos);
router.get('/pedidos/:id', obtenerPedidoPorId);
router.put('/pedidos/:id', actualizarPedido);

// Gestión de Categorías (con upload de imágenes)
router.get('/categorias', obtenerCategorias);
router.post('/categorias', subirImagen.single('imagen'), crearCategoria);
router.put('/categorias/:id', subirImagen.single('imagen'), actualizarCategoria);
router.delete('/categorias/:id', eliminarCategoria);

// Gestión de Etiquetas
router.get('/etiquetas', obtenerEtiquetas);
router.post('/etiquetas', crearEtiqueta);
router.put('/etiquetas/:id', actualizarEtiqueta);
router.delete('/etiquetas/:id', eliminarEtiqueta);

module.exports = router;
