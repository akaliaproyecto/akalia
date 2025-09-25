const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
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
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'https://akalia-app.onrender.com',
      'http://localhost:4666'
    ].filter(Boolean);
    
    console.log('🔍 CORS - Origin:', origin);
    console.log('🔍 CORS - Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('❌ CORS - Origin not allowed:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'akalia-api-key', 'Origin', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

//Sesiones
app.set('trust proxy', 1); // Para habilitar el uso de cookies en HTTPS 

// Configuración de sesiones con MongoDB store para producción
const sessionConfig = {
  name: 'session-1',
  secret: process.env.SESSION_SECRET || 'mi_super_secreto_seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true, // para que JS en frontend no acceda a la cookie
  }
};

// Solo usar MongoDB store en producción
if (process.env.NODE_ENV === 'production') {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600 // lazy session update
  });
  console.log('✅ Usando MongoDB store para sesiones en producción');
} else {
  console.log('⚠️ Usando MemoryStore para sesiones en desarrollo');
}

app.use(session(sessionConfig));

//Method Override
app.use(methodOverride('_method'));

// Servir archivos estáticos del frontend (imágenes, js, css) si se necesita
app.use('/images', express.static(path.join(__dirname, '../../frontend/src/public/img')));
// También exponemos el resto de assets públicos si se usa directamente
app.use('/public', express.static(path.join(__dirname, '../../frontend/src/public')));
// Servir archivos de módulos específicos
app.use('/modules', express.static(path.join(__dirname, '../../frontend/src/modules')));

//Manejo de errores 
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Error interno',
    error: err.message || 'Ocurrió un error inesperado'
  });
});


/*MONTAJE DE RUTAS*/

// RUTA DE SALUD (health check)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 'unknown'
  });
});

// RUTA RAÍZ
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Akalia Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

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
app.use('/api/usuarios', usuariosRoutes); // Para validaciones JavaScript (sin API key requerida)

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

// MUNICIPIOS
app.get('/api/municipios', (req, res) => {
  res.json(require('./config/municipios_por_departamento.json'));
});
module.exports = app;