/**
 * @file Rutas de autenticación
 * @description Define los endpoints relacionados con autenticación (login, logout, 2FA, forgot/reset password).
 * Comentarios en español y pensados para estudiantes.
 */
// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();

const {
  iniciarSesion, logout, mfaVerify, twoFASetup, twoFAVerifySetup, me, verificarSesion,
  forgotPassword, resetPassword
} = require('./auth.controller');

const { requireAuth } = require('../middlewares/auth.middlewares');

/**
 * POST /auth/login
 * Inicia sesión con correo y contraseña.
 */
router.post('/login',  iniciarSesion);
//router.post('/login', login);
/**
 * POST /auth/logout
 * Cierra la sesión del usuario (requiere autenticación).
 */
router.post('/logout', requireAuth, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/mfa',  requireAuth, mfaVerify);
router.get('/me', requireAuth, me);

router.get('/verificar-sesion', verificarSesion);

// Setup 2FA

/**
 * GET /auth/2fa/setup
 * Inicia la configuración de 2FA (genera secreto y QR).
 */
router.get('/2fa/setup',  requireAuth, twoFASetup);
/**
 * POST /auth/2fa/verify-setup
 * Verifica el código durante la configuración de 2FA.
 */
router.post('/2fa/verify-setup',  requireAuth, twoFAVerifySetup);

module.exports = router;