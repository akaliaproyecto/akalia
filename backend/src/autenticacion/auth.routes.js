// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();

const {
  iniciarSesion, logout, mfaVerify, twoFASetup, twoFAVerifySetup, me, verificarSesion,
  forgotPassword, resetPassword
} = require('./auth.controller');

const { requireAuth } = require('../middlewares/auth.middlewares');

router.post('/login',  iniciarSesion);
//router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/mfa',  requireAuth, mfaVerify);
router.get('/me', requireAuth, me);

router.get('/verificar-sesion', verificarSesion);

// Setup 2FA

router.get('/2fa/setup',  requireAuth, twoFASetup);
router.post('/2fa/verify-setup',  requireAuth, twoFAVerifySetup);

module.exports = router;