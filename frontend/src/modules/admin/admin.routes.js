const express = require('express');
const router = express.Router();

// Importar servicios
const {
  obtenerDashboard,
  listarUsuarios,
  listarProductos,
  listarEmprendimientos,
  listarPedidos,
  mostrarConfiguracion
} = require('./admin.services');

// Middleware para verificar que el usuario sea admin
/**
 * Middleware que verifica si el usuario actual tiene rol de administrador.
 * - Decodifica la cookie `usuario` y comprueba `rolUsuario`.
 * - Si no tiene permisos devuelve una vista de error 403.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
const requireAdmin = (req, res, next) => {
  const usuario = req.cookies.usuario ? JSON.parse(decodeURIComponent(req.cookies.usuario)) : null;
  
  if (!usuario || (usuario.rolUsuario !== 'admin' && usuario.rolUsuario !== 'administrador')) {
    console.log('Error en usuario admin - Rol:', usuario?.rolUsuario);
    return res.status(403).render('pages/error', {
      titulo: 'Acceso Denegado',
      mensaje: 'No tienes permisos para acceder a esta página',
      usuario: usuario
    });
  }
  
  next();
};

// ==================== RUTAS ====================

// Dashboard principal
router.get('/', requireAdmin, obtenerDashboard);

// Gestión de Usuarios
router.get('/usuarios', requireAdmin, listarUsuarios);

// Gestión de Productos
router.get('/productos', requireAdmin, listarProductos);

// Gestión de Emprendimientos
router.get('/emprendimientos', requireAdmin, listarEmprendimientos);

// Gestión de Pedidos
router.get('/pedidos', requireAdmin, listarPedidos);

// Configuración del Sistema (Categorías y Etiquetas)
router.get('/configuracion', requireAdmin, mostrarConfiguracion);

module.exports = router;
