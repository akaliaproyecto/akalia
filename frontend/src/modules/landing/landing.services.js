const axios = require('axios');
require('dotenv').config();

// Cabeceras y URL base para llamadas al backend
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

console.log('🔍 Landing service - API_BASE_URL:', API_BASE_URL);
console.log('🔍 Landing service - API_KEY:', process.env.API_KEY ? '✅ Set' : '❌ Missing');

/* Cargar categorías y productos para la página landing */
exports.categoriasProductosLanding = async (req, res) => {
  try {
    // Obtener categorías desde el API
    const respCategorias = await axios.get(`${API_BASE_URL}/categorias`, { headers: HEADERS });
    let categorias = [];
    if (Array.isArray(respCategorias.data)) {
      categorias = respCategorias.data;
    } else {
      // Si falla la llamada, deja el arreglo vacío
      categorias = [];
    }

    // Obtener productos desde el API 
    let productos = [];
    try {
      const respProductos = await axios.get(`${API_BASE_URL}/productos`, { headers: HEADERS });
        if (Array.isArray(respProductos.data)) {
        productos = respProductos.data;
      } else {
        productos = [];
      }
    } catch (errProd) {
      // Si falla la llamada, deja el arreglo vacío
      productos = [];
    }

    // Construir arreglo de imágenes para la vista
    // Normalizamos el id del producto usando _id, idProducto o id según exista
    const imagenes = productos.map(prod => {
      if (!prod) return null;
      const idProducto = prod._id;
      if (idProducto && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
        return { idProducto, urlImagen: prod.imagenes[0] };
      }
      return null;
    }).filter(Boolean); // quitar entradas nulas

    // Render de la vista landing con datos preparados
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
      message: 'No se pudieron cargar los datos para el landing.'
    });
  }
};

/* listar productos en la ruta /productos */
exports.mostrarProductos = async (req, res) => {
  try {
    // Leer valores de filtros desde querystring para mantener selección tras recarga
    const { ordenar = '', min = '', max = '' } = req.query || {};
    // Obtener productos desde el API
    const respProductos = await axios.get(`${API_BASE_URL}/productos`, { headers: HEADERS });
    let productos = [];
    if (Array.isArray(respProductos.data)) {
      productos = respProductos.data;
    } else {
      productos = [];
    }

    // Construir arreglo de imágenes para la vista de productos
    // Usar fallback de id para garantizar que la relación funcione
    const imagenes = productos.map(prod => {
      if (!prod) return null;
      const idProducto = prod._id;
      if (idProducto && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
        return { idProducto, urlImagen: prod.imagenes[0] };
      }
      return null;
    }).filter(Boolean);

    // Preparar objeto con valores actuales de filtros (se usa en el partial)
    const filtrosValores = { ordenar, min, max };

    // Renderizar la vista de productos y pasar filtrosValores para mantener inputs
    return res.render('pages/productos.ejs', { productos, imagenes, filtrosValores, titulo: 'Productos' });
  } catch (error) {
    return res.status(500).render('pages/error', { error: 'Error del servidor', message: 'No se pudieron cargar los productos.' });
  }
};

/* mostrar un producto específico producto/:id */
exports.mostrarProductoPorId = async (req, res) => {
  try {
    // Obtener el ID del producto desde los parámetros de la URL
    const idProducto = req.params.id;

    // Obtener el producto específico desde el API
    const respProducto = await axios.get(`${API_BASE_URL}/productos/${idProducto}`, { headers: HEADERS });
    const producto = respProducto.data;

    // Preparar el arreglo de imágenes para la vista del producto
    const imagenes = [];
    if (producto && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
      // Si el producto tiene imágenes, las convertimos al formato esperado
      producto.imagenes.forEach(url => {
        imagenes.push({ idProducto: producto._id, urlImagen: url });
      });
    }

    // Obtener datos del emprendimiento usando el ID del emprendimiento del producto
    let emprendimiento = {};
    try {
      if (producto.idEmprendimiento) {
        const respEmprendimiento = await axios.get(`${API_BASE_URL}/emprendimientos/${producto.idEmprendimiento}`, { headers: HEADERS });
        emprendimiento = respEmprendimiento.data || {};
      }
    } catch (errEmprendimiento) {
      emprendimiento = { nombreEmprendimiento: 'Emprendimiento no disponible' };
    }

    // Obtener categorías del producto
    let categoriaP = [];
    try {
      // Valor posible de la categoría: puede venir en producto.idCategoria, producto.categoria
      const valorId = producto.idCategoria;
      const valorCategoria = producto.categoria;

      // Detectar si 'categoria' ya es un objeto con nombreCategoria
      if (valorCategoria && typeof valorCategoria === 'object' && valorCategoria.nombreCategoria) {
        producto.categoriaNombre = valorCategoria.nombreCategoria;
      } else {
        // Función simple para detectar ObjectId (24 hex characters)
        const esObjectId = (val) => typeof val === 'string' && /^[a-fA-F0-9]{24}$/.test(val);

        // Si existe id en idCategoria usamos ese id, si no y categoria es id usamos ese.
        const posibleId = valorId || (typeof valorCategoria === 'string' && esObjectId(valorCategoria) ? valorCategoria : null);

        if (posibleId) {
          // obtener la categoría por id
          const respCategoria = await axios.get(`${API_BASE_URL}/categorias/${posibleId}`, { headers: HEADERS });
          categoriaP = [respCategoria.data] || [];
          producto.categoriaNombre = respCategoria.data && respCategoria.data.nombreCategoria ? respCategoria.data.nombreCategoria : '';
        } else if (typeof valorCategoria === 'string') {
          // si categoria es string y no es id, asumimos que ya es el nombre
          producto.categoriaNombre = valorCategoria;
        } else {
          producto.categoriaNombre = producto.categoriaNombre || 'Sin categoría';
        }
      }
    } catch (errCategoria) {
      console.log('No se pudo obtener categoría:', errCategoria.message);
      categoriaP = [{ nombreCategoria: 'Sin categoría' }];
      producto.categoriaNombre = producto.categoriaNombre || 'Sin categoría';
    }

    // Renderizar la vista del producto con todos los datos
    return res.render('pages/producto.ejs', {
      producto,
      imagenes,
      emprendimiento,
      categoriaP,
      titulo: producto.tituloProducto || 'Producto'
    });

  } catch (error) {
     if (error && error.message) {
      console.error('Error al obtener producto:', error.message);
    } else {
      console.error('Error al obtener producto:', error);
    }
  }
};

