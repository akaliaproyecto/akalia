// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer();

// DEFINIR URL BASE DE LA API 
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';
const { categoriasProductosLanding } = require('./landing.services');

/*Cargar categorias y productos en landing*/
router.get('/', categoriasProductosLanding);

module.exports = router;
