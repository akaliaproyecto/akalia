const mongoose = require('mongoose');

/**
 * Módulo de validaciones generales
 * - Contiene validadores reutilizables (ID Mongo, email, teléfono, fechas, etc.)
 * - Usado por controllers y validaciones de cada módulo.
 */
/**
 * Validaciones generales que pueden ser utilizadas por diferentes módulos
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
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido, false si no
 */
const validarFormatoEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email.trim());
};

/**
 * Valida el formato de un teléfono
 * @param {string} telefono - Teléfono a validar
 * @param {boolean} requerido - Si el teléfono es requerido
 * @returns {boolean} - true si es válido, false si no
 */
const validarFormatoTelefono = (telefono, requerido = false) => {
  if (!telefono) {
    return !requerido; // Si no es requerido, es válido
  }
  
  if (typeof telefono !== 'string') {
    return false;
  }
  
  // Permitir formatos: 1234567890, +571234567890, (57) 1234567890
  const regexTelefono = /^[\+]?[\d\s\-\(\)]{7,15}$/;
  return regexTelefono.test(telefono.trim());
};

/**
 * Valida que un texto tenga un rango de caracteres específico
 * @param {string} texto - Texto a validar
 * @param {number} minimo - Mínimo de caracteres
 * @param {number} maximo - Máximo de caracteres
 * @param {boolean} requerido - Si el texto es requerido
 * @returns {boolean} - true si es válido, false si no
 */
const validarLongitudTexto = (texto, minimo = 1, maximo = 255, requerido = true) => {
  if (!texto) {
    return !requerido;
  }
  
  if (typeof texto !== 'string') {
    return false;
  }
  
  const textoTrimmed = texto.trim();
  return textoTrimmed.length >= minimo && textoTrimmed.length <= maximo;
};

/**
 * Valida que un texto contenga solo letras, espacios y acentos
 * @param {string} texto - Texto a validar
 * @param {boolean} requerido - Si el texto es requerido
 * @returns {boolean} - true si es válido, false si no
 */
const validarSoloLetras = (texto, requerido = true) => {
  if (!texto) {
    return !requerido;
  }
  
  if (typeof texto !== 'string') {
    return false;
  }
  
  const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return regexSoloLetras.test(texto.trim());
};

/**
 * Valida que un número esté dentro de un rango específico
 * @param {number|string} numero - Número a validar
 * @param {number} minimo - Valor mínimo
 * @param {number} maximo - Valor máximo
 * @param {boolean} requerido - Si el número es requerido
 * @returns {boolean} - true si es válido, false si no
 */
const validarRangoNumerico = (numero, minimo = 0, maximo = Number.MAX_SAFE_INTEGER, requerido = true) => {
  if (numero === null || numero === undefined || numero === '') {
    return !requerido;
  }
  
  const numeroConvertido = Number(numero);
  
  if (isNaN(numeroConvertido)) {
    return false;
  }
  
  return numeroConvertido >= minimo && numeroConvertido <= maximo;
};

/**
 * Valida que una fecha sea válida y esté dentro de un rango
 * @param {Date|string} fecha - Fecha a validar
 * @param {Date} fechaMinima - Fecha mínima permitida
 * @param {Date} fechaMaxima - Fecha máxima permitida
 * @param {boolean} requerido - Si la fecha es requerida
 * @returns {boolean} - true si es válido, false si no
 */
const validarFecha = (fecha, fechaMinima = null, fechaMaxima = null, requerido = true) => {
  if (!fecha) {
    return !requerido;
  }
  
  const fechaConvertida = new Date(fecha);
  
  if (isNaN(fechaConvertida.getTime())) {
    return false;
  }
  
  if (fechaMinima && fechaConvertida < fechaMinima) {
    return false;
  }
  
  if (fechaMaxima && fechaConvertida > fechaMaxima) {
    return false;
  }
  
  return true;
};

/**
 * Valida que una URL sea válida
 * @param {string} url - URL a validar
 * @param {boolean} requerido - Si la URL es requerida
 * @returns {boolean} - true si es válido, false si no
 */
const validarURL = (url, requerido = false) => {
  if (!url) {
    return !requerido;
  }
  
  if (typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    // Si no es una URL válida, verificar si es un path relativo válido
    const regexPathRelativo = /^[a-zA-Z0-9._\-\/]+$/;
    return regexPathRelativo.test(url);
  }
};

/**
 * Valida un array con restricciones específicas
 * @param {Array} array - Array a validar
 * @param {number} minimoElementos - Mínimo número de elementos
 * @param {number} maximoElementos - Máximo número de elementos
 * @param {Function} validadorElemento - Función para validar cada elemento
 * @param {boolean} requerido - Si el array es requerido
 * @returns {boolean} - true si es válido, false si no
 */
const validarArray = (array, minimoElementos = 0, maximoElementos = 100, validadorElemento = null, requerido = true) => {
  if (!array) {
    return !requerido;
  }
  
  if (!Array.isArray(array)) {
    return false;
  }
  
  if (array.length < minimoElementos || array.length > maximoElementos) {
    return false;
  }
  
  if (validadorElemento && typeof validadorElemento === 'function') {
    return array.every(validadorElemento);
  }
  
  return true;
};

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param {string} texto - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
const sanitizarTexto = (texto) => {
  if (!texto || typeof texto !== 'string') {
    return '';
  }
  
  return texto
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
    .replace(/<[^>]*>/g, '') // Remover tags HTML
    .replace(/[<>]/g, ''); // Remover caracteres peligrosos restantes
};

/**
 * Valida múltiples campos a la vez
 * @param {object} datos - Objeto con los datos a validar
 * @param {object} reglas - Objeto con las reglas de validación
 * @returns {object} - {valido: boolean, errores: string[]}
 */
const validarMultiplesCampos = (datos, reglas) => {
  const errores = [];
  
  for (const [campo, reglasDelCampo] of Object.entries(reglas)) {
    const valor = datos[campo];
    
    // Si el campo es requerido y no existe
    if (reglasDelCampo.requerido && (valor === null || valor === undefined || valor === '')) {
      errores.push(`El campo ${campo} es requerido`);
      continue;
    }
    
    // Si el campo no es requerido y está vacío, continuar
    if (!reglasDelCampo.requerido && (valor === null || valor === undefined || valor === '')) {
      continue;
    }
    
    // Aplicar validaciones específicas
    if (reglasDelCampo.tipo === 'email' && !validarFormatoEmail(valor)) {
      errores.push(`El campo ${campo} debe ser un email válido`);
    }
    
    if (reglasDelCampo.tipo === 'telefono' && !validarFormatoTelefono(valor, reglasDelCampo.requerido)) {
      errores.push(`El campo ${campo} debe ser un teléfono válido`);
    }
    
    if (reglasDelCampo.tipo === 'id' && !validarIdMongoDB(valor)) {
      errores.push(`El campo ${campo} debe ser un ID válido`);
    }
    
    if (reglasDelCampo.longitud) {
      const { minimo, maximo } = reglasDelCampo.longitud;
      if (!validarLongitudTexto(valor, minimo, maximo, reglasDelCampo.requerido)) {
        errores.push(`El campo ${campo} debe tener entre ${minimo} y ${maximo} caracteres`);
      }
    }
    
    if (reglasDelCampo.rango) {
      const { minimo, maximo } = reglasDelCampo.rango;
      if (!validarRangoNumerico(valor, minimo, maximo, reglasDelCampo.requerido)) {
        errores.push(`El campo ${campo} debe estar entre ${minimo} y ${maximo}`);
      }
    }
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

module.exports = {
  validarIdMongoDB,
  validarFormatoEmail,
  validarFormatoTelefono,
  validarLongitudTexto,
  validarSoloLetras,
  validarRangoNumerico,
  validarFecha,
  validarURL,
  validarArray,
  sanitizarTexto,
  validarMultiplesCampos
};
