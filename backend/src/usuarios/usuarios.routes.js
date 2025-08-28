// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();

// Importa las funciones del controlador que se van a ejecutar cuando se llame cada ruta
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorNombre,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('./usuarios.controller');


// Ruta para crear un nuevo usuario (registro)
router.post('/', crearUsuario);

// Ruta para obtener todos los usuarios
router.get('/', obtenerUsuarios);

// Ruta para obtener un usuario por ID
router.get('/:id', obtenerUsuarioPorId);

// obtener un usuario por nombre
router.get('/nombre/:nombre', obtenerUsuarioPorNombre);

// editar un usuario existente
router.put('/:id', actualizarUsuario);

// eliminar un usuario por ID
router.patch('/:id', eliminarUsuario);

module.exports = router;
