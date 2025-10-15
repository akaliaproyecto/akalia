/**
 * @file Utilidades del módulo de autenticación (frontend)
 * @description Funciones pequeñas para construir payloads y manejar datos del usuario.
 */

/* Construye el payload que se envía al backend para registrar un usuario */
/**
 * Construye el objeto que se enviará al backend para registrar un usuario.
 * @param {Object} params
 * @param {string} params.email - Correo del usuario.
 * @param {string} params.nombreUsuario - Nombre.
 * @param {string} params.apellidoUsuario - Apellido.
 * @param {string} [params.telefono] - Teléfono (opcional).
 * @param {string} params.contrasena - Contraseña.
 * @returns {Object} Payload con las propiedades esperadas por el backend.
 */
function construirPayloadRegistro({ email, nombreUsuario, apellidoUsuario, telefono, contrasena }) {
  return {
    correo: email,
    nombreUsuario,
    apellidoUsuario,
    telefono: telefono || null,
    contrasena
  };
}

/* Extrae el objeto usuario de la respuesta HTTP */
/**
 * Extrae el objeto usuario de la respuesta HTTP del backend.
 * @param {Object} response - Respuesta de axios.
 * @returns {Object|null} Usuario extraído o null si no existe.
 */
function extraerUsuario(response) {
  if (response && response.data && response.data.usuario) {
    return response.data.usuario;
  }
  return response && response.data;
}

/*Construye los datos que se guardarán en la cookie*/
/**
 * Construye un objeto simplificado para guardar en la cookie del frontend.
 * @param {Object} usuario - Objeto usuario devuelto por el backend.
 * @returns {Object} Datos reducidos para la cookie.
 */
function construirDatosUsuarioCookie(usuario) {
  return {
    idUsuario: usuario._id || usuario.idUsuario || '',
    nombreUsuario: usuario.nombreUsuario || '',
    apellidoUsuario: usuario.apellidoUsuario || '',
    correo: usuario.correo || usuario.email || '',
    rolUsuario: usuario.rolUsuario || '' // solo lo trae login
  };
}

/* Opciones de configuración de cookies */
/**
 * Opciones por defecto para las cookies de usuario que se guardan en frontend.
 */
const cookieOpts = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  httpOnly: false, // accesible por JavaScript en frontend
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'   // en producción -> true y HTTPS
};

module.exports = {
  construirPayloadRegistro,
  extraerUsuario,
  construirDatosUsuarioCookie,
  cookieOpts
};
