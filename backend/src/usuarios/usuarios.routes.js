/**
 * Rutas del módulo usuarios (backend)
 * - Estas rutas se montan en `/usuarios`.
 */
// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();
const { requireAuth  } = require('../middlewares/auth.middlewares.js');

// Importa las funciones del controlador que se van a ejecutar cuando se llame cada ruta
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorNombre,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  verificarEmail,
  verificarContrasenaActual,
} = require('./usuarios.controller');

const path = require('path');

/**
 * POST /usuarios
 * - Crear un nuevo usuario (registro).
 */
// Ruta para crear un nuevo usuario (registro)
router.post('/', crearUsuario);

/**
 * GET /usuarios
 * - Obtener lista de usuarios (opcionalmente filtrada).
 */
// Ruta para obtener todos los usuarios
router.get('/', obtenerUsuarios);

/**
 * GET /usuarios/:id
 * - Obtener un usuario por su ID (requiere autenticación mínima).
 */
// Ruta para obtener un usuario por ID
router.get('/:id',requireAuth, obtenerUsuarioPorId);

/**
 * GET /usuarios/nombre/:nombre
 * - Obtener un usuario por su nombre de usuario.
 */
// obtener un usuario por nombre
router.get('/nombre/:nombre', obtenerUsuarioPorNombre);

/**
 * GET /usuarios/verificar-email/:email
 * - Verifica si un email está registrado.
 */
// Ruta para verificar si un email ya existe (sin API key requerida)
router.get('/verificar-email/:email', verificarEmail);

/**
 * POST /usuarios/verificar-contrasena
 * - Verifica la contraseña actual de un usuario (body: { userId, contrasenaActual }).
 */
// Ruta para verificar contraseña actual del usuario
router.post('/verificar-contrasena', verificarContrasenaActual);

/**
 * PUT /usuarios/:id
 * - Actualiza la información de un usuario (requiere autenticación).
 */
// editar un usuario existente
router.put('/:id',requireAuth, actualizarUsuario);

/**
 * PATCH /usuarios/:id
 * - Deshabilita (marca inactivo) a un usuario.
 */
// eliminar un usuario por ID
router.patch('/:id',requireAuth, eliminarUsuario);

// Ruta para obtener municipios por departamento
router.get('/municipios-por-departamento', (req, res) => {
  try {
    const municipiosPath = path.join(__dirname, '..', 'servicios', 'municipios_por_departamento.json');
    const municipiosData = require(municipiosPath);
    res.json(municipiosData);
  } catch (error) {
    console.error('Error cargando municipios:', error);
    res.status(500).json({ error: 'Error al cargar municipios' });
  }
});

module.exports = router;
