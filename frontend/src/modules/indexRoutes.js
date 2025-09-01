const express = require('express');
const router = express.Router();

// Importar todos los routers individuales
const LandingRoutes = require('../modules/landing/landing.front.routes');
const usuarioRoutes = require('../modules/usuarios/usuarios.front.routes');
const authRoutes = require('../modules/autenticacion/autenticacion.front.routes');
//const productoRoutes = require('./productos/producto.front.routes');

//const contactanosRoutes = require('./contacto.routes');
//const emprendimientoRoutes = require('./emprendimiento.routes');

router.use('/', LandingRoutes);
router.use('/', usuarioRoutes);
router.use('/', authRoutes)
//router.use('/contactanos', contactanosRoutes);
//router.use('/productos', productoRoutes);
//router.use('/', emprendimientoRoutes);

module.exports = router;
