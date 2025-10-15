/**
 * @file Rutas frontend de autenticación
 * @description Define rutas que el frontend usa para mostrar formularios y reenviar peticiones al backend.
 */

const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  iniciarSesion, logout, resetearContrasena, recuperarContrasena
} = require('./autenticacion.services')

/**
 * POST /registro
 * Ruta que recibe datos del formulario de registro y llama al servicio para crear usuario.
 */
router.post('/registro', registrarUsuario);

/**
 * POST /login
 * Recibe credenciales desde el formulario y realiza login vía servicio.
 */
router.post('/login', iniciarSesion);

/**
 * POST /logout
 * Cierra sesión en el frontend y backend.
 */
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