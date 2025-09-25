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

// Ruta para crear un nuevo usuario (registro)
router.post('/', crearUsuario);

// Ruta para obtener todos los usuarios
router.get('/', obtenerUsuarios);

// Ruta para obtener un usuario por ID
router.get('/:id',requireAuth, obtenerUsuarioPorId);

// obtener un usuario por nombre
router.get('/nombre/:nombre', obtenerUsuarioPorNombre);

// Ruta para verificar si un email ya existe (sin API key requerida)
router.get('/verificar-email/:email', verificarEmail);

// Ruta para verificar contraseña actual del usuario
router.post('/verificar-contrasena', verificarContrasenaActual);

// editar un usuario existente
router.put('/:id',requireAuth, actualizarUsuario);

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
