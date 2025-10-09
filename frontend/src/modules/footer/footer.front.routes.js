// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();

// DEFINIR URL BASE DE LA API 
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';
// Importamos los controladores que preparan los datos para las vistas del footer
const {
  condicionesUso,
  politicasPrivacidad, 
  politicasCookies
} = require('./footer.services');


/* Ruta que renderiza la vista de condiciones de uso */
router.get('/condiciones-uso', condicionesUso);

/* Ruta que renderiza la vista de política de privacidad */
router.get('/politicas-privacidad', politicasPrivacidad);

/* Ruta que renderiza la política de cookies */
router.get('/politicas-cookies', politicasCookies);

module.exports = router;