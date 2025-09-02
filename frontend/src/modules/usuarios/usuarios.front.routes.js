/* En este archivo se definen las rutas disponibles para este módulo. Cada ruta recibe las solicitudes (requests) desde el navegador y las envía al servicio correspondiente para manejar la lógica. */

const express = require('express');
const router = express.Router();

const {
  obtenerUsuario,
  actualizarPerfilUsuario,
  validarContrasenaUsuario,
  desactivarCuentaUsuario
} = require('./usuarios.services')

/* Ruta GET para obtener el perfil del usuario */
router.get('/mi-perfil', obtenerUsuario);

/* Ruta PUT para actualizar el perfil del usuario */
router.put('/actualizar-perfil-usuario/:id', actualizarPerfilUsuario);

/* ruta POST para validar contraseña */
router.post('/validar-contrasena-usuario/:id', validarContrasenaUsuario);

/* Ruta PUT para desactivar usuario */
router.put('/desactivar-cuenta-usuario/:id', desactivarCuentaUsuario);

module.exports = router;