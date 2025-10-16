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
/**
 * GET /etiquetas -> Obtener todas las etiquetas
 */
// obtener todas las etiquetas -> GET /etiquetas
router.get('/', obtenerEtiquetas);

/**
 * GET /etiquetas/:id -> Obtener una etiqueta por su ID
 */
// obtener una etiqueta por ID -> GET /etiquetas/:id
router.get('/:id', obtenerEtiquetaPorId);

/**
 * POST /etiquetas -> Crear una nueva etiqueta
 */
// crear una nueva etiqueta -> POST /etiquetas
router.post('/', crearEtiqueta);

/**
 * PUT /etiquetas/:id -> Actualizar una etiqueta
 */
// editar una etiqueta existente -> PUT /etiquetas/:id
router.put('/:id', actualizarEtiqueta);

/**
 * PATCH /etiquetas/:id -> Deshabilitar una etiqueta
 */
// eliminar una etiqueta por ID (patch) -> PATCH /etiquetas/:id
router.patch('/:id', eliminarEtiqueta);

module.exports = router;
