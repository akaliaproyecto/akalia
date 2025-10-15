/**
 * @file Rutas frontend CAPTCHA
 * @description Rutas del servidor frontend que actúan como proxy hacia el backend para CAPTCHA.
 */
const express = require('express');
const router = express.Router();

const { generarCaptcha, validarCaptcha } = require('./captcha.services.js');

/**
 * GET /generar-captcha
 * Solicita al backend el SVG del captcha y lo devuelve al cliente.
 */
router.get('/generar-captcha', generarCaptcha);

/**
 * POST /validar-captcha
 * Envía el valor del captcha al backend para su validación.
 */
router.post('/validar-captcha', validarCaptcha);

module.exports = router;