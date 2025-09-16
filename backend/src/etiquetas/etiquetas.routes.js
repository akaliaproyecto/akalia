// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();

// Importa las funciones del controlador que se van a ejecutar cuando se llame cada ruta
const {
  obtenerEtiquetas,
  obtenerEtiquetaPorId,
  crearEtiqueta,
  actualizarEtiqueta,
  eliminarEtiqueta
} = require('./etiquetas.controller.js');


// Rutas relativas: el router se monta en '/etiquetas' desde app.js
// Por eso aquí usamos '/' y '/:id' para evitar duplicar el segmento
// obtener todas las etiquetas -> GET /etiquetas
router.get('/', obtenerEtiquetas);

// obtener una etiqueta por ID -> GET /etiquetas/:id
router.get('/:id', obtenerEtiquetaPorId);

// crear una nueva etiqueta -> POST /etiquetas
router.post('/', crearEtiqueta);

// editar una etiqueta existente -> PUT /etiquetas/:id
router.put('/:id', actualizarEtiqueta);

// eliminar una etiqueta por ID (patch) -> PATCH /etiquetas/:id
router.patch('/:id', eliminarEtiqueta);

module.exports = router;
