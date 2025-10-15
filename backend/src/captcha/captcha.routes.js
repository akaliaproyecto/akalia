/**
 * @file Rutas CAPTCHA (backend)
 * @description Define endpoints para generar y validar CAPTCHA.
 */
const express = require('express');
const router = express.Router();

const {generarCaptcha, validarCaptcha} = require('./captcha.controller');

/**
 * GET /captcha/generar
 * Devuelve un SVG con el captcha y guarda el texto en sesión.
 */
router.get('/generar', generarCaptcha)

/**
 * POST /captcha/validar
 * Valida el captcha enviado en el body contra el guardado en sesión.
 */
router.post('/validar', validarCaptcha);

module.exports = router;