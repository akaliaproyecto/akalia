const express = require('express');
const cookieParser = require('cookie-parser'); // Middleware para manejar cookies
const app = express();
const router = require('./modules/indexRoutes.js');
require('dotenv').config();
const path = require('path');
const axios = require('axios'); // peticiones HTTP simples

const PORT_FRONTEND = process.env.PORT || process.env.PORT_FRONTEND || 4666;
console.log(`🚀 Frontend - Intentando iniciar servidor en puerto: ${PORT_FRONTEND}`);

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true })); // Para procesar datos de formularios
app.use(express.json());
app.use(cookieParser()); // Middleware para manejar cookies

// Middleware para pasar la API Key y URL base a todas las vistas
app.use((req, res, next) => {
  res.locals.apiKey = process.env.API_KEY;
  res.locals.apiBaseUrl = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
  next();
});

// Middleware para cargar categorías y exponerlas a todas las vistas (navbar)
app.use(async (req, res, next) => {

  // URL base de la API (igual que en otros módulos)
  const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
  const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

    // Petición simple a la API de categorías
    const resp = await axios.get(`${API_BASE_URL}/categorias`, { headers: HEADERS });
    res.locals.categorias = Array.isArray(resp.data) ? resp.data : [];

  next();
});

// Middleware para obtener datos del usuario logueado desde cookies
app.use((req, res, next) => {
  // Evitar logs para assets estáticos (css, js, imágenes, maps, etc.)
  const staticExtRegex = /\.(css|js|map|png|jpg|jpeg|gif|svg|ico)$/i;
  const wantsHtml = req.accepts && req.accepts('html');

  if (req.cookies && req.cookies.usuario) {
    try {
      // la cookie puede venir ya como objeto o como string JSON
      const datosUsuarioDecodificados = typeof req.cookies.usuario === 'string'
        ? JSON.parse(req.cookies.usuario)
        : req.cookies.usuario;

      req.usuarioAutenticado = datosUsuarioDecodificados;
      res.locals.usuarioActual = datosUsuarioDecodificados;

      // Log sólo para peticiones que esperan HTML y no son assets estáticos
      // if (wantsHtml && !staticExtRegex.test(req.path)) {
      //   console.log('Usuario autenticado encontrado:', datosUsuarioDecodificados.nombreUsuario || datosUsuarioDecodificados.idUsuario || '<sin nombre>');
      // }
    } catch (errorParseoCookie) {
      console.error('Error al decodificar datos de usuario:', errorParseoCookie);
      req.usuarioAutenticado = null;
      res.locals.usuarioActual = null;
    }
  } else {
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

app.listen(PORT_FRONTEND, '0.0.0.0', () => {
  console.log(`✅ Frontend iniciado exitosamente en puerto ${PORT_FRONTEND}`);
});