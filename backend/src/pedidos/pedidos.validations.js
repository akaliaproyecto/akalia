const modeloPedido = require('./pedidos.model');
const mongoose = require('mongoose');

/**
 * Validaciones para el módulo de pedidos
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
 * Verifica si un pedido existe por ID
 * @param {string} id - ID del pedido
 * @returns {Promise<boolean>} - true si existe, false si no
 */
const pedidoExistePorId = async (id) => {
  try {
    if (!validarIdMongoDB(id)) {
      return false;
    }
    
    const pedido = await modeloPedido.findById(id);
    return !!pedido;
  } catch (error) {
    throw new Error('Error al verificar pedido en base de datos');
  }
};

/**
 * Valida el estado del pedido
 * @param {string} estado - Estado del pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarEstadoPedido = (estado) => {
  if (!estado || typeof estado !== 'string') {
    return false;
  }
  
  const estadosValidos = [
    'pendiente',
    'confirmado',
    'preparando',
    'enviado',
    'entregado',
    'cancelado'
  ];
  
  return estadosValidos.includes(estado.toLowerCase());
};

/**
 * Valida la cantidad de un producto en el pedido
 * @param {number} cantidad - Cantidad del producto
 * @returns {boolean} - true si es válido, false si no
 */
const validarCantidadProducto = (cantidad) => {
  const cantidadNum = Number(cantidad);
  
  if (isNaN(cantidadNum) || cantidadNum <= 0 || cantidadNum > 999) {
    return false;
  }
  
  // Debe ser un número entero
  return Number.isInteger(cantidadNum);
};

/**
 * Valida el total del pedido
 * @param {number} total - Total del pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarTotalPedido = (total) => {
  const totalNum = Number(total);
  
  if (isNaN(totalNum) || totalNum < 0) {
    return false;
  }
  
  // Máximo total razonable
  if (totalNum > 999999999) {
    return false;
  }
  
  return true;
};

/**
 * Valida los productos del pedido
 * @param {Array} productos - Array de productos del pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarProductosPedido = (productos) => {
  if (!productos || !Array.isArray(productos)) {
    return false;
  }
  
  if (productos.length === 0) {
    return false; // Un pedido debe tener al menos un producto
  }
  
  if (productos.length > 50) {
    return false; // Máximo 50 productos por pedido
  }
  
  // Validar cada producto
  return productos.every(producto => {
    if (!producto || typeof producto !== 'object') {
      return false;
    }
    
    const { producto: idProducto, cantidad, precio } = producto;
    
    // Validar ID del producto
    if (!validarIdMongoDB(idProducto)) {
      return false;
    }
    
    // Validar cantidad
    if (!validarCantidadProducto(cantidad)) {
      return false;
    }
    
    // Validar precio
    if (!validarTotalPedido(precio)) {
      return false;
    }
    
    return true;
  });
};

/**
 * Valida la información de contacto del pedido
 * @param {object} contacto - Información de contacto
 * @returns {boolean} - true si es válido, false si no
 */
const validarContactoPedido = (contacto) => {
  if (!contacto || typeof contacto !== 'object') {
    return false;
  }
  
  const { nombre, telefono, email, direccion } = contacto;
  
  // Validar nombre
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return false;
  }
  
  // Validar teléfono
  if (!telefono || typeof telefono !== 'string') {
    return false;
  }
  const regexTelefono = /^[\+]?[\d\s\-\(\)]{7,15}$/;
  if (!regexTelefono.test(telefono.trim())) {
    return false;
  }
  
  // Validar email (opcional)
  if (email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.trim())) {
      return false;
    }
  }
  
  // Validar dirección
  if (!direccion || typeof direccion !== 'string' || direccion.trim().length < 5) {
    return false;
  }
  
  return true;
};

/**
 * Valida las observaciones del pedido
 * @param {string} observaciones - Observaciones del pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarObservacionesPedido = (observaciones) => {
  if (!observaciones) {
    return true; // Las observaciones son opcionales
  }
  
  if (typeof observaciones !== 'string') {
    return false;
  }
  
  const observacionesTrimmed = observaciones.trim();
  if (observacionesTrimmed.length > 500) {
    return false; // Máximo 500 caracteres
  }
  
  return true;
};

/**
 * Valida la fecha de entrega del pedido
 * @param {Date|string} fechaEntrega - Fecha de entrega del pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarFechaEntregaPedido = (fechaEntrega) => {
  if (!fechaEntrega) {
    return true; // La fecha de entrega es opcional
  }
  
  const fecha = new Date(fechaEntrega);
  
  if (isNaN(fecha.getTime())) {
    return false; // Fecha inválida
  }
  
  // La fecha de entrega debe ser futura (al menos 1 hora desde ahora)
  const ahora = new Date();
  const unaHoraDelante = new Date(ahora.getTime() + 60 * 60 * 1000);
  
  if (fecha < unaHoraDelante) {
    return false;
  }
  
  // No puede ser más de 1 año en el futuro
  const unAnoDelante = new Date(ahora.getTime() + 365 * 24 * 60 * 60 * 1000);
  if (fecha > unAnoDelante) {
    return false;
  }
  
  return true;
};

/**
 * Valida los datos completos para crear un pedido
 * @param {object} datosPedido - Datos del pedido a validar
 * @returns {Promise<{valido: boolean, errores: string[]}>}
 */
const validarDatosCreacionPedido = async (datosPedido) => {
  const errores = [];
  const {
    productos,
    total,
    contacto,
    observaciones,
    fechaEntrega
  } = datosPedido;
  
  // Validar productos (requeridos)
  if (!validarProductosPedido(productos)) {
    errores.push('Los productos del pedido son inválidos (debe haber al menos 1 y máximo 50)');
  }
  
  // Validar total (requerido)
  if (!validarTotalPedido(total)) {
    errores.push('El total del pedido es inválido (debe ser un número positivo)');
  }
  
  // Validar contacto (requerido)
  if (!validarContactoPedido(contacto)) {
    errores.push('La información de contacto es inválida');
  }
  
  // Validar campos opcionales
  if (!validarObservacionesPedido(observaciones)) {
    errores.push('Las observaciones del pedido son inválidas (máximo 500 caracteres)');
  }
  
  if (!validarFechaEntregaPedido(fechaEntrega)) {
    errores.push('La fecha de entrega es inválida (debe ser futura y dentro de 1 año)');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Valida los datos para actualizar un pedido
 * @param {object} datosPedido - Datos del pedido a validar
 * @param {string} idPedido - ID del pedido que se está actualizando
 * @returns {Promise<{valido: boolean, errores: string[]}>}
 */
const validarDatosActualizacionPedido = async (datosPedido, idPedido) => {
  const errores = [];
  const {
    estado,
    observaciones,
    fechaEntrega
  } = datosPedido;
  
  // Validar ID
  if (!validarIdMongoDB(idPedido)) {
    errores.push('ID de pedido inválido');
    return { valido: false, errores };
  }
  
  // Verificar que el pedido existe
  if (!(await pedidoExistePorId(idPedido))) {
    errores.push('Pedido no encontrado');
    return { valido: false, errores };
  }
  
  // Validar campos opcionales solo si se proporcionan
  if (estado !== undefined && !validarEstadoPedido(estado)) {
    errores.push('Estado de pedido inválido');
  }
  
  if (observaciones !== undefined && !validarObservacionesPedido(observaciones)) {
    errores.push('Las observaciones del pedido son inválidas (máximo 500 caracteres)');
  }
  
  if (fechaEntrega !== undefined && !validarFechaEntregaPedido(fechaEntrega)) {
    errores.push('La fecha de entrega es inválida (debe ser futura y dentro de 1 año)');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

module.exports = {
  validarIdMongoDB,
  pedidoExistePorId,
  validarEstadoPedido,
  validarCantidadProducto,
  validarTotalPedido,
  validarProductosPedido,
  validarContactoPedido,
  validarObservacionesPedido,
  validarFechaEntregaPedido,
  validarDatosCreacionPedido,
  validarDatosActualizacionPedido
};
