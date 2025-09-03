const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Listar emprendimientos de un usuario y renderizar la vista */
exports.listarEmprendimientosUsuario = async (req, res) => {
  const id = req.params?.id || req.usuarioAutenticado?.idPersona;
  if (!id) {
    // Si no hay id conocido, redirigir al login o a una página segura
    return res.redirect('/?error=Debes+iniciar+sesion');
  }

  const usuario = req.usuarioAutenticado || { idPersona: id };
  let emprendimientos = [];

  // Intenta rutas comunes
  const posiblesRutas = [
    `/emprendimientos/usuario/${id}`,
    `/usuarios/${id}/emprendimientos`,
    `/emprendimientos?usuario=${id}`
  ];

  for (const ruta of posiblesRutas) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}${ruta}`, { headers: HEADERS });
      if (Array.isArray(data)) emprendimientos = data;
      else if (Array.isArray(data.data)) emprendimientos = data.data;
      else if (Array.isArray(data.emprendimientos)) emprendimientos = data.emprendimientos;
      if (emprendimientos.length) break;
    } catch (err) {
      // seguir probando siguiente ruta
    }
  }

  // Renderiza la vista con las variables que ya espera el template
  return res.render('pages/usuario-emprendimientos-listar', {
    usuario,
    emprendimientos,
    // Pasamos la URL base de la API a la plantilla para que el frontend pueda llamar al backend correcto
    apiBaseUrl: API_BASE_URL,
    // Pasamos la API key para que el cliente la use al hacer POST con fetch (solución simple)
    apiKey: HEADERS['akalia-api-key'] || ''
  });
};

/* Agregar un nuevo emprendimiento */
exports.agregarEmprendimiento = async (req, res) => {
  try {
    const { idPersona, nombreEmprendimiento, imagenLogo, descripcionNegocio } = req.body;

    const payload = {
      idPersona,
      nombreEmprendimiento,
      imagenLogo,
      descripcionNegocio,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    // Enviar al backend real (puerto 3000)
    await axios.post(`${API_BASE_URL}/api/emprendimientos`, payload);

    // Redirigir al listado de emprendimientos del usuario
    res.redirect(`/usuario-emprendimientos/${idPersona}`);
  } catch (error) {
    console.error('Error al crear emprendimiento:', error.message);
    res.status(500).render('error', {
      error: 'Error al crear emprendimiento',
      message: 'No se pudo guardar el emprendimiento. Verifica los datos o intenta más tarde.'
    });
  }
};

/* Obtener detalle de un emprendimiento + productos (proxy) */
exports.obtenerDetalleEmprendimiento = async (req, res) => {
  const id = req.params?.id;
  if (!id) return res.status(400).json({ error: 'Id requerido' });

  // posibles rutas para detalle (intenta en orden)
  const detalleCandidates = [
    `${API_BASE_URL}/emprendimientos/${id}`,
    `${API_BASE_URL}/api/emprendimientos/${id}`,
    `${API_BASE_URL}/emprendimientos/detalle/${id}`
  ];

  let emprendimiento = null;
  for (const url of detalleCandidates) {
    try {
      const resp = await axios.get(url, { headers: HEADERS, timeout: 5000 });
      if (resp && resp.data) {
        // adaptar formas de respuesta comunes
        emprendimiento = Array.isArray(resp.data) ? resp.data[0] : (resp.data.emprendimiento || resp.data.data || resp.data);
        if (emprendimiento) break;
      }
    } catch (err) {
      // seguir probando siguiente ruta
    }
  }

  // --- PETICIÓN DIRECTA al endpoint específico de productos por emprendimiento ---
  let productos = [];
  try {
    // Llamar únicamente al endpoint que devuelve productos filtrados por emprendimiento.
    // Esto evita usar endpoints genéricos que puedan devolver todos los productos.
    const urlProductos = `${API_BASE_URL.replace(/\/$/, '')}/productos/emprendimiento/${id}`;
    const respProd = await axios.get(urlProductos, { headers: HEADERS, timeout: 5000 });
    if (respProd && respProd.data) {
      // Esperamos que el backend devuelva un array de productos
      if (Array.isArray(respProd.data)) productos = respProd.data;
      else if (Array.isArray(respProd.data.productos)) productos = respProd.data.productos;
      else if (Array.isArray(respProd.data.data)) productos = respProd.data.data;
    }
  } catch (err) {
    // Si falla esta ruta específica, dejamos productos = [] (no mostramos productos de otros emprendimientos)
    // y continuamos devolviendo el emprendimiento (si se obtuvo).
  }

  // Responder con lo que tengamos (aunque vacío)
  return res.json({ emprendimiento: emprendimiento || {}, productos: productos || [] });
};