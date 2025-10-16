/**
 * @file Rutas frontend - Landing
 * @description Rutas que renderizan la página principal y vistas de productos (SSR).
 */
// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();

// DEFINIR URL BASE DE LA API 
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';
// Importamos los controladores que preparan los datos para la landing y productos (SSR)
const {
  categoriasProductosLanding,
  mostrarProductos,
  mostrarProductoPorId,
} = require('./landing.services');

/**
 * GET /
 * Renderiza la landing con categorías, productos e imágenes.
 */
router.get('/', categoriasProductosLanding);

/**
 * GET /productos
 * Renderiza la lista de productos.
 */
router.get('/productos', mostrarProductos);

/**
 * GET /producto/:id
 * Renderiza la página de detalle de un producto por su ID.
 */
router.get('/producto/:id', mostrarProductoPorId);

module.exports = router;
