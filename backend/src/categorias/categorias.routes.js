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


// obtener todos los categorias
router.get('/', obtenerCategorias);

// obtener un categoria por ID
router.get('/:id', obtenerCategoriaPorId);

// crear una nueva categoria
router.post('/', subirImagen.single('imagen'), crearCategoria);

// editar un categoria existente
router.put('/:id', subirImagen.single('imagen'), actualizarCategoria);

// eliminar un categoria por ID
router.patch('/:id', eliminarCategoria);

module.exports = router;
