// IMPORTAR MÓDULOS 
/**
 * @file Rutas frontend del módulo Footer
 * @description Define las rutas que renderizan páginas informativas del footer
 * (condiciones de uso, políticas, preguntas frecuentes y contacto).
 */
// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();

// DEFINIR URL BASE DE LA API 
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';
// Importamos los controladores que preparan los datos para las vistas del footer
const {
  condicionesUso,
  politicasPrivacidad, 
  politicasCookies,
  preguntasFrecuentes,
  contacto
} = require('./footer.services');

/* Ruta que renderiza la vista de condiciones de uso */
/**
 * GET /condiciones-uso
 * - Renderiza la página de Condiciones de Uso.
 */
router.get('/condiciones-uso', condicionesUso);

/* Ruta que renderiza la vista de política de privacidad */
/**
 * GET /politicas-privacidad
 * - Renderiza la página de Política de Privacidad.
 */
router.get('/politicas-privacidad', politicasPrivacidad);

/* Ruta que renderiza la política de cookies */
/**
 * GET /politicas-cookies
 * - Renderiza la página de Política de Cookies.
 */
router.get('/politicas-cookies', politicasCookies);

/* Ruta que renderiza la vista de preguntas frecuentes */
/**
 * GET /preguntas-frecuentes
 * - Renderiza la página de Preguntas Frecuentes (FAQ).
 */
router.get('/preguntas-frecuentes', preguntasFrecuentes);

/* Ruta que renderiza la vista de contacto */
/**
 * GET /contactanos
 * - Renderiza la página de Contacto.
 */
router.get('/contactanos', contacto);

module.exports = router;