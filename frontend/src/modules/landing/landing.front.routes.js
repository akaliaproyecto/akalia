// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();

// DEFINIR URL BASE DE LA API 
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';
// Importamos el controlador que prepara los datos para la landing (SSR)
const { categoriasProductosLanding } = require('./landing.services');

/*
  Ruta GET /
  - Renderiza la landing con categorías, productos e imágenes.
  - Usamos SSR en el controlador `categoriasProductosLanding`.
*/
router.get('/', categoriasProductosLanding);

module.exports = router;
