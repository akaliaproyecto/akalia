// IMPORTAR MÓDULOS 
const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();
const headers = { 'akalia-api-key': process.env.API_KEY };

// DEFINIR URL BASE DE LA API 
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4000';

//OBIENE CATEGORIAS Y PRODUCTOS PARA LA PAGINA DE INICIO
router.get('/', async (req, res) => {
  try {
    // Obtener categorías
    const responseCategorias = await axios.get(`${API_BASE_URL}/categorias`, { headers });
    const categorias = responseCategorias.data;

    console.log('Categorías obtenidas:', categorias); // Para debug

    // Intentar obtener productos, pero continuar si no existen
    let productos = [];
    try {
      const responseProductos = await axios.get(`${API_BASE_URL}/productos`, { headers });
      productos = responseProductos.data;
      console.log('Productos obtenidos:', productos); // Para debug
    } catch (productError) {
      console.log('No se pudieron obtener productos, continuando solo con categorías');
    }

    res.render('pages/index.ejs', {
      categorias: categorias,
      productos: productos,
      imagenes: productos, // Usar productos como imágenes
      titulo: 'Publicaciones',
    });
  } catch (error) {
    console.error('Error al obtener datos:', error.message);
    console.error('Error completo:', error);

    //Renderizar pagina de error
    res.status(500).render('pages/error', {
      error: 'Error del servidor',
      message: 'No se pudieron cargar los datos. Verifica que el backend esté funcionando.',
    });
  }
});

module.exports = router;
