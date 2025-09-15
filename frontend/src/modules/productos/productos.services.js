const axios = require('axios');
require('dotenv').config();

// Base URL de la API (intenta leer de variables de entorno, con fallback)
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
// Headers mínimos (no exponemos API KEY al cliente, solo la usamos para backend->backend)
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Listar productos de un usuario */
exports.listarProductosUsuario = async (req, res) => {
  // Obtener id del usuario 
  const id = req.usuarioAutenticado.idPersona;
  const usuario = req.usuarioAutenticado;

  // Valores por defecto para la vista (nombres locales explicitos)
  let listaProductos = [];
  let listaEmprendimientos = [];
  let listaCategorias = [];
  let listaEtiquetas = [];

  // Función para convertir respuestas de la API en arrays 
  const obtenerArray = async (ruta) => {
    try {
      const resp = await axios.get(ruta, { headers: HEADERS });
      const data = resp.data;
      return data;
    } catch (err) {
      console.error(`Fallo al obtener ${ruta}:`, err.message);
    }
  };

  /* buscar id en objeto */
  function obtenerIdNormalizado(obj, claves = []) {
    // Si no hay objeto válido, devolvemos null
    if (!obj || typeof obj !== 'object') return null;
    // Buscamos la primera clave que tenga un valor no nulo/undef
    const claveEncontrada = claves.find(c => obj[c] !== undefined && obj[c] !== null);
    // Si no encontramos ninguna, retornamos null
    if (!claveEncontrada) return null;
    // Normalizamos a string y retornamos
    return String(obj[claveEncontrada]);
  }

  try {
    // Obtener emprendimientos y productos del usuario
    listaEmprendimientos = await obtenerArray(`${API_BASE_URL}/emprendimientos/usuario/${id}`);
    listaProductos = await obtenerArray(`${API_BASE_URL}/productos/usuarios/${id}`);

    // Objeto donde key = idEmprendimiento, value = nombre
    const mapaNombres = {};
    for (const emp of listaEmprendimientos) {
      const idEmp = obtenerIdNormalizado(emp, ['_id']);
      mapaNombres[String(idEmp)] = emp.nombreEmprendimiento;
    }

    // Recorrer productos y completar nombreEmprendimiento desde el obeto
    for (const producto of listaProductos) {
      const idEmpr = obtenerIdNormalizado(producto, ['idEmprendimiento',]);
      if (idEmpr) {
        producto.nombreEmprendimiento = mapaNombres[String(idEmpr)];
      } else {
        producto.nombreEmprendimiento = '';
      };
    }

    // Render SSR de la vista con los nombres que la vista espera 
    return res.render('pages/usuario-productos-listar', {
      usuario,
      productos: listaProductos,
      emprendimientos: listaEmprendimientos,
      categorias: listaCategorias,
      etiquetas: listaEtiquetas,
      apiBaseUrl: API_BASE_URL
    });
  } catch (error) {
    console.error('Error al listar productos del usuario:', error.message);
  }
};
