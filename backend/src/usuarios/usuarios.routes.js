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


// obtener todos los usuarios
router.get('/usuarios', obtenerUsuarios);

// obtener un usuario por ID
router.get('/usuarios/:id', obtenerUsuarioPorId);

// obtener un usuario por nombre
router.get('/usuarios/nombre/:nombre', obtenerUsuarioPorNombre);

// crear un nuevo usuario
router.post('/usuarios', crearUsuario);

// editar un usuario existente
router.put('/usuarios/:id', actualizarUsuario);

// eliminar un usuario por ID
router.patch('/usuarios/:id', eliminarUsuario);

module.exports = router;
