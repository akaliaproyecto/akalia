// routes/orden.routes.js
const express = require('express');
const router = express.Router();
const nuevaOrden = require('../controller/mercadopago.controller');

router.post('/crear', nuevaOrden);

module.exports = router;
