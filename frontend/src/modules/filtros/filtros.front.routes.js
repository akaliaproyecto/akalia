// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();

// DEFINIR URL BASE DE LA API 
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';

const {
    mostrarProductosPorCategoria,
    mostrarProductosFiltrados
} = require('./filtros.services');

// Importar la nueva función de búsqueda por término
const { mostrarProductosPorBusqueda } = require('./filtros.services');

/* Ruta que renderiza la vista de productos filtrados por categoría */
router.get('/productos/categoria/:id', mostrarProductosPorCategoria) 

// Ruta para buscar productos por término (muestra productos-filtros.ejs)
router.get('/productos/buscar/:termino', mostrarProductosPorBusqueda);

// Ruta que acepta query params y renderiza productos filtrados (SSR)
router.get('/productos/filtrar', mostrarProductosFiltrados);


module.exports = router;
