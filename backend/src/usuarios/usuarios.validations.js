const modeloUsuario = require('./usuarios.model');
const mongoose = require('mongoose');

/**
 * Validaciones para el módulo de usuarios
 */

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido, false si no
 */
const validarFormatoEmail = (email) => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
};

/**
 * Verifica si un email ya existe en la base de datos
 * @param {string} email - Email a verificar
 * @param {string} excludeId - ID de usuario a excluir de la búsqueda (para actualizaciones)
 * @returns {Promise<boolean>} - true si existe, false si no
 */
const emailExiste = async (email, excludeId = null) => {
  try {
    const query = { correo: email.toLowerCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const usuarioExistente = await modeloUsuario.findOne(query);
    return !!usuarioExistente;
  } catch (error) {
    throw new Error('Error al verificar email en base de datos');
  }
};

/**
 * Valida el formato de nombre/apellido (solo letras, espacios y acentos)
 * @param {string} nombre - Nombre o apellido a validar
 * @returns {boolean} - true si es válido, false si no
 */
const validarFormatoNombre = (nombre) => {
  if (!nombre || nombre.trim().length < 2) {
    return false;
  }
  
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return regexNombre.test(nombre.trim());
};

/**
 * Valida el formato de teléfono (exactamente 10 números)
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} - true si es válido, false si no
 */
const validarFormatoTelefono = (telefono) => {
  if (!telefono) {
    return true; // Es opcional
  }
  
  const regexTelefono = /^\d{10}$/;
  return regexTelefono.test(telefono);
};

/**
 * Valida el formato de contraseña (mínimo 8 caracteres, mayúscula, número, símbolo)
 * @param {string} contrasena - Contraseña a validar
 * @returns {object} - {valida: boolean, errores: string[]}
 */
const validarFormatoContrasena = (contrasena) => {
  const errores = [];
  
  if (!contrasena) {
    errores.push('La contraseña es requerida');
    return { valida: false, errores };
  }
  
  if (contrasena.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(contrasena)) {
    errores.push('La contraseña debe incluir al menos una letra mayúscula');
  }
  
  if (!/\d/.test(contrasena)) {
    errores.push('La contraseña debe incluir al menos un número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) {
    errores.push('La contraseña debe incluir al menos un símbolo');
  }
  
  return {
    valida: errores.length === 0,
    errores
  };
};

/**
 * Valida que un ID de MongoDB sea válido
 * @param {string} id - ID a validar
 * @returns {boolean} - true si es válido, false si no
 */
const validarIdMongoDB = (id) => {
  return mongoose.isValidObjectId(id);
};

/**
 * Verifica si un usuario existe por ID
 * @param {string} id - ID del usuario
 * @returns {Promise<boolean>} - true si existe, false si no
 */
const usuarioExistePorId = async (id) => {
  try {
    if (!validarIdMongoDB(id)) {
      return false;
    }
    
    const usuario = await modeloUsuario.findById(id);
    return !!usuario;
  } catch (error) {
    throw new Error('Error al verificar usuario en base de datos');
  }
};

/**
 * Verifica si un nombre de usuario ya existe
 * @param {string} nombreUsuario - Nombre de usuario a verificar
 * @param {string} excludeId - ID de usuario a excluir de la búsqueda
 * @returns {Promise<boolean>} - true si existe, false si no
 */
const nombreUsuarioExiste = async (nombreUsuario, excludeId = null) => {
  try {
    const query = { nombreUsuario: nombreUsuario };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const usuarioExistente = await modeloUsuario.findOne(query);
    return !!usuarioExistente;
  } catch (error) {
    throw new Error('Error al verificar nombre de usuario en base de datos');
  }
};

/**
 * Valida los datos completos para crear un usuario
 * @param {object} datosUsuario - Datos del usuario a validar
 * @returns {Promise<{valido: boolean, errores: string[]}>}
 */
const validarDatosCreacionUsuario = async (datosUsuario) => {
  const errores = [];
  const { nombreUsuario, apellidoUsuario, correo, contrasena, telefono } = datosUsuario;
  
  // Validar email
  if (!correo) {
    errores.push('El email es requerido');
  } else if (!validarFormatoEmail(correo)) {
    errores.push('El formato del email es inválido');
  } else if (await emailExiste(correo)) {
    errores.push('El email ya está registrado');
  }
  
  // Validar nombre
  if (!nombreUsuario) {
    errores.push('El nombre es requerido');
  } else if (!validarFormatoNombre(nombreUsuario)) {
    errores.push('El nombre solo puede contener letras y espacios');
  }
  
  // Validar apellido
  if (!apellidoUsuario) {
    errores.push('El apellido es requerido');
  } else if (!validarFormatoNombre(apellidoUsuario)) {
    errores.push('El apellido solo puede contener letras y espacios');
  }
  
  // Validar teléfono
  if (!validarFormatoTelefono(telefono)) {
    errores.push('El teléfono debe contener exactamente 10 números');
  }
  
  // Validar contraseña
  const validacionContrasena = validarFormatoContrasena(contrasena);
  if (!validacionContrasena.valida) {
    errores.push(...validacionContrasena.errores);
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Valida los datos para actualizar un usuario
 * @param {object} datosUsuario - Datos del usuario a validar
 * @param {string} idUsuario - ID del usuario que se está actualizando
 * @returns {Promise<{valido: boolean, errores: string[]}>}
 */
const validarDatosActualizacionUsuario = async (datosUsuario, idUsuario) => {
  const errores = [];
  const { nombreUsuario, apellidoUsuario, correo, telefono } = datosUsuario;
  
  // Validar ID
  if (!validarIdMongoDB(idUsuario)) {
    errores.push('ID de usuario inválido');
    return { valido: false, errores };
  }
  
  // Verificar que el usuario existe
  if (!(await usuarioExistePorId(idUsuario))) {
    errores.push('Usuario no encontrado');
    return { valido: false, errores };
  }
  
  // Validar email (si se proporciona)
  if (correo !== undefined) {
    if (!validarFormatoEmail(correo)) {
      errores.push('El formato del email es inválido');
    } else if (await emailExiste(correo, idUsuario)) {
      errores.push('El email ya está registrado por otro usuario');
    }
  }
  
  // Validar nombre (si se proporciona)
  if (nombreUsuario !== undefined) {
    if (!validarFormatoNombre(nombreUsuario)) {
      errores.push('El nombre solo puede contener letras y espacios');
    }
  }
  
  // Validar apellido (si se proporciona)
  if (apellidoUsuario !== undefined) {
    if (!validarFormatoNombre(apellidoUsuario)) {
      errores.push('El apellido solo puede contener letras y espacios');
    }
  }
  
  // Validar teléfono (si se proporciona)
  if (telefono !== undefined) {
    if (!validarFormatoTelefono(telefono)) {
      errores.push('El teléfono debe contener exactamente 10 números');
    }
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

module.exports = {
  validarFormatoEmail,
  emailExiste,
  validarFormatoNombre,
  validarFormatoTelefono,
  validarFormatoContrasena,
  validarIdMongoDB,
  usuarioExistePorId,
  nombreUsuarioExiste,
  validarDatosCreacionUsuario,
  validarDatosActualizacionUsuario
};
