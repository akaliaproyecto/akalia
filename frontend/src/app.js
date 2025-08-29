const express = require('express');
const cookieParser = require('cookie-parser'); // Middleware para manejar cookies
const app = express();
const router = require('./routes/indexRoutes.js');
require('dotenv').config();
const path = require('path');


const PORT = 3000;

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true })); // Para procesar datos de formularios
app.use(express.json());
app.use(cookieParser()); // Middleware para manejar cookies

// Middleware para pasar la API Key a todas las vistas
app.use((req, res, next) => {
  res.locals.apiKey = process.env.API_KEY;
  next();
});

// Middleware para obtener datos del usuario logueado desde cookies
app.use((req, res, next) => {
  // Verificar si existe cookie con datos del usuario autenticado
  // IMPORTANTE: Cambiar nombre de cookie de 'datosUsuarioLogueado' a 'usuario'
  if (req.cookies && req.cookies.usuario) {
    try {
      // Decodificar y parsear los datos del usuario desde la cookie
      const datosUsuarioDecodificados = JSON.parse(req.cookies.usuario);
      req.usuarioAutenticado = datosUsuarioDecodificados;
      res.locals.usuarioActual = datosUsuarioDecodificados;
      console.log('Usuario autenticado encontrado:', datosUsuarioDecodificados.nombreUsuario);
    } catch (errorParseoCookie) {
      console.error('Error al decodificar datos de usuario:', errorParseoCookie);
      req.usuarioAutenticado = null;
      res.locals.usuarioActual = null;
    }
  } else {
    // No hay usuario logueado
    req.usuarioAutenticado = null;
    res.locals.usuarioActual = null;
  }
  next();
});

app.use('/', router);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  // Corregir ruta de vista de error 404
  res.status(404).render('pages/error', {
    error: 'Página no encontrada',
    message: `La página ${req.originalUrl} no existe.`
  });
});

// Middleware para manejar otros errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/error', { error: err });
});


app.listen(3000, () => {
  console.log(`Servidor frontend en línea en el puerto 3000`)
});