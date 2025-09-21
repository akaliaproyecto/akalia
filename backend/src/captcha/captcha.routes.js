const express = require('express');
const router = express.Router();

const {generarCaptcha, validarCaptcha} = require('./captcha.controller');

//Generar nuevo captcha

router.get('/generar', generarCaptcha)

//Validar captcha (en tiempo real)
router.post('/validar', validarCaptcha);

module.exports = router;