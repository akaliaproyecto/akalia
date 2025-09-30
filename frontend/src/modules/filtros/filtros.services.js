const axios = require('axios');
require('dotenv').config();

// Cabeceras y URL base para llamadas al backend
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };


/* Mostrar productos filtrados por categoría */
exports.mostrarProductosPorCategoria = async (req, res) => {
  try {
    const idCategoria = req.params.id;

    // Llamada al backend para obtener productos de la categoría
    const resp = await axios.get(`${API_BASE_URL}/productos/categoria/${idCategoria}`, { headers: HEADERS });
    let productos = Array.isArray(resp.data) ? resp.data : [];

    // Preparar arreglo de imágenes (si los productos traen campo imagenes)
    const imagenes = productos.map(prod => {
      if (!prod) return null;
      const idProducto = prod._id || prod.idProducto || prod.id;
      if (idProducto && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
        return { idProducto, urlImagen: prod.imagenes[0] };
      }
      return null;
    }).filter(Boolean);

    // Render simple: la vista `productos-filtros.ejs` mostrará solo los productos filtrados
    return res.render('pages/productos-filtros.ejs', { productos, imagenes, titulo: `Productos - Categoría` });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error && error.message ? error.message : error);
    return res.status(500).render('pages/error', { error: 'Error del servidor', message: 'No se pudieron cargar los productos por categoría.' });
  }
};

/* Mostrar productos por término de búsqueda
   - Llama al backend (ruta: /productos/nombre/:termino)
   - Prepara arreglo simple de imágenes y renderiza productos-filtros.ejs
   - Usa nombres de variables en español y lógica sencilla para principiantes */
exports.mostrarProductosPorBusqueda = async (req, res) => {
  try {
    const termino = req.params.termino;
    if (!termino || typeof termino !== 'string' || termino.trim() === '') {
      // Si no hay término, renderizar vista vacía (o redirigir)
      return res.render('pages/productos-filtros.ejs', { productos: [], imagenes: [], titulo: `Resultados de búsqueda` });
    }

    // Llamada al backend que ya existe y funciona (GET /productos/nombre/:nombre)
    const resp = await axios.get(`${API_BASE_URL}/productos/nombre/${encodeURIComponent(termino.trim())}`, { headers: HEADERS });
    const productos = Array.isArray(resp.data) ? resp.data : [];

    // Preparar arreglo de imágenes: una imagen principal por producto (si existe)
    const imagenes = productos.map(prod => {
      if (!prod) return null;
      const idProducto = prod._id || prod.id || prod.idProducto;
      if (Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
        return { idProducto, urlImagen: prod.imagenes[0] };
      }
      return null;
    }).filter(Boolean);

    // Renderizar la vista con los datos
    return res.render('pages/productos-filtros.ejs', { productos, imagenes, titulo: `Resultados para "${termino}"` });
  } catch (error) {
    console.error('Error al buscar productos por nombre:', error && error.message ? error.message : error);
    return res.status(500).render('pages/error', { error: 'Error del servidor', message: 'No se pudieron buscar los productos.' });
  }
};