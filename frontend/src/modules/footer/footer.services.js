const axios = require('axios');
require('dotenv').config();

// Cabeceras y URL base para llamadas al backend
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/**
 * Obtiene las categorías desde la API del backend.
 * - Si ocurre un error devuelve un arreglo vacío para no romper las vistas.
 * @returns {Promise<Array>} Array de categorías o vacío en caso de error.
 */
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

/**
 * Renderiza la página de Condiciones de Uso.
 * - Obtiene categorías para rellenar el navbar.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
/* Cargar condiciones de uso (pasa categorias para el navbar) */
exports.condicionesUso = async (req, res) => {
  const categorias = await obtenerCategorias(); // obtener categorias para el dropdown
  // Render simple: pasar 'categorias' para que el partial navbar los use
  res.render('pages/footer-condiciones-uso', { categorias });
};

/**
 * Renderiza la página de Política de Privacidad.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
/* Cargar política de privacidad (pasa categorias) */
exports.politicasPrivacidad = async (req, res) => {
  const categorias = await obtenerCategorias();
  res.render('pages/footer-politicas-privacidad', { categorias });
};

/**
 * Renderiza la página de Política de Cookies.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
/* Cargar política de cookies (pasa categorias) */
exports.politicasCookies = async (req, res) => {
  const categorias = await obtenerCategorias();
  res.render('pages/footer-politicas-cookies', { categorias });
};

/**
 * Renderiza la página de Preguntas Frecuentes (FAQ).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
/* Cargar preguntas frecuentes (pasa categorias) */
exports.preguntasFrecuentes = async (req, res) => {
  const categorias = await obtenerCategorias();
  res.render('pages/footer-preguntas-frecuentes', { categorias });
};

/**
 * Renderiza la página de Contacto.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
/* Cargar contacto (pasa categorias) */
exports.contacto = async (req, res) => {
  const categorias = await obtenerCategorias();
  res.render('pages/footer-contactanos', { categorias });
};