/* En este archivo se centraliza la lógica del módulo. Los servicios contienen las funciones que procesan los datos, manejan validaciones simples y se comunican con el backend  a través de peticiones HTTP (fetch, axios, etc.). */

const axios = require('axios');
axios.defaults.withCredentials = true;
require('dotenv').config();

// Importar helpers
const {
  construirPayloadRegistro,
  extraerUsuario,
  construirDatosUsuarioCookie,
  cookieOpts
} = require('./autenticacion.utils');

const API_BASE_URL = process.env.API_BASE_URL || process.env.URL_BASE || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' }; // Configuración de headers para las peticiones HTTP

/*Registrar usuario*/
exports.registrarUsuario = async (req, res) => {
  const { email, nombreUsuario, apellidoUsuario, telefono, contrasena } = req.body;

  try {
    // Construir payload con helper
    const payload = construirPayloadRegistro({ email, nombreUsuario, apellidoUsuario, telefono, contrasena });

    // Llamada HTTP al backend para crear el usuario
    const response = await axios.post(`${API_BASE_URL}/usuarios`, payload, { headers: HEADERS });

    // Extraer usuario de la respuesta
    const usuario = extraerUsuario(response);

    // Construir datos de la cookie
    const datosUsuarioParaCookie = construirDatosUsuarioCookie(usuario);

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

/*Inicio de sesión*/
exports.iniciarSesion = async (req, res) => {
  const { email, contrasena, captcha } = req.body;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { correo: email, contrasena, captcha }, { headers: HEADERS });

    // Extraer usuario de la respuesta
    const usuario = extraerUsuario(response);

    // Construir datos de la cookie
    const datosUsuarioParaCookie = construirDatosUsuarioCookie(usuario);

    // Guardar cookie
    
    console.log('USUARIO: ', res.headers)
    console.log('USUARIO: ', req.headers)
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

exports.verificarAutenticacion = async (req, res, next) => {  
  try {
    console.log('🔍 Verificando autenticación para:', req.path);
    
    const response = await axios.get(`${API_BASE_URL}/api/auth/verificar-sesion`, {
      headers: HEADERS
    });

    if (response.ok) {
      const data = await response.json();
      req.usuarioAutenticado = data.usuario;
      res.locals.usuarioAutenticado = data.usuario;
      res.locals.usuarioActual = data.usuario;
      
      console.log('✅ Usuario autenticado:', data.usuario.nombreUsuario);
      return next();
    } else {
      console.log('❌ Usuario no autenticado, redirigiendo...');
      return res.redirect('/login');
    }
  } catch (error) {
    console.error('❌ Error verificando autenticación:', error.message);
    return res.redirect('/login');
  }
};