const axios = require('axios');
require('dotenv').config();

// Cabeceras y URL base para llamadas al backend
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/*
  Cargar categorías y productos para la página landing (SSR).
  - Construimos un arreglo `imagenes` con objetos { idProducto, urlImagen }
    donde `urlImagen` es la primera imagen disponible en `producto.imagenes`
    o un placeholder si no existe.
  - Esto hace la vista `index.ejs` consistente con otras vistas del proyecto
    que esperan `imagenes` como una lista de objetos con `idProducto` y `urlImagen`.
*/
exports.categoriasProductosLanding = async (req, res) => {
  try {
    // Obtener categorías desde el API
    const respCategorias = await axios.get(`${API_BASE_URL}/categorias`, { headers: HEADERS });
    const categorias = Array.isArray(respCategorias.data) ? respCategorias.data : [];

    // Obtener productos desde el API (si falla, dejamos arreglo vacío)
    let productos = [];
    try {
      const respProductos = await axios.get(`${API_BASE_URL}/productos`, { headers: HEADERS });
      productos = Array.isArray(respProductos.data) ? respProductos.data : [];
    } catch (errProd) {
      console.log('No se pudieron obtener productos para el landing:', errProd.message || errProd);
      productos = [];
    }

    // Construir arreglo de imágenes para la vista. Cada elemento tiene:
    // { idProducto: <id>, urlImagen: <url de la primera imagen o placeholder> }
    const imagenes = productos.map(prod => {
      // Si el backend guarda `imagenes` como arreglo de URLs (ej: producto.imagenes = ['url1','url2'])
      if (prod && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
        return { idProducto: prod._id || prod.idProducto || prod.id || null, urlImagen: prod.imagenes[0] };
      }
      // Si el backend devuelve objetos con { idProducto, urlImagen } ya formateados
      if (prod && prod.urlImagen && (prod.idProducto || prod._id || prod.id)) {
        return { idProducto: prod.idProducto || prod._id || prod.id, urlImagen: prod.urlImagen };
      }
      // Fallback: placeholder
      return { idProducto: prod._id || prod.idProducto || prod.id || null, urlImagen: '/img/placeholder-producto.png' };
    });

    // Render SSR de la vista landing con datos preparados
    return res.render('pages/index.ejs', {
      categorias,
      productos,
      imagenes,
      titulo: 'Publicaciones'
    });
  } catch (error) {
    console.error('Error al obtener datos para landing:', error && error.message ? error.message : error);
    return res.status(500).render('pages/error', {
      error: 'Error del servidor',
      message: 'No se pudieron cargar los datos para el landing. Verifica que el backend esté funcionando.'
    });
  }
};