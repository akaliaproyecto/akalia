/* En este archivo se centraliza la lógica del módulo. Los servicios contienen las funciones que procesan los datos, manejan validaciones simples y se comunican con el backend  a través de peticiones HTTP (fetch, axios, etc.). */

const axios = require('axios');
axios.defaults.withCredentials = true;
require('dotenv').config();
const { setCookie, getUpdatedHeaders } = require('../helpers');

// Importar helpers
const {
  construirPayloadRegistro,
  extraerUsuario,
  construirDatosUsuarioCookie,
  cookieOpts
} = require('./autenticacion.utils');

const API_BASE_URL = process.env.API_BASE_URL || process.env.URL_BASE || 'http://localhost:4006';

/**
 * Registra un nuevo usuario llamando al backend.
 * @param {Object} req - Request del servidor frontend con los datos en req.body.
 * @param {Object} res - Response del servidor frontend para setear cookies y redirigir.
 * @returns {Promise<void>}
 */
exports.registrarUsuario = async (req, res) => {
  const { email, nombreUsuario, apellidoUsuario, telefono, contrasena } = req.body;

  try {
    // Construir payload con helper
    const payload = construirPayloadRegistro({ email, nombreUsuario, apellidoUsuario, telefono, contrasena });

    // Llamada HTTP al backend para crear el usuario
    const response = await axios.post(`${API_BASE_URL}/usuarios`, payload, { headers: getUpdatedHeaders(req) });
    setCookie(response, res);
    // Extraer usuario de la respuesta
    const usuario = extraerUsuario(response);

    // Construir datos de la cookie
    const datosUsuarioParaCookie = construirDatosUsuarioCookie(usuario);
    console.log(usuario)
    // Guardar cookie
    res.cookie('usuario', JSON.stringify(datosUsuarioParaCookie), cookieOpts);

    // Agregar cookie temporal para mostrar toast de éxito
    res.cookie('registro-exitoso', 'true', {
      maxAge: 5000, // Expira en 5 segundos
      httpOnly: false, // Permitir acceso desde JavaScript
      path: '/'
    });

    // Redirigir al home
    return res.redirect('/');

  } catch (error) {
    console.error('Error al registrar usuario:', error.response?.data || error.message || error);

    const errorMessage = error.response?.data?.error || 'Error al crear la cuenta';

    return res.status(500).render('pages/index', { error: errorMessage, titulo: 'Inicio' });
  }
};

/**
 * Inicia sesión enviando las credenciales al endpoint del backend.
 * @param {Object} req - Request que contiene email y contrasena en req.body.
 * @param {Object} res - Response para devolver JSON o renderizar vistas.
 * @returns {Promise<Object>} Respuesta JSON con mensaje y datos de usuario.
 */
exports.iniciarSesion = async (req, res) => {
  const { email, contrasena, captcha } = req.body;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { correo: email, contrasena, captcha }, { headers: getUpdatedHeaders(req) });
    setCookie(response, res);

    // Extraer usuario de la respuesta
    const usuario = extraerUsuario(response);

    // Construir datos de la cookie
    const datosUsuarioParaCookie = construirDatosUsuarioCookie(usuario);

    // Responder con JSON (AJAX)
    return res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario: datosUsuarioParaCookie });

  } catch (error) {
    console.error('Error al iniciar sesión:', error.response?.data || error.message || error);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    return res.status(500).render('pages/index', { error: errorMessage, titulo: 'Error al iniciar sesión. Inténtalo de nuevo más tarde.' });
  }
};

/**
 * Solicita la recuperación de contraseña al backend (forgot password).
 * @param {Object} req - Request con { email } en body.
 * @param {Object} res - Response para renderizar la página con mensaje.
 * @returns {Promise<void>}
 */
exports.recuperarContrasena = async (req, res) => {
  try {
    const { email } = req.body;
    await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    // Mostrar mensaje simple y redirigir
    return res.render('pages/index', { titulo: 'Inicio', mensaje: 'Si el correo existe, se ha enviado el enlace de recuperación.' });
  } catch (error) {
    console.error('Error frontend forgot:', error?.response?.data || error.message || error);
    return res.status(500).render('pages/index', { error: 'Error enviando email de recuperación' });
  }
};


/**
 * Envía token y nueva contraseña al backend para restablecer la contraseña.
 * Valida en frontend que los campos estén completos y coincidan.
 * @param {Object} req - Request con { token, id, password, passwordConfirm } en body.
 * @param {Object} res - Response para renderizar resultados.
 * @returns {Promise<void>}
 */
exports.resetearContrasena = async (req, res) => {
  try {
    const { token, id, password, passwordConfirm } = req.body;
    if (!token || !id || !password || !passwordConfirm) return res.status(400).render('pages/error', { error: 'Datos incompletos' });
    if (password !== passwordConfirm) return res.status(400).render('pages/error', { error: 'Las contraseñas no coinciden' });
    await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, id, password });
    return res.render('pages/index', { titulo: 'Inicio', mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error frontend reset:', error?.response?.data || error.message || error);
    return res.status(500).render('pages/error', { error: 'Error actualizando contraseña' });
  }
}

/**
 * Cierra la sesión del usuario en el backend y limpia cookies en el frontend.
 * @param {Object} req - Request del servidor frontend.
 * @param {Object} res - Response para redirigir al usuario.
 * @returns {Promise<void>}
 */
exports.logout = async (req, res) => {

  try {
    const respuesta = await axios.post(`${API_BASE_URL}/auth/logout`, {}, { headers: getUpdatedHeaders(req) });
    setCookie(respuesta, res);
    res.clearCookie('usuario');
    console.log(res.cookie)
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error al cerrar sesión', err);
  }
};
