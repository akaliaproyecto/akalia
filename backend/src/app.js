const express = require('express');
const cors = require('cors');
const session = require('express-session');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const path = require('path');
const app = express();
const { validateApiKey } = require('./middlewares/apiKey.Middlewares.js');

const bodyParser = require('body-parser')

dotenv.config();


/*CONFIGURACIÓN DE MIDDLEWARES*/
// Parsers

app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//CORS (Frontend y backend en orígenes distintos)
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'akalia-api-key'] // Agregar header de API key
}));

//Sesiones
app.set('trust proxy', 1); // Para habilitar el uso de cookies en HTTPS 


app.use(session({
  name: 'session-1',
  secret: process.env.SESSION_SECRET || 'mi_super_secreto_seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true, // para que JS en frontend no acceda a la cookie
  }
}));

//Method Override
app.use(methodOverride('_method'));

// Servir archivos estáticos del frontend (imágenes, js, css) si se necesita
app.use('/images', express.static(path.join(__dirname, '../../frontend/src/public/img')));
// También exponemos el resto de assets públicos si se usa directamente
app.use('/public', express.static(path.join(__dirname, '../../frontend/src/public')));

//Manejo de errores 
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Error interno',
    error: err.message || 'Ocurrió un error inesperado'
  });
});


/*MONTAJE DE RUTAS*/

//AUTENTICACIÓN
const authRoutes = require('./autenticacion/auth.routes.js');
app.use("/auth", validateApiKey, authRoutes);

//PRODUCTOS
const productosRouter = require("./productos/productos.routes.js");
app.use("/productos", validateApiKey, productosRouter);

// PEDIDOS
const pedidosRouter = require('./pedidos/pedido.routes.js');
app.use("/pedidos", validateApiKey, pedidosRouter);

// USUARIOS RUTA
const usuariosRoutes = require('./usuarios/usuarios.routes.js');
app.use('/usuarios', validateApiKey, usuariosRoutes);

// CATEGORIAS RUTA
const categoriasRoutes = require('./categorias/categorias.routes.js');
app.use('/categorias', validateApiKey, categoriasRoutes);

// ETIQUETAS RUTA
const etiquetasRoutes = require('./etiquetas/etiquetas.routes.js');
app.use('/etiquetas', validateApiKey, etiquetasRoutes);

// EMPRENDIMIENTOS
const emprendimientosRoutes = require('./emprendimientos/emprendimiento.route.js');
app.use('/emprendimientos', validateApiKey, emprendimientosRoutes);

// COMISIONES
const comisionesRoutes = require('./comisiones/comision.routes.js');
app.use('/comisiones', validateApiKey, comisionesRoutes);

// CAPTCHA
const captchaRoutes = require('./captcha/captcha.routes.js')
app.use('/captcha', validateApiKey, captchaRoutes)

module.exports = app;