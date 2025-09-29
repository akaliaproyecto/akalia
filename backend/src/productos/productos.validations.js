const modeloProducto = require('./productos.model');
const mongoose = require('mongoose');

/**
 * Validaciones para el módulo de productos
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
 * Verifica si un producto existe por ID
 * @param {string} id - ID del producto
 * @returns {Promise<boolean>} - true si existe, false si no
 */
const productoExistePorId = async (id) => {
  try {
    if (!validarIdMongoDB(id)) {
      return false;
    }
    
    const producto = await modeloProducto.findOne({
      _id: id,
      $or: [
        { estadoProducto: 'activo' },
        { productoActivo: true, productoEliminado: false }
      ]
    });
    return !!producto;
  } catch (error) {
    throw new Error('Error al verificar producto en base de datos');
  }
};

/**
 * Valida el nombre del producto
 * @param {string} nombre - Nombre del producto
 * @returns {boolean} - true si es válido, false si no
 */
const validarNombreProducto = (nombre) => {
  if (!nombre || typeof nombre !== 'string') {
    return false;
  }
  
  const nombreTrimmed = nombre.trim();
  if (nombreTrimmed.length < 3 || nombreTrimmed.length > 100) {
    return false;
  }
  
  // Permitir letras, números, espacios y algunos símbolos básicos
  const regexNombre = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_.,()]+$/;
  return regexNombre.test(nombreTrimmed);
};

/**
 * Valida la descripción del producto
 * @param {string} descripcion - Descripción del producto
 * @returns {boolean} - true si es válido, false si no
 */
const validarDescripcionProducto = (descripcion) => {
  if (!descripcion || typeof descripcion !== 'string') {
    return false;
  }
  
  const descripcionTrimmed = descripcion.trim();
  if (descripcionTrimmed.length < 10 || descripcionTrimmed.length > 500) {
    return false;
  }
  
  return true;
};

/**
 * Valida el precio del producto
 * @param {number|string} precio - Precio del producto
 * @returns {boolean} - true si es válido, false si no
 */
const validarPrecioProducto = (precio) => {
  const precioNum = Number(precio);
  
  if (isNaN(precioNum) || precioNum < 0) {
    return false;
  }
  
  // Máximo precio razonable (ajustar según necesidades)
  if (precioNum > 999999999) {
    return false;
  }
  
  return true;
};

/**
 * Valida que el emprendimiento exista y sea válido
 * @param {string} idEmprendimiento - ID del emprendimiento
 * @returns {boolean} - true si es válido, false si no
 */
const validarIdEmprendimiento = (idEmprendimiento) => {
  return validarIdMongoDB(idEmprendimiento);
};

/**
 * Valida la categoría del producto
 * @param {string} categoria - Categoría del producto
 * @returns {boolean} - true si es válido, false si no
 */
const validarCategoriaProducto = (categoria) => {
  if (!categoria || typeof categoria !== 'string') {
    return false;
  }
  
  // Lista de categorías válidas (ajustar según el modelo)
  const categoriasValidas = [
    'comida',
    'ropa',
    'accesorios',
    'hogar',
    'tecnologia',
    'belleza',
    'deportes',
    'libros',
    'arte',
    'otros'
  ];
  
  return categoriasValidas.includes(categoria.toLowerCase());
};

/**
 * Valida las etiquetas del producto
 * @param {Array} etiquetas - Etiquetas del producto
 * @returns {boolean} - true si es válido, false si no
 */
const validarEtiquetasProducto = (etiquetas) => {
  if (!etiquetas) {
    return true; // Las etiquetas son opcionales
  }
  
  if (!Array.isArray(etiquetas)) {
    return false;
  }
  
  // Máximo 10 etiquetas
  if (etiquetas.length > 10) {
    return false;
  }
  
  // Cada etiqueta debe ser un string válido
  return etiquetas.every(etiqueta => {
    if (!etiqueta || typeof etiqueta !== 'string') {
      return false;
    }
    
    const etiquetaTrimmed = etiqueta.trim();
    return etiquetaTrimmed.length >= 2 && etiquetaTrimmed.length <= 30;
  });
};

/**
 * Valida las imágenes del producto
 * @param {Array} imagenes - URLs de imágenes del producto
 * @returns {boolean} - true si es válido, false si no
 */
const validarImagenesProducto = (imagenes) => {
  if (!imagenes) {
    return true; // Las imágenes son opcionales
  }
  
  if (!Array.isArray(imagenes)) {
    return false;
  }
  
  // Máximo 5 imágenes
  if (imagenes.length > 5) {
    return false;
  }
  
  // Cada imagen debe ser una URL válida o string de imagen
  return imagenes.every(imagen => {
    if (!imagen || typeof imagen !== 'string') {
      return false;
    }
    
    // Validación básica de URL o nombre de archivo de imagen
    const esUrl = /^https?:\/\//.test(imagen);
    const esArchivoImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(imagen);
    
    return esUrl || esArchivoImagen || imagen.length < 200; // Permitir nombres cortos
  });
};

/**
 * Valida los datos completos para crear un producto
 * @param {object} datosProducto - Datos del producto a validar
 * @returns {Promise<{valido: boolean, errores: string[]}>}
 */
const validarDatosCreacionProducto = async (datosProducto) => {
  const errores = [];
  const {
    nombreProducto,
    descripcionProducto,
    precioProducto,
    emprendimiento,
    categoria,
    etiquetas,
    imagenes
  } = datosProducto;
  
  // Validar nombre
  if (!validarNombreProducto(nombreProducto)) {
    errores.push('El nombre del producto es inválido (3-100 caracteres, solo letras, números y símbolos básicos)');
  }
  
  // Validar descripción
  if (!validarDescripcionProducto(descripcionProducto)) {
    errores.push('La descripción del producto es inválida (10-500 caracteres)');
  }
  
  // Validar precio
  if (!validarPrecioProducto(precioProducto)) {
    errores.push('El precio del producto es inválido (debe ser un número positivo)');
  }
  
  // Validar emprendimiento
  if (!validarIdEmprendimiento(emprendimiento)) {
    errores.push('ID de emprendimiento inválido');
  }
  
  // Validar categoría
  if (!validarCategoriaProducto(categoria)) {
    errores.push('Categoría de producto inválida');
  }
  
  // Validar etiquetas
  if (!validarEtiquetasProducto(etiquetas)) {
    errores.push('Las etiquetas del producto son inválidas (máximo 10, cada una de 2-30 caracteres)');
  }
  
  // Validar imágenes
  if (!validarImagenesProducto(imagenes)) {
    errores.push('Las imágenes del producto son inválidas (máximo 5)');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Valida los datos para actualizar un producto
 * @param {object} datosProducto - Datos del producto a validar
 * @param {string} idProducto - ID del producto que se está actualizando
 * @returns {Promise<{valido: boolean, errores: string[]}>}
 */
const validarDatosActualizacionProducto = async (datosProducto, idProducto) => {
  const errores = [];
  const {
    nombreProducto,
    descripcionProducto,
    precioProducto,
    categoria,
    etiquetas,
    imagenes
  } = datosProducto;
  
  // Validar ID
  if (!validarIdMongoDB(idProducto)) {
    errores.push('ID de producto inválido');
    return { valido: false, errores };
  }
  
  // Verificar que el producto existe
  if (!(await productoExistePorId(idProducto))) {
    errores.push('Producto no encontrado');
    return { valido: false, errores };
  }
  
  // Validar campos opcionales solo si se proporcionan
  if (nombreProducto !== undefined && !validarNombreProducto(nombreProducto)) {
    errores.push('El nombre del producto es inválido (3-100 caracteres, solo letras, números y símbolos básicos)');
  }
  
  if (descripcionProducto !== undefined && !validarDescripcionProducto(descripcionProducto)) {
    errores.push('La descripción del producto es inválida (10-500 caracteres)');
  }
  
  if (precioProducto !== undefined && !validarPrecioProducto(precioProducto)) {
    errores.push('El precio del producto es inválido (debe ser un número positivo)');
  }
  
  if (categoria !== undefined && !validarCategoriaProducto(categoria)) {
    errores.push('Categoría de producto inválida');
  }
  
  if (etiquetas !== undefined && !validarEtiquetasProducto(etiquetas)) {
    errores.push('Las etiquetas del producto son inválidas (máximo 10, cada una de 2-30 caracteres)');
  }
  
  if (imagenes !== undefined && !validarImagenesProducto(imagenes)) {
    errores.push('Las imágenes del producto son inválidas (máximo 5)');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

module.exports = {
  validarIdMongoDB,
  productoExistePorId,
  validarNombreProducto,
  validarDescripcionProducto,
  validarPrecioProducto,
  validarIdEmprendimiento,
  validarCategoriaProducto,
  validarEtiquetasProducto,
  validarImagenesProducto,
  validarDatosCreacionProducto,
  validarDatosActualizacionProducto
};
