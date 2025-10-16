const axios = require('axios');
axios.defaults.withCredentials = true;

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL;

/**
 * Servicios SSR para el panel admin
 * - Estas funciones se ejecutan en el servidor frontend y llaman al backend
 *   para obtener datos y renderizar las vistas EJS del panel de administración.
 */
// ==================== DASHBOARD PRINCIPAL ====================
/**
 * Obtener datos para el dashboard admin y renderizar la vista.
 * Llama al backend /admin/estadisticas y pasa los resultados a la plantilla.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerDashboard = async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/estadisticas`, {
      headers: {
        'akalia-api-key': process.env.API_KEY,
        'Cookie': req.headers.cookie
      }
    });

    res.render('pages/admin-dashboard', {
      titulo: 'Panel de Administración',
      estadisticas: response.data.estadisticas,
      ultimosUsuarios: response.data.ultimosUsuarios,
      ultimosPedidos: response.data.ultimosPedidos,
      usuario: JSON.parse(decodeURIComponent(req.cookies.usuario)),
      apiBaseUrl: API_BASE_URL,
      apiKey: process.env.API_KEY
    });
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    res.status(500).render('pages/error', {
      titulo: 'Error',
      mensaje: 'Error al cargar el panel de administración'
    });
  }
};

// ==================== GESTIÓN DE USUARIOS ====================
/**
 * Listar usuarios para la vista de administración.
 * - Pasa los parámetros page, buscar y estado al backend.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.listarUsuarios = async (req, res) => {
  try {
    const { page = 1, buscar = '', estado = '' } = req.query;
    
    const response = await axios.get(`${API_BASE_URL}/admin/usuarios`, {
      params: { page, buscar, estado },
      headers: {
        'akalia-api-key': process.env.API_KEY,
        'Cookie': req.headers.cookie
      }
    });

    res.render('pages/admin-usuarios', {
      titulo: 'Gestión de Usuarios',
      usuarios: response.data.usuarios,
      totalPaginas: response.data.totalPaginas,
      paginaActual: parseInt(page),
      total: response.data.total,
      buscar,
      estado,
      usuario: JSON.parse(decodeURIComponent(req.cookies.usuario)),
      apiBaseUrl: API_BASE_URL,
      apiKey: process.env.API_KEY
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    res.status(500).render('pages/error', {
      titulo: 'Error',
      mensaje: 'Error al cargar usuarios'
    });
  }
};

// ==================== GESTIÓN DE PRODUCTOS ====================
/**
 * Listar productos para la vista admin.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.listarProductos = async (req, res) => {
  try {
    const { page = 1, buscar = '', categoria = '', estado = '' } = req.query;
    
    const response = await axios.get(`${API_BASE_URL}/admin/productos`, {
      params: { page, buscar, categoria, estado },
      headers: {
        'akalia-api-key': process.env.API_KEY,
        'Cookie': req.headers.cookie
      }
    });

    res.render('pages/admin-productos', {
      titulo: 'Gestión de Productos',
      productos: response.data.productos,
      totalPaginas: response.data.totalPaginas,
      paginaActual: parseInt(page),
      total: response.data.total,
      buscar,
      categoria,
      estado,
      usuario: JSON.parse(decodeURIComponent(req.cookies.usuario)),
      apiBaseUrl: API_BASE_URL,
      apiKey: process.env.API_KEY
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
    res.status(500).render('pages/error', {
      titulo: 'Error',
      mensaje: 'Error al cargar productos'
    });
  }
};

// ==================== GESTIÓN DE EMPRENDIMIENTOS ====================
/**
 * Listar emprendimientos para la vista admin.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.listarEmprendimientos = async (req, res) => {
  try {
    const { page = 1, buscar = '', estado = '' } = req.query;
    
    const response = await axios.get(`${API_BASE_URL}/admin/emprendimientos`, {
      params: { page, buscar, estado },
      headers: {
        'akalia-api-key': process.env.API_KEY,
        'Cookie': req.headers.cookie
      }
    });

    res.render('pages/admin-emprendimientos', {
      titulo: 'Gestión de Emprendimientos',
      emprendimientos: response.data.emprendimientos,
      totalPaginas: response.data.totalPaginas,
      paginaActual: parseInt(page),
      total: response.data.total,
      buscar,
      estado,
      usuario: JSON.parse(decodeURIComponent(req.cookies.usuario)),
      apiBaseUrl: API_BASE_URL,
      apiKey: process.env.API_KEY
    });
  } catch (error) {
    console.error('Error al cargar emprendimientos:', error);
    res.status(500).render('pages/error', {
      titulo: 'Error',
      mensaje: 'Error al cargar emprendimientos'
    });
  }
};

// ==================== GESTIÓN DE PEDIDOS ====================
/**
 * Listar pedidos para la vista admin.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.listarPedidos = async (req, res) => {
  try {
    const { page = 1, estado = '' } = req.query;
    
    const response = await axios.get(`${API_BASE_URL}/admin/pedidos`, {
      params: { page, estado },
      headers: {
        'akalia-api-key': process.env.API_KEY,
        'Cookie': req.headers.cookie
      }
    });

    res.render('pages/admin-pedidos', {
      titulo: 'Gestión de Pedidos',
      pedidos: response.data.pedidos,
      totalPaginas: response.data.totalPaginas,
      paginaActual: parseInt(page),
      total: response.data.total,
      estado,
      usuario: JSON.parse(decodeURIComponent(req.cookies.usuario)),
      apiBaseUrl: API_BASE_URL,
      apiKey: process.env.API_KEY
    });
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    res.status(500).render('pages/error', {
      titulo: 'Error',
      mensaje: 'Error al cargar pedidos'
    });
  }
};

// ==================== CONFIGURACIÓN (CATEGORÍAS Y ETIQUETAS) ====================
/**
 * Obtener datos de configuración (categorías y etiquetas) y renderizar la vista.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.mostrarConfiguracion = async (req, res) => {
  try {
    const [categoriasRes, etiquetasRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/admin/categorias`, {
        headers: {
          'akalia-api-key': process.env.API_KEY,
          'Cookie': req.headers.cookie
        }
      }),
      axios.get(`${API_BASE_URL}/admin/etiquetas`, {
        headers: {
          'akalia-api-key': process.env.API_KEY,
          'Cookie': req.headers.cookie
        }
      })
    ]);

    res.render('pages/admin-configuracion', {
      titulo: 'Configuración del Sistema',
      categorias: categoriasRes.data.categorias,
      etiquetas: etiquetasRes.data.etiquetas,
      usuario: JSON.parse(decodeURIComponent(req.cookies.usuario)),
      apiBaseUrl: API_BASE_URL,
      apiKey: process.env.API_KEY
    });
  } catch (error) {
    console.error('Error al cargar configuración:', error);
    res.status(500).render('pages/error', {
      titulo: 'Error',
      mensaje: 'Error al cargar configuración'
    });
  }
};
