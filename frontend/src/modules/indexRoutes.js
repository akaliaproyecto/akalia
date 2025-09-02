const express = require('express');
const router = express.Router();

// Importar todos los routers individuales
const LandingRoutes = require('../modules/landing/landing.front.routes');
const usuarioRoutes = require('../modules/usuarios/usuarios.front.routes');
const authRoutes = require('../modules/autenticacion/autenticacion.front.routes');
const emprendimientoRoutes = require('../modules/emprendimientos/emprendimientos.front.routes');

//const productoRoutes = require('./productos/producto.front.routes');
//const contactanosRoutes = require('./contacto.routes');


router.use('/', LandingRoutes);
router.use('/', usuarioRoutes);
router.use('/', authRoutes);
router.use('/', emprendimientoRoutes);
//router.use('/contactanos', contactanosRoutes);
//router.use('/productos', productoRoutes);


module.exports = router;
