const axios = require('axios');
require('dotenv').config();

// Cabeceras y URL base para llamadas al backend
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

// Función auxiliar simple: obtiene categorías desde la API y devuelve un arreglo (o vacío)
async function obtenerCategorias() {
  try {
    const resp = await axios.get(`${API_BASE_URL}/categorias`, { headers: HEADERS });
    if (Array.isArray(resp.data)) return resp.data;
    return [];
  } catch (err) {
    // En caso de error devolvemos arreglo vacío para no romper la vista
    console.warn('No se pudieron obtener categorías para el navbar:', err && err.message ? err.message : err);
    return [];
  }
}

/* Cargar condiciones de uso (pasa categorias para el navbar) */
exports.condicionesUso = async (req, res) => {
  const categorias = await obtenerCategorias(); // obtener categorias para el dropdown
  // Render simple: pasar 'categorias' para que el partial navbar los use
  res.render('pages/footer-condiciones-uso', { categorias });
};

/* Cargar política de privacidad (pasa categorias) */
exports.politicasPrivacidad = async (req, res) => {
  const categorias = await obtenerCategorias();
  res.render('pages/footer-politicas-privacidad', { categorias });
};

/* Cargar política de cookies (pasa categorias) */
exports.politicasCookies = async (req, res) => {
  const categorias = await obtenerCategorias();
  res.render('pages/footer-politicas-cookies', { categorias });
};

/* Cargar preguntas frecuentes (pasa categorias) */
exports.preguntasFrecuentes = async (req, res) => {
  const categorias = await obtenerCategorias();
  res.render('pages/footer-preguntas-frecuentes', { categorias });
};

/* Cargar contacto (pasa categorias) */
exports.contacto = async (req, res) => {
  const categorias = await obtenerCategorias();
  res.render('pages/footer-contactanos', { categorias });
};