// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();

// Importa las funciones del controlador que se van a ejecutar cuando se llame cada ruta
const {
  obtenerEtiquetas,
  obtenerEtiquetaPorId,
  obtenerEtiquetaPorNombre,
  crearEtiqueta,
  actualizarEtiqueta,
  eliminarEtiqueta
} = require('./etiquetas.controller.js');


// obtener todos los etiquetas
router.get('/etiquetas', obtenerEtiquetas);

// obtener un etiqueta por ID
router.get('/etiquetas/:id', obtenerEtiquetaPorId);

// crear una nueva etiqueta
router.post('/etiquetas', crearEtiqueta);

// editar un etiqueta existente
router.put('/etiquetas/:id', actualizarEtiqueta);

// eliminar un etiqueta por ID
router.patch('/etiquetas/:id', eliminarEtiqueta);

module.exports = router;
