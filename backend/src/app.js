const express = require('express');
const cors = require('cors');
const session = require('express-session');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const app = express();

dotenv.config();


/*CONFIGURACIÓN DE MIDDLEWARES*/
// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//CORS (Frontend y backend en orígenes distintos)
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//Sesiones
app.set('trust proxy', 1); // Para habilitar el uso de cookies en HTTPS 
app.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET || 'mi_super_secreto_seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true // para que JS en frontend no acceda a la cookie
  }
}));

//Method Override
app.use(methodOverride('_method'));

// Rutas
/* const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); */

//Manejo de errores simple

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Error interno',
    error: err.message || 'Ocurrió un error inesperado'
  });
});



//MONTAJE DE RUTAS SEPARADAS
const productosRouter = require("./products/product-routes.js");
app.use("/", productosRouter);


const PORT = process.env.PORT || 3000;

/*app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});*/

module.exports = app;