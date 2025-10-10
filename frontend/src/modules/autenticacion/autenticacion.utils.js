/* En este archivo se guardan funciones de utilidad. Son fragmentos de código reutilizables que ayudan a simplificar tareas comunes dentro del módulo, como formatear datos, validar campos o manejar fechas. */

/* Construye el payload que se envía al backend para registrar un usuario */
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
function extraerUsuario(response) {
  if (response && response.data && response.data.usuario) {
    return response.data.usuario;
  }
  return response && response.data;
}

/*Construye los datos que se guardarán en la cookie*/
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
const cookieOpts = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  httpOnly: false, // accesible por JavaScript en frontend
  secure: process.env.NODE_ENV === 'production'   // en producción -> true y HTTPS
};

module.exports = {
  construirPayloadRegistro,
  extraerUsuario,
  construirDatosUsuarioCookie,
  cookieOpts
};
