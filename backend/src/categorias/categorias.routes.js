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
router.get('/categorias', obtenerCategorias);

// obtener un categoria por ID
router.get('/categorias/:id', obtenerCategoriaPorId);

// crear una nueva categoria
router.post('/categorias', subirImagen.single('imagen'), crearCategoria);

// editar un categoria existente
router.put('/categorias/:id', subirImagen.single('imagen'), actualizarCategoria);

// eliminar un categoria por ID
router.patch('/categorias/:id', eliminarCategoria);

module.exports = router;
