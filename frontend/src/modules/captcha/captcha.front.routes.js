const express = require('express');
const router = express.Router();

const { generarCaptcha, validarCaptcha } = require('./captcha.services.js');

/* ruta get para obtener el captcha */
router.get('/generar-captcha', generarCaptcha);

/* ruta post para validar captcha */
router.post('/validar-captcha', validarCaptcha);

module.exports = router;