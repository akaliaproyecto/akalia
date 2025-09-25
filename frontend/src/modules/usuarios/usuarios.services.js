/* Servicios de usuarios: obtención, actualización, validación y desactivación de cuentas
Módulo que centraliza la lógica del frontend para usuarios: consulta la API (axios) usando la URL y cabeceras desde env, normaliza y formatea los datos para la vista (mi perfil), maneja la actualización del perfil (y actualiza la cookie), valida la contraseña actual contra el endpoint de login y marca la cuenta como inactiva (desactivación). */

const axios = require('axios');
require('dotenv').config();

const {
  verificarUsuarioLogueado,
} = require('./usuarios.utils')

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Verificar contraseña actual del usuario - Middleware de Express */
exports.verificarContrasenaActual = async (req, res) => {
  try {
    const { userId, contrasenaActual } = req.body;
    
    const response = await axios.post(`${API_BASE_URL}/usuarios/verificar-contrasena`, {
      userId: userId,
      contrasenaActual: contrasenaActual
    }, { headers: HEADERS });
    
    res.json(response.data);
  } catch (error) {
    // Evitar referencias circulares al loggear el error
    const errorInfo = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    };
    console.error('Error al verificar contraseña:', errorInfo);
    
    // Responder con el error de forma segura
    const errorMessage = error.response?.data?.mensaje || error.response?.data?.error || error.message || 'Error al verificar contraseña';
    res.status(500).json({ error: errorMessage });
  }
};

/* Verificar usuario logueado */
exports.obtenerUsuario = async (req, res) => {
  const id = req.usuarioAutenticado?.idUsuario;
  if (!id) return res.redirect('/?error=Debes+iniciar+sesion');

  try {
    // Obtener usando helper centralizado
    const usuarioDesdeApi = await fetchUsuarioPorId(id).catch(() => null);
    const usuarioPerfil = usuarioDesdeApi || req.usuarioAutenticado;

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
<<<<<<< HEAD
  const { nombreUsuario, apellidoUsuario, correo, contrasena, telefono, direcciones } = req.body;
  
=======
  const { nombreUsuario, apellidoUsuario, email, contrasena, telefono, direcciones } = req.body;

>>>>>>> 8de145c (Se añade vista de usuario-pedido-editar: Vista del vendedor para modificar el pedido)
  if (!id) {
    return res.status(400).json({ error: 'Falta id de usuario' });
  }

  // Construir objeto que se enviará al backend (normalizar 'email' a 'correo')
  const datosParaApi = {
    nombreUsuario,
    apellidoUsuario,
    correo,  // Normalizar: el frontend envía 'email' pero el backend espera 'correo'
    telefono
  };
<<<<<<< HEAD
  
=======

  // Manejar direcciones si vienen como string JSON
  if (direcciones) {
    try {
      datosParaApi.direcciones = typeof direcciones === 'string' ? JSON.parse(direcciones) : direcciones;
    } catch (e) {
      console.error('Error parseando direcciones:', e);
      datosParaApi.direcciones = [];
    }
  }

>>>>>>> 8de145c (Se añade vista de usuario-pedido-editar: Vista del vendedor para modificar el pedido)
  // Si se envía nueva contraseña, la mandamos para que el backend la procese 
  if (contrasena) datosParaApi.contrasena = contrasena;

  // Si se envían direcciones, agregarlas al objeto (incluso si el array está vacío para eliminar todas)
  if (direcciones && Array.isArray(direcciones)) {
    datosParaApi.direcciones = direcciones;
  }

  try {
    const respuesta = await axios.put(`${API_BASE_URL}/usuarios/${id}`, datosParaApi, { headers: HEADERS });

    // Extraer usuario de la respuesta del backend (puede venir en respuesta.data.usuario o directamente)
    const usuarioActualizado = respuesta.data.usuario || respuesta.data;

    // Reenviar cookies que el backend haya establecido (Set-Cookie) al navegador
    try {
      const setCookieHeader = respuesta.headers && (respuesta.headers['set-cookie'] || respuesta.headers['Set-Cookie']);
      if (setCookieHeader) {
        // Pasar las cookies tal cual al cliente
        res.setHeader('Set-Cookie', setCookieHeader);
      }
    } catch (e) {
      console.warn('No se pudieron reenviar cookies del backend al navegador:', e.message || e);
    }

    // NOTA: El backend (actualizarUsuario) es el responsable de escribir la cookie pública 'usuario'.
    // Aquí no volvemos a escribir la cookie desde el frontend para evitar inconsistencia.

    // Si la petición viene de un submit SSR (HTML form) redirigimos
    const acceptHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (acceptHtml) {
      return res.redirect('/mi-perfil?exito=1');
    }

    // Reenviamos al cliente la respuesta que devolvió el backend
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
  const { id: idUsuario } = req.params;
  const { contrasenaIngresada } = req.body;

  if (!idUsuario) return res.status(400).json({ error: 'Falta id de usuario' });
  if (!contrasenaIngresada) return res.status(400).json({ error: 'Debes ingresar tu contraseña actual' });

  try {
    // Usar helper centralizado para obtener usuario
    const usuarioFromApi = await fetchUsuarioPorId(idUsuario);
    const posibleCorreo = usuarioFromApi?.correo || usuarioFromApi?.email;

    if (!posibleCorreo) {
      console.error('validarContrasenaUsuario: no se encontró correo en la respuesta del API', { usuarioFromApi });
      return res.status(500).json({ error: 'No se pudo obtener el correo del usuario' });
    }

    // Llamar al endpoint de autenticación correcto (/auth/login)
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        correo: posibleCorreo,
        contrasena: contrasenaIngresada
      }, { headers: HEADERS });

      return res.status(200).json({ mensaje: 'Contraseña validada correctamente', validacionExitosa: true });
    } catch (errLogin) {
      if (errLogin.response?.status === 401) {
        return res.status(401).json({ error: 'La contraseña ingresada es incorrecta' });
      }
      console.error('validarContrasenaUsuario - error login:', errLogin.response?.data || errLogin.message || errLogin);
      return res.status(500).json({ error: 'Error del servidor al validar la contraseña', mensaje: errLogin.response?.data?.error || 'Inténtalo de nuevo más tarde.' });
    }

  } catch (error) {
    console.error('validarContrasenaUsuario (general):', error?.response?.data || error?.message || error);
    if (error.response?.status === 404) return res.status(404).json({ error: 'Usuario no encontrado' });
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
    // Usar PATCH para invocar el endpoint de eliminación parcial del backend
    await axios.patch(`${API_BASE_URL}/usuarios/${id}`, { estadoUsuario: 'inactivo' }, { headers: HEADERS });
    return res.status(200).json({ mensaje: 'Cuenta desactivada exitosamente', estadoNuevo: 'inactivo' });

  } catch (errorDesactivacion) {
    const codigo = errorDesactivacion.response?.status || 500;
    return res.status(codigo).json({ error: 'Error al desactivar la cuenta' });
  }
};

// Helper interno para obtener usuario desde el backend y normalizar la respuesta
async function fetchUsuarioPorId(id) {
  if (!id) throw new Error('Falta id de usuario');
  const { data } = await axios.get(`${API_BASE_URL}/usuarios/${id}`, { headers: HEADERS });
  const usuario = data.usuario || data;
  // Normalizar campos: garantizar 'email' y 'correo' disponibles
  if (usuario) {
    usuario.email = usuario.email || usuario.correo || usuario.correoUsuario || '';
    usuario.correo = usuario.correo || usuario.email || '';
  }
  return usuario;
}

// Endpoint que devuelve detalle de usuario en formato JSON (proxy al backend)
exports.obtenerDetalleUsuario = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Falta id de usuario' });
  try {
    const usuario = await fetchUsuarioPorId(id);
    return res.status(200).json({ usuario });
  } catch (err) {
    console.error('obtenerDetalleUsuario error:', err.response?.data || err.message || err);
    const status = err.response?.status || 500;
    return res.status(status).json({ error: err.response?.data || 'Error al obtener usuario' });
  }
};