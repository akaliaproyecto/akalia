const axios = require('axios');
require('dotenv').config();

// Cabeceras y URL base para llamadas al backend
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };


/* Mostrar productos filtrados por categoría */
exports.mostrarProductosPorCategoria = async (req, res) => {
  try {
    const idCategoria = req.params.id;
    const { ordenar = '', min = '', max = '' } = req.query || {};

    // Helper: si el id parece un ObjectId, intentar resolver el nombre de la categoría
    const resolveCategoryName = async (catId) => {
      if (!/^[a-fA-F0-9]{24}$/.test(catId)) return catId;
      try {
        const r = await axios.get(`${API_BASE_URL}/categorias/${catId}`, { headers: HEADERS });
        return r?.data?.nombreCategoria || catId;
      } catch (e) {
        console.warn('No se pudo resolver nombre de categoría:', e && e.message ? e.message : e);
        return catId;
      }
    };

    const hasFilters = Boolean(ordenar || min || max);
    let productos = [];

    if (hasFilters) {
      const nombreCategoria = await resolveCategoryName(idCategoria);
      const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const regexStr = '^' + escapeRegex(nombreCategoria) + '$';

      const query = { categoria: { $regex: regexStr, $options: 'i' } };
      if (min) query.precio = { ...(query.precio || {}), $gte: parseFloat(min) };
      if (max) query.precio = { ...(query.precio || {}), $lte: parseFloat(max) };

      const options = {};
      if (ordenar === 'precio_asc') options.sort = { precio: 1 };
      if (ordenar === 'precio_desc') options.sort = { precio: -1 };

      const resp = await axios.post(`${API_BASE_URL}/productos/filtrar`, { query, options }, { headers: HEADERS });
      productos = Array.isArray(resp.data) ? resp.data : (resp.data && Array.isArray(resp.data.productos) ? resp.data.productos : []);
    } else {
      const resp = await axios.get(`${API_BASE_URL}/productos/categoria/${idCategoria}`, { headers: HEADERS });
      productos = Array.isArray(resp.data) ? resp.data : [];
    }

    // Mapear imágenes principales (primera imagen disponible)
    const imagenes = productos.reduce((acc, prod) => {
      if (!prod) return acc;
      const idProducto = prod._id || prod.idProducto || prod.id;
      const urlImagen = Array.isArray(prod.imagenes) && prod.imagenes.length ? prod.imagenes[0] : null;
      if (idProducto && urlImagen) acc.push({ idProducto, urlImagen });
      return acc;
    }, []);

    const filtrosValores = { ordenar, min, max };
    return res.render('pages/productos-filtros.ejs', { productos, imagenes, filtrosValores, titulo: `Productos - Categoría` });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error && error.message ? error.message : error);
    return res.status(500).render('pages/error', { error: 'Error del servidor', message: 'No se pudieron cargar los productos por categoría.' });
  }
};

/* Mostrar productos por término de búsqueda */
exports.mostrarProductosPorBusqueda = async (req, res) => {
  try {
    const termino = req.params.termino;
    // leer filtros de querystring (ordenar, min, max)
    const { ordenar = '', min = '', max = '' } = req.query || {};
    if (!termino || typeof termino !== 'string' || termino.trim() === '') {
      // Si no hay término, renderizar vista vacía (o redirigir)
      return res.render('pages/productos-filtros.ejs', { productos: [], imagenes: [], filtrosValores: { ordenar: '', min: '', max: '' }, titulo: `Resultados de búsqueda` });
    }

    let productos = [];
    if (ordenar || min || max) {
      // Construir query para título usando $regex string y opciones (serializable)
      const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const regexStr = escapeRegex(termino.trim());
      const filtroQuery = { tituloProducto: { $regex: regexStr, $options: 'i' } };
      if (min) filtroQuery.precio = { ...(filtroQuery.precio || {}), $gte: parseFloat(min) };
      if (max) filtroQuery.precio = { ...(filtroQuery.precio || {}), $lte: parseFloat(max) };
      const opciones = {};
      if (ordenar === 'precio_asc') opciones.sort = { parecio: 1 };
      if (ordenar === 'precio_desc') opciones.sort = { precio: -1 };

      const payload = { query: filtroQuery, options: opciones };
      const resp = await axios.post(`${API_BASE_URL}/productos/filtrar`, payload, { headers: HEADERS });
      productos = Array.isArray(resp.data) ? resp.data : (resp.data && Array.isArray(resp.data.productos) ? resp.data.productos : []);
    } else {
      // Llamada al backend que ya existe y funciona (GET /productos/nombre/:nombre)
      const resp = await axios.get(`${API_BASE_URL}/productos/nombre/${encodeURIComponent(termino.trim())}`, { headers: HEADERS });
      productos = Array.isArray(resp.data) ? resp.data : [];
    }

    // Preparar arreglo de imágenes: una imagen principal por producto (si existe)
    const imagenes = productos.map(prod => {
      if (!prod) return null;
      const idProducto = prod._id || prod.id || prod.idProducto;
      if (Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
        return { idProducto, urlImagen: prod.imagenes[0] };
      }
      return null;
    }).filter(Boolean);

    const filtrosValores = { ordenar: req.query.ordenar || '', min: req.query.min || '', max: req.query.max || '' };
    // Renderizar la vista con los datos y valores de filtros para mantener inputs
    return res.render('pages/productos-filtros.ejs', { productos, imagenes, filtrosValores, titulo: `Resultados para "${termino}"` });
  } catch (error) {
    console.error('Error al buscar productos por nombre:', error && error.message ? error.message : error);
    return res.status(500).render('pages/error', { error: 'Error del servidor', message: 'No se pudieron buscar los productos.' });
  }
};

/* mostrar productos con múltiples filtros */
exports.mostrarProductosFiltrados = async (req, res) => {
  try {
    // Leer valores simples desde query string (si no vienen usamos cadena vacía)
    const { ordenar = '', min = '', max = '' } = req.query || {};

    // Construir el objeto `filtroQuery` que enviaremos al backend se añade condiciones de precio si el usuario las puso.
    const filtroQuery = {};
    if (min) filtroQuery.precio = { ...(filtroQuery.precio || {}), $gte: parseFloat(min) };
    if (max) filtroQuery.precio = { ...(filtroQuery.precio || {}), $lte: parseFloat(max) };

    // Construir opciones de consulta (ordenamiento)
    const opciones = {};
    if (ordenar === 'precio_asc') opciones.sort = { precio: 1 };    // menor a mayor
    if (ordenar === 'precio_desc') opciones.sort = { precio: -1 };  // mayor a menor

    // Crear el payload esperado por el endpoint educativo /productos/filtrar
    const payload = { query: filtroQuery, options: opciones };

    // Llamada al backend: enviamos el payload y esperamos la lista de productos
    const resp = await axios.post(`${API_BASE_URL}/productos/filtrar`, payload, { headers: HEADERS });
    // Resp puede devolver un array directo o un objeto con { productos: [...] }
    const productos = Array.isArray(resp.data) ? resp.data : (resp.data && Array.isArray(resp.data.productos) ? resp.data.productos : []);

    // Preparar un arreglo simple de imágenes para la vista
    //    Tomamos la primera imagen disponible de cada producto (si existe)
    const imagenes = productos.map(prod => {
      if (!prod) return null;
      const idProducto = prod._id;
      if (idProducto && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
        return { idProducto, urlImagen: prod.imagenes[0] };
      }
      return null;
    }).filter(Boolean);

    //Pasar los valores de filtros para que el partial los muestre al usuario
    const filtrosValores = { ordenar, min, max };

    // Renderizar la vista con los datos ya listos
    return res.render('pages/productos-filtros.ejs', { productos, imagenes, filtrosValores, titulo: 'Productos filtrados' });
  } catch (error) {
    // Error: log y página de error simple
    console.error('Error en mostrarProductosFiltrados:', error && error.message ? error.message : error);
    return res.status(500).render('pages/error', { error: 'Error del servidor', message: 'No se pudieron cargar los productos filtrados.' });
  }
};