// rutas de pasarela/mercadopago
const express = require('express');
const router = express.Router();

// Importar el controlador que crea la preferencia de MercadoPago
// El controlador está en el mismo directorio (./mercadopago.controller.js)
const nuevaOrden = require('./mercadopago.controller');

// POST /pasarela/crear -> crea preferencia en MercadoPago
router.post('/crear', nuevaOrden);

module.exports = router;
