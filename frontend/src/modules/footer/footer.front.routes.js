// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();

// DEFINIR URL BASE DE LA API 
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';
// Importamos los controladores que preparan los datos para la landing y productos (SSR)
const {
  condicionesUso
} = require('./footer.services');


/* Ruta que renderiza la vista de condiciones de uso */
router.get('/condiciones-uso', condicionesUso);