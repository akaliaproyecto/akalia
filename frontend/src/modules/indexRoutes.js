/**
 * @file Index de rutas frontend
 * @description Agrupa y exporta las rutas del frontend para la aplicación.
 * - Exporta un router que monta los routers de cada módulo (landing, usuarios, auth, etc.)
 */
const express = require('express');
const router = express.Router();

// Importar todos los routers individuales
const LandingRoutes = require('../modules/landing/landing.front.routes');
const usuarioRoutes = require('../modules/usuarios/usuarios.front.routes');
const authRoutes = require('../modules/autenticacion/autenticacion.front.routes');
const emprendimientoRoutes = require('../modules/emprendimientos/emprendimientos.front.routes');
const productoRoutes = require('../modules/productos/productos.front.routes');
const captchaRoutes = require('./captcha/captcha.front.routes');
const pedidosRoutes = require('../modules/pedidos/pedidos.front.routes');
const footerRoutes = require('../modules/footer/footer.front.routes');
//const productoRoutes = require('./productos/producto.front.routes');
//const contactanosRoutes = require('./contacto.routes');



router.use('/', LandingRoutes);
router.use('/', usuarioRoutes);
router.use('/', authRoutes);
router.use('/', emprendimientoRoutes);
router.use('/', productoRoutes);
router.use('/', captchaRoutes);
router.use('/', pedidosRoutes);
router.use('/', footerRoutes);

//router.use('/contactanos', contactanosRoutes);

module.exports = router;
