const modeloEmprendimiento = require('./emprendimiento.model');
const mongoose = require('mongoose');

/**
 * Validaciones para el módulo de emprendimientos
 * Contiene funciones auxiliares para validar IDs, nombres, descripciones, imágenes y datos completos.
 */

/**
 * Valida que un ID de MongoDB sea válido
 * @param {string} id - ID a validar
 * @returns {boolean} - true si es válido, false si no
 */
const validarIdMongoDB = (id) => {
  return mongoose.isValidObjectId(id);
};

/**
 * Verifica si un emprendimiento existe por ID
 * @param {string} id - ID del emprendimiento
 * @returns {Promise<boolean>} - true si existe, false si no
 */
const emprendimientoExistePorId = async (id) => {
  try {
    if (!validarIdMongoDB(id)) {
      return false;
    }
    
    const emprendimiento = await modeloEmprendimiento.findOne({
      _id: id,
      emprendimientoEliminado: false
    });
    return !!emprendimiento;
  } catch (error) {
    throw new Error('Error al verificar emprendimiento en base de datos');
  }
};

/**
 * Valida el nombre del emprendimiento
 * @param {string} nombre - Nombre del emprendimiento
 * @returns {boolean} - true si es válido, false si no
 */
const validarNombreEmprendimiento = (nombre) => {
  if (!nombre || typeof nombre !== 'string') {
    return false;
  }
  
  const nombreTrimmed = nombre.trim();
  if (nombreTrimmed.length < 3 || nombreTrimmed.length > 100) {
    return false;
  }
  
  // Permitir letras, números, espacios y algunos símbolos básicos
  const regexNombre = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_.,()&]+$/;
  return regexNombre.test(nombreTrimmed);
};

/**
 * Valida la descripción del emprendimiento
 * @param {string} descripcion - Descripción del emprendimiento
 * @returns {boolean} - true si es válido, false si no
 */
const validarDescripcionEmprendimiento = (descripcion) => {
  if (!descripcion || typeof descripcion !== 'string') {
    return false;
  }
  
  const descripcionTrimmed = descripcion.trim();
  if (descripcionTrimmed.length < 20 || descripcionTrimmed.length > 1000) {
    return false;
  }
  
  return true;
};

/**
 * Valida la categoría del emprendimiento
 * @param {string} categoria - Categoría del emprendimiento
 * @returns {boolean} - true si es válido, false si no
 */
const validarCategoriaEmprendimiento = (categoria) => {
  if (!categoria || typeof categoria !== 'string') {
    return false;
  }
  
  // Lista de categorías válidas para emprendimientos
  const categoriasValidas = [
    'alimentacion',
    'moda',
    'tecnologia',
    'servicios',
    'artesanias',
    'educacion',
    'salud',
    'entretenimiento',
    'hogar',
    'belleza',
    'deportes',
    'otros'
  ];
  
  return categoriasValidas.includes(categoria.toLowerCase());
};

/**
 * Valida el teléfono del emprendimiento
 * @param {string} telefono - Teléfono del emprendimiento
 * @returns {boolean} - true si es válido, false si no
 */
const validarTelefonoEmprendimiento = (telefono) => {
  if (!telefono) {
    return true; // Es opcional
  }
  
  if (typeof telefono !== 'string') {
    return false;
  }
  
  // Permitir formatos: 1234567890, +571234567890, (57) 1234567890
  const regexTelefono = /^[\+]?[\d\s\-\(\)]{7,15}$/;
  return regexTelefono.test(telefono.trim());
};

/**
 * Valida el email del emprendimiento
 * @param {string} email - Email del emprendimiento
 * @returns {boolean} - true si es válido, false si no
 */
const validarEmailEmprendimiento = (email) => {
  if (!email) {
    return true; // Es opcional
  }
  
  if (typeof email !== 'string') {
    return false;
  }
  
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email.trim());
};

/**
 * Valida la dirección del emprendimiento
 * @param {string} direccion - Dirección del emprendimiento
 * @returns {boolean} - true si es válido, false si no
 */


/**
 * Valida el ID del usuario propietario
 * @param {string} idUsuario - ID del usuario
 * @returns {boolean} - true si es válido, false si no
 */
const validarIdUsuario = (idUsuario) => {
  return validarIdMongoDB(idUsuario);
};


/**
 * Valida la imagen del emprendimiento
 * @param {string} imagen - URL o nombre de la imagen
 * @returns {boolean} - true si es válido, false si no
 */
const validarImagenEmprendimiento = (imagen) => {
  if (!imagen) {
    return true; // Es opcional
  }
  
  if (typeof imagen !== 'string') {
    return false;
  }
  
  // Validación básica de URL o nombre de archivo de imagen
  const esUrl = /^https?:\/\//.test(imagen);
  const esArchivoImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(imagen);
  
  return esUrl || esArchivoImagen || imagen.length < 200; // Permitir nombres cortos
};

/**
 * Valida los datos completos para crear un emprendimiento
 * @param {object} datosEmprendimiento - Datos del emprendimiento a validar
 * @returns {Promise<{valido: boolean, errores: string[]}>}
 */
const validarDatosCreacionEmprendimiento = async (datosEmprendimiento) => {
  const errores = [];
  const {
    nombreEmprendimiento,
    descripcionEmprendimiento,
    usuario,
    imagen
  } = datosEmprendimiento;
  
  // Validar nombre (requerido)
  if (!validarNombreEmprendimiento(nombreEmprendimiento)) {
    errores.push('El nombre del emprendimiento es inválido (3-100 caracteres, solo letras, números y símbolos básicos)');
  }
  
  // Validar descripción (requerida)
  if (!validarDescripcionEmprendimiento(descripcionEmprendimiento)) {
    errores.push('La descripción del emprendimiento es inválida (20-1000 caracteres)');
  }
  
  // Validar usuario (requerido)
  if (!validarIdUsuario(usuario)) {
    errores.push('ID de usuario inválido');
  }

  if (!validarImagenEmprendimiento(imagen)) {
    errores.push('Imagen de emprendimiento inválida');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Valida los datos para actualizar un emprendimiento
 * @param {object} datosEmprendimiento - Datos del emprendimiento a validar
 * @param {string} idEmprendimiento - ID del emprendimiento que se está actualizando
 * @returns {Promise<{valido: boolean, errores: string[]}>}
 */
const validarDatosActualizacionEmprendimiento = async (datosEmprendimiento, idEmprendimiento) => {
  const errores = [];
  const {
    nombreEmprendimiento,
    descripcionEmprendimiento,
    direccion,
    imagen
  } = datosEmprendimiento;
  
  // Validar ID
  if (!validarIdMongoDB(idEmprendimiento)) {
    errores.push('ID de emprendimiento inválido');
    return { valido: false, errores };
  }
  
  // Verificar que el emprendimiento existe
  if (!(await emprendimientoExistePorId(idEmprendimiento))) {
    errores.push('Emprendimiento no encontrado');
    return { valido: false, errores };
  }
  
  // Validar campos opcionales solo si se proporcionan
  if (nombreEmprendimiento !== undefined && !validarNombreEmprendimiento(nombreEmprendimiento)) {
    errores.push('El nombre del emprendimiento es inválido (3-100 caracteres, solo letras, números y símbolos básicos)');
  }
  
  if (descripcionEmprendimiento !== undefined && !validarDescripcionEmprendimiento(descripcionEmprendimiento)) {
    errores.push('La descripción del emprendimiento es inválida (20-1000 caracteres)');
  }

  if (imagen !== undefined && !validarImagenEmprendimiento(imagen)) {
    errores.push('Imagen de emprendimiento inválida');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

module.exports = {
  validarIdMongoDB,
  emprendimientoExistePorId,
  validarNombreEmprendimiento,
  validarDescripcionEmprendimiento,
  validarIdUsuario,
  validarImagenEmprendimiento,
  validarDatosCreacionEmprendimiento,
  validarDatosActualizacionEmprendimiento
};
