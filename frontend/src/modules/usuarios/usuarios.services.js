/* Servicios de usuarios: obtención, actualización, validación y desactivación de cuentas
Módulo que centraliza la lógica del frontend para usuarios: consulta la API (axios) usando la URL y cabeceras desde env, normaliza y formatea los datos para la vista (mi perfil), maneja la actualización del perfil (y actualiza la cookie), valida la contraseña actual contra el endpoint de login y marca la cuenta como inactiva (desactivación). */

const axios = require('axios');
require('dotenv').config();

const {
  verificarUsuarioLogueado,
} = require('./usuarios.utils')

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Verificar usuario logueado */
exports.obtenerUsuario = async (req, res) => {
  const id = req.usuarioAutenticado?.idPersona;
  if (!id) return res.redirect('/?error=Debes+iniciar+sesion');

  try {
    // Llamamos a la ruta correcta del backend (/usuarios/:id).
    const respuesta = await require('axios').get(`${API_BASE_URL}/usuarios/${id}`, { headers: HEADERS });
    const usuarioPerfil = (respuesta.data && (respuesta.data.usuario || respuesta.data)) || req.usuarioAutenticado;

    return res.render('pages/usuario-perfil-ver', {
      usuario: usuarioPerfil,
      titulo: 'Mi Perfil - Akalia',
      mensajeExito: req.query.exito || null
    });
  } catch (err) {
    console.error('obtenerUsuario (frontend):', err.message || err);
    return res.render('pages/usuario-perfil-ver', {
      usuario: req.usuarioAutenticado,
      titulo: 'Mi Perfil - Akalia',
      mensajeExito: req.query.exito || null,
      // Enviamos errorCarga sólo cuando ocurrió un problema (para que la vista decida mostrar la advertencia)
      errorCarga: 'Datos básicos de sesión'
    });
  }
};

/* Actualizar perfil del usuario */
exports.actualizarPerfilUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombreUsuario, apellidoUsuario, email, contrasena, telefono } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Falta id de usuario' });
  }

  // Construir objeto que se enviará al backend 
  const datosParaApi = {
    nombreUsuario,
    apellidoUsuario,
    correo: email,
    telefono
  };

  // Si se envía nueva contraseña, la mandamos para que el backend la procese 
  if (contrasena) datosParaApi.contrasena = contrasena;

  try {
    const respuesta = await axios.put(`${API_BASE_URL}/usuarios/${id}`, datosParaApi, { headers: HEADERS });
    // Reenviamos al cliente SSR la respuesta tal cual viene del backend
    return res.status(respuesta.status).json(respuesta.data);
  } catch (err) {
    console.error('frontend actualizarPerfilUsuario:', err.message || err);
    const status = err.response?.status || 500;
    // Mensaje genérico para el frontend; detalles opcionales del backend en development
    const mensaje = err.response?.data?.error || 'No se pudo actualizar el perfil, inténtalo más tarde.';
    return res.status(status).json({ error: mensaje });
  }
};

/* Validar contraseña del usuario */
exports.validarContrasenaUsuario = async (req, res) => {
  // Se obtiene el id del usuario desde la URL y la contraseña enviada en el cuerpo de la petición
  const { id: idUsuario } = req.params;
  const { contrasenaIngresada } = req.body;

  // Verifica que se envíe la contraseña.
  if (!contrasenaIngresada) {
    return res.status(400).json({ error: 'Debes ingresar tu contraseña actual' });
  }

  // Verifica que la contraseña no esté vacía
  try {
    // Obtener datos del usuario
    const { data: datosUsuario } = await axios.get(`${API_BASE_URL}/usuarios/${idUsuario}`, { headers: HEADERS });

    // Intentar login con la contraseña ingresada
    await axios.post(`${API_BASE_URL}/usuarios/login`, {
      correo: datosUsuario.correo || datosUsuario.email,
      contrasena: contrasenaIngresada
    }, { headers: HEADERS });

    return res.status(200).json({ mensaje: 'Contraseña validada correctamente', validacionExitosa: true });
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'La contraseña ingresada es incorrecta' });
    }

    return res.status(500).json({ error: 'Error del servidor al validar la contraseña', mensaje: 'Inténtalo de nuevo más tarde.' });
  }
};

/* Desactivar cuenta del usuario */
exports.desactivarCuentaUsuario = async (req, res) => {
  // Extrae el id desde los parámetros de la ruta
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Falta id de usuario' });

  // Verifica que el usuario exista
  try {
    // Realiza una petición para actualizar el estado del usuario
    await axios.put(`${API_BASE_URL}/usuarios/${id}`, { estadoUsuario: 'inactivo' }, { headers: HEADERS });
    return res.status(200).json({ mensaje: 'Cuenta desactivada exitosamente', estadoNuevo: 'inactivo' });

  } catch (errorDesactivacion) {
    const codigo = errorDesactivacion.response?.status || 500;
    return res.status(codigo).json({ error: 'Error al desactivar la cuenta' });
  }
};