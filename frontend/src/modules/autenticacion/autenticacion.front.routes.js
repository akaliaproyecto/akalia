/* En este archivo se definen las rutas disponibles para este módulo. Cada ruta recibe las solicitudes (requests) desde el navegador y las envía al servicio correspondiente para manejar la lógica. */

const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  iniciarSesion, logout, resetearContrasena, recuperarContrasena
} = require('./autenticacion.services')

/* ruta post para registrar un nuevo usuario */
router.post('/registro', registrarUsuario);

/* ruta post para iniciar sesión */
router.post('/login', iniciarSesion);

/* ruta post para iniciar sesión */
router.post('/logout', logout);

// Page to request password recovery (GET shows form, POST sends email)
router.get('/usuario-recuperar-contrasena', (req, res) => {
  return res.render('pages/usuario-recuperar-contrasena');
});

router.post('/usuario-recuperar-contrasena', recuperarContrasena);

router.get('/usuario-reset-password', (req, res) => {
  const { token, id } = req.query;
  return res.render('pages/usuario-reset-password', { token: token || '', id: id || '' });
});
  
router.post('/usuario-reset-password', resetearContrasena);

module.exports = router;