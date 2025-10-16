/**
 * @file Rutas de categorías
 * @description Endpoints para listar, obtener, crear, actualizar y deshabilitar categorías.
 */
// Importa Express y crea un router para definir las rutas de productos
const express = require('express');
const router = express.Router();
const subirImagen = require('../middlewares/manejadorImg.js'); // Importa el middleware de subida de imágenes
// Importa las funciones del controlador que se van a ejecutar cuando se llame cada ruta
const {
  obtenerCategorias,
  obtenerCategoriaPorId,
  obtenerCategoriaPorNombre,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require('./categorias.controller');


/**
 * GET /
 * Devuelve todas las categorías.
 */
// obtener todos los categorias
router.get('/', obtenerCategorias);

/**
 * GET /:id
 * Devuelve una categoría por su ID.
 */
// obtener un categoria por ID
router.get('/:id', obtenerCategoriaPorId);

/**
 * POST /
 * Crea una nueva categoría. Se puede subir una imagen en 'imagen'.
 */
// crear una nueva categoria
router.post('/', subirImagen.single('imagen'), crearCategoria);

/**
 * PUT /:id
 * Actualiza una categoría por ID. Permite reemplazar la imagen.
 */
// editar un categoria existente
router.put('/:id', subirImagen.single('imagen'), actualizarCategoria);

/**
 * PATCH /:id
 * Marca la categoría como inactiva en lugar de eliminarla físicamente.
 */
// eliminar un categoria por ID
router.patch('/:id', eliminarCategoria);

module.exports = router;
