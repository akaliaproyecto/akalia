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
 * Valida que el precio pactado no sea menor al precio base
 * @param {number} precioBase - Precio base del producto
 * @param {number} precioPactado - Precio pactado en el pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarPrecioPactado = (precioBase, precioPactado) => {
  const precioBaseNum = Number(precioBase);
  const precioPactadoNum = Number(precioPactado);
  
  if (isNaN(precioBaseNum) || isNaN(precioPactadoNum)) {
    return false;
  }
  
  if (precioPactadoNum < precioBaseNum) {
    return false;
  }
  
  return true;
};

/**
 * Valida que el comprador y vendedor sean diferentes
 * @param {string} idUsuarioComprador - ID del usuario comprador
 * @param {string} idUsuarioVendedor - ID del usuario vendedor
 * @returns {boolean} - true si son diferentes, false si son iguales
 */
const validarCompradorVendedorDiferentes = (idUsuarioComprador, idUsuarioVendedor) => {
  if (!idUsuarioComprador || !idUsuarioVendedor) {
    return false;
  }
  
  return idUsuarioComprador.toString() !== idUsuarioVendedor.toString();
};

/**
 * Verifica si el usuario ya tiene un pedido activo para el mismo producto
 * @param {string} idUsuarioComprador - ID del usuario comprador
 * @param {string} idProducto - ID del producto
 * @returns {Promise<boolean>} - true si tiene pedido activo, false si no
 */
const verificarPedidoActivoExistente = async (idUsuarioComprador, idProducto) => {
  try {
    const query = {
      idUsuarioComprador,
      'detallePedido.idProducto': idProducto,
      estadoPedido: { $nin: ['cancelado', 'completado'] }
    };
    
    const pedidoExistente = await modeloPedido.findOne(query);
    
    console.log('📦 [BACKEND] Resultado de búsqueda:', {
      encontrado: !!pedidoExistente,
      pedido: pedidoExistente ? {
        _id: pedidoExistente._id,
        estadoPedido: pedidoExistente.estadoPedido,
        detallePedido: pedidoExistente.detallePedido
      } : null
    });

    return !!pedidoExistente;
  } catch (error) {
    throw new Error('Error al verificar pedidos existentes');
  }
};

/**
 * Valida la descripción del detalle del pedido
 * @param {string} descripcion - Descripción del pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarDescripcionPedido = (descripcion) => {
  if (!descripcion || typeof descripcion !== 'string') {
    return false;
  }
  
  const descripcionTrimmed = descripcion.trim();
  
  if (descripcionTrimmed.length < 10) {
    return false;
  }
  
  if (descripcionTrimmed.length > 500) {
    return false;
  }
  
  return true;
};

/**
 * Valida el estado del pedido con los valores permitidos actualizados
 * @param {string} estado - Estado del pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarEstadoPedido = (estado) => {
  if (!estado || typeof estado !== 'string') {
    return false;
  }
  
  const estadosValidos = [
    'pendiente',
    'aceptado',
    'completado', 
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
 * Valida el detalle del pedido (un solo producto)
 * @param {object} detallePedido - Detalle del pedido
 * @returns {boolean} - true si es válido, false si no
 */
const validarDetallePedido = (detallePedido) => {
  if (!detallePedido || typeof detallePedido !== 'object') {
    return false;
  }
  
  const { idProducto, descripcion, unidades, precioPactado } = detallePedido;
  
  // Validar ID del producto
  if (!validarIdMongoDB(idProducto)) {
    return false;
  }
  
  // Validar descripción (ahora es obligatoria)
  if (!validarDescripcionPedido(descripcion)) {
    return false;
  }
  
  // Validar unidades
  if (!validarCantidadProducto(unidades)) {
    return false;
  }
  
  // Validar precio pactado
  if (!validarTotalPedido(precioPactado)) {
    return false;
  }
  
  return true;
};

/**
 * Valida la dirección de envío
 * @param {object} direccionEnvio - Dirección de envío
 * @returns {boolean} - true si es válido, false si no
 */
const validarDireccionEnvio = (direccionEnvio) => {
  if (!direccionEnvio || typeof direccionEnvio !== 'object') {
    return false;
  }
  
  const { direccion, departamento, ciudad } = direccionEnvio;
  
  // Validar dirección
  if (!direccion || typeof direccion !== 'string' || 
      direccion.trim().length < 5 || direccion.trim().length > 100) {
    return false;
  }
  
  // Validar departamento
  if (!departamento || typeof departamento !== 'string' || departamento.trim().length < 2) {
    return false;
  }
  
  // Validar ciudad
  if (!ciudad || typeof ciudad !== 'string' || ciudad.trim().length < 2) {
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
    idUsuarioComprador,
    idUsuarioVendedor,
    idEmprendimiento,
    detallePedido,
    total
  } = datosPedido;
  
  // Validar IDs obligatorios
  if (!validarIdMongoDB(idUsuarioComprador)) {
    errores.push('ID del usuario comprador inválido');
  }
  
  if (!validarIdMongoDB(idUsuarioVendedor)) {
    errores.push('ID del usuario vendedor inválido');
  }
  
  // Validar que comprador y vendedor sean diferentes
  if (idUsuarioComprador && idUsuarioVendedor && !validarCompradorVendedorDiferentes(idUsuarioComprador, idUsuarioVendedor)) {
    errores.push('El comprador y vendedor no pueden ser la misma persona');
  }
  
  // Validar ID emprendimiento (opcional)
  if (idEmprendimiento && !validarIdMongoDB(idEmprendimiento)) {
    errores.push('ID del emprendimiento inválido');
  }
  
  const validarDetallePedido = (detallePedido) => {
  if (!detallePedido || typeof detallePedido !== 'object') {
    return false;
  }
  
  const { idProducto, unidades, precioPactado } = detallePedido;
  
  // Validar ID del producto
  if (!validarIdMongoDB(idProducto)) {
    return false;
  }
  
  // Validar unidades
  if (!validarCantidadProducto(unidades)) {
    return false;
  }
  
  // Validar precio pactado
  if (!validarTotalPedido(precioPactado)) {
    return false;
  }
  
  return true;
};
  // Validar detalle del pedido (requerido)
  if (!validarDetallePedido(detallePedido)) {
    errores.push('El detalle del pedido es inválido');
  }

  // Validar total (requerido)
  if (!validarTotalPedido(total)) {
    errores.push('El total del pedido es inválido (debe ser un número positivo)');
  }
  
  // Verificar si ya existe un pedido activo para el mismo producto
  if (detallePedido && detallePedido.idProducto && idUsuarioComprador) {
    try {
      const tienePedidoActivo = await verificarPedidoActivoExistente(idUsuarioComprador, detallePedido.idProducto);
      if (tienePedidoActivo) {
        errores.push('Ya tienes un pedido activo para este producto');
      }
    } catch (error) {
      errores.push('Error al verificar pedidos existentes');
    }
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
    detallePedido,
    estado,
    observaciones,
    fechaEntrega
  } = datosPedido;
  // Validar ID
  if (! (validarIdMongoDB(idPedido))) {
    errores.push('ID de pedido inválido');
    return { valido: false, errores };
  }
  
  // Verificar que el pedido existe
  if (!(await pedidoExistePorId(idPedido))) {
    errores.push('Pedido no encontrado');
    return { valido: false, errores };
  }
  
  if (detallePedido !== undefined && !validarDetallePedido(detallePedido)) {
    errores.push('El detalle del pedido es inválido');
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
  validarDetallePedido,
  validarDireccionEnvio,
  validarObservacionesPedido,
  validarFechaEntregaPedido,
  validarDatosCreacionPedido,
  validarDatosActualizacionPedido,
  validarPrecioPactado,
  validarCompradorVendedorDiferentes,
  verificarPedidoActivoExistente,
  validarDescripcionPedido
};
