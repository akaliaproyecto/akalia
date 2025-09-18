const axios = require('axios');
require('dotenv').config();
const formData = require('form-data');
const headers = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY };

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Cargar categorías y productos en landing */
exports.categoriasProductosLanding = async (req, res) => {
  try {
    // Obtener categorías
    const responseCategorias = await axios.get(`${API_BASE_URL}/categorias`, { headers });
    const categorias = responseCategorias.data;

    // Intentar obtener productos, pero continuar si no existen
    let productos = [];
    try {
      const responseProductos = await axios.get(`${API_BASE_URL}/productos`, { headers });
      productos = responseProductos.data;
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
};