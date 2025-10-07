/* En este archivo se definen las rutas disponibles para este módulo. Cada ruta recibe las solicitudes (requests) desde el navegador y las envía al servicio correspondiente para manejar la lógica. */

const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  iniciarSesion, logout
} = require('./autenticacion.services')

/* ruta post para registrar un nuevo usuario */
router.post('/registro', registrarUsuario);

/* ruta post para iniciar sesión */
router.post('/login', iniciarSesion);

/* ruta post para iniciar sesión */
router.post('/logout', logout);

module.exports = router;