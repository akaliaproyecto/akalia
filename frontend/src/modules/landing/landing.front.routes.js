// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();

// Importamos el controlador que prepara los datos para la landing (SSR)
const { categoriasProductosLanding } = require('./landing.services');

/*
  Ruta GET /
  - Renderiza la landing con categorías, productos e imágenes.
  - Usamos SSR en el controlador `categoriasProductosLanding`.
*/
router.get('/', categoriasProductosLanding);

module.exports = router;
