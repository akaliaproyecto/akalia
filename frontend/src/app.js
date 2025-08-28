const express = require('express');
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

// Middleware para pasar la API Key a todas las vistas
app.use((req, res, next) => {
  res.locals.apiKey = process.env.API_KEY;
  next();
});
app.use('/', router);


// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).render('error404', { url: req.originalUrl });
});

// Middleware para manejar otros errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/error', { error: err });
});


app.listen(3000, () => {
  console.log(`Servidor frontend en línea en el puerto 3000`)
});