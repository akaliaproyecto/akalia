// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();

// Importamos los controladores que preparan los datos para la landing y productos (SSR)
const {
  categoriasProductosLanding,
  mostrarProductos } = require('./landing.services');

/* Ruta que renderiza la landing con categorías, productos e imágenes.*/
router.get('/', categoriasProductosLanding);

/* Ruta que renderiza la vista productos.ejs */
router.get('/productos', mostrarProductos);

module.exports = router;
