// IMPORTAR MÓDULOS 
const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer();

const { categoriasProductosLanding } = require('./landing.services');

/*Cargar categorias y productos en landing*/
router.get('/', categoriasProductosLanding);

module.exports = router;
