// Importar el modelo de pedido
const modeloPedido = require("./pedidos.model");
const Log = require('../middlewares/logs');
const {
  validarIdMongoDB,
  pedidoExistePorId,
  validarDatosCreacionPedido,
  validarDatosActualizacionPedido,
  verificarPedidoActivoExistente
} = require('./pedidos.validations');

// Consultar/Listar todos los pedidos (panel admin)
exports.obtenerPedidos = async (req, res) => {
  try {
    let pedidosEncontrados = await modeloPedido.find();

    if (pedidosEncontrados && pedidosEncontrados.length > 0) {
      res.status(200).json(pedidosEncontrados);
    } else {
      res.status(404).json({ mensaje: "No se encontraron pedidos" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar pedidos", detalle: error.message });
  }
};

// Consultar/Listar todos los pedidos del usuario vendedor
exports.obtenerVentas = async (req, res) => {
  const idUsuarioVendedor = req.params.id;
  console.log('session en lista ventas:', req.session)

  try {
    let pedidosEncontrados = await modeloPedido.find({ idUsuarioVendedor: idUsuarioVendedor })
      .populate('idEmprendimiento')
      .populate('detallePedido.idProducto');

    const tienePermiso = pedidosEncontrados.some(pedido =>
      pedido.idUsuarioVendedor?.toString() === req.session.userId
    );

    if (tienePermiso) {
      res.status(200).json(pedidosEncontrados);
    } else {
      res.status(404).json({ mensaje: "Lista no autorizada" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar pedidos", detalle: error.message });
  }
};

// Consultar/Listar todos los pedidos del usuario comprador
exports.obtenerCompras = async (req, res) => {
  const idUsuarioComprador = req.params.id;
  console.log('session en lista compras:', req.session)
  try {
    let comprasEncontradas = await modeloPedido.find({ idUsuarioComprador: idUsuarioComprador })
      .populate('idEmprendimiento')
      .populate('detallePedido.idProducto');

    // Verificar que el usuario autenticado tenga permiso (sea comprador o vendedor)
    const tienePermiso = comprasEncontradas.some(pedido =>
      pedido.idUsuarioComprador?.toString() === req.session.userId
    );

    if (tienePermiso) {
      res.status(200).json(comprasEncontradas);
    } else {
      res.status(404).json({ mensaje: "Lista no autorizada" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar pedidos", detalle: error.message });
  }
};

// Consultar un pedido por ID 
exports.obtenerPedidosPorId = async (req, res) => {

  const idPedido = req.params.id; // obtener el parámetro de la URL
  try {
    // Validar formato de ID
    if (!validarIdMongoDB(idPedido)) {
      return res.status(400).json({ mensaje: 'ID de pedido inválido' });
    }
    const pedidoEncontrado = await modeloPedido.findById(idPedido)
      .populate('idEmprendimiento')
      .populate('detallePedido.idProducto')
      .populate('mensajes.idUsuarioRemitente');

    if (pedidoEncontrado && (req.session.userId === pedidoEncontrado.idUsuarioComprador.toString() || req.session.userId === pedidoEncontrado.idUsuarioVendedor.toString())) {
      res.status(200).json(pedidoEncontrado);
    } else {
      res.status(404).json({ mensaje: "Pedido no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar pedido", detalle: error.message });
  }
};


// Crear nuevo pedido
exports.crearPedido = async (req, res) => {
  const datosPedido = req.body;

  try {
    const validacion = await validarDatosCreacionPedido(datosPedido);

    if (!validacion.valido) {
      return res.status(400).json({
        error: 'Datos de pedido inválidos',
        errores: validacion.errores
      });
    }

    const nuevoPedido = new modeloPedido(datosPedido);
    const pedidoGuardado = await nuevoPedido.save();

    //Registrar log
    Log.generateLog('pedido.log', `Un pedido ha sido creado: ${pedidoGuardado._id}, fecha: ${new Date()}`);

    res.status(201).json(pedidoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear pedido", detalle: error.message })
  }
};

// Editar un pedido existente
exports.editarPedido = async (req, res) => {
  try {
    // id y body recibidos
    const idPedido = req.params.id;
    const datosPedido = req.body;

    // primero recuperar por id
    const pedidoExistente = await modeloPedido.findById(idPedido).lean();
    const tienePermiso = pedidoExistente.idUsuarioVendedor.toString() === req.session.userId;
    if (!pedidoExistente) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    const validacion = await validarDatosActualizacionPedido(datosPedido, idPedido);

    if (!validacion.valido) {
      return res.status(400).json({
        error: 'Datos de pedido inválidos',
        errores: validacion.errores
      });
    }
    // si ya está marcado como eliminado no permitir edición
    if (pedidoExistente.estadoEliminacion === 'eliminado') {
      return res.status(400).json({ mensaje: 'No se puede editar un pedido eliminado' });
    }

    if (tienePermiso) {
      // realizar la actualización
      const pedidoActualizado = await modeloPedido.findByIdAndUpdate(
        idPedido,
        datosPedido,
        { new: true, runValidators: true }
      );

      pedidoLog = pedidoActualizado.detallePedido

      //Registrar log
      Log.generateLog('pedido.log', `Un pedido ha sido actualizado: ${pedidoActualizado._id},${pedidoLog} fecha: ${new Date()}`);

      return res.json(pedidoActualizado);
    }
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Actualizar direccion de un pedido (Usuario comprador)
exports.actualizarPedido = async (req, res) => {
  try {
    // Buscar el pedido por ID
    const pedido = await modeloPedido.findById(req.params.id);
    const tienePermiso = pedido.idUsuarioComprador.toString() === req.session.userId;

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Verificar si el pedido está cancelado
    if (pedido.estadoPedido === 'cancelado') {
      return res.status(400).json({ mensaje: 'No se puede actualizar un pedido cancelado' });
    }

    // Extraer la nueva dirección del cuerpo de la petición
    const { direccionEnvio } = req.body;

    if (!direccionEnvio) {
      return res.status(400).json({ mensaje: 'Dirección de envío es requerida' });
    }
    if (tienePermiso) {
      // Realizar actualización de la dirección
      const pedidoActualizado = await modeloPedido.findByIdAndUpdate(
        req.params.id,
        { direccionEnvio },
        { new: true }
      );
      //Registrar log
      Log.generateLog('pedido.log', `La direccion del pedido ha sido actualizada: ${pedidoActualizado._id}, fecha: ${new Date()}`);

      return res.json({
        mensaje: 'Dirección del pedido actualizada correctamente',
        pedido: pedidoActualizado
      });
    } else {
      return res.status(404).json({ mensaje: "Direccion de pedido no actualizada, sin permisos." });
    }
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Verificar si un usuario tiene pedido activo para un producto específico
exports.verificarPedidoActivo = async (req, res) => {
  try {
    const { idUsuario, idProducto } = req.params;

    if (!validarIdMongoDB(idUsuario) || !validarIdMongoDB(idProducto)) {
      return res.status(400).json({ mensaje: 'IDs inválidos' });
    }

    const tienePedidoActivo = await verificarPedidoActivoExistente(idUsuario, idProducto);

    res.json({
      tienePedidoActivo,
      mensaje: tienePedidoActivo ? 'Usuario tiene pedido activo para este producto' : 'No hay pedido activo'
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Cancelar un pedido (Usuario comprador)
exports.cancelarPedido = async (req, res) => {
  try {
    // Buscar el pedido por ID
    const pedido = await modeloPedido.findById(req.params.id);
    const tienePermiso = (pedido.idUsuarioComprador.toString() === req.session.userId) ||  (pedido.idUsuarioVendedor.toString() === req.session.userId);

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Verificar si el pedido ya está eliminado
    if (pedido.estado === 'cancelado') {
      return res.status(400).json({ mensaje: 'El pedido ya está cancelado' });
    }

    // Regla de negocio: No cancelar pedido si su estado es completado
    if (pedido.estadoPedido === 'completado') {
      return res.status(400).json({
        mensaje: 'No se puede cancelar un pedido con estado completado. Estado actual: ' + pedido.estadoPedido
      });
    }
    if (tienePermiso) {
    // Realizar eliminación lógica
    const pedidoCancelado = await modeloPedido.findByIdAndUpdate(
      req.params.id,
      { estadoPedido: 'cancelado' },
      { new: true }
    );

    //Registrar log
    Log.generateLog('pedido.log', `Un pedido ha sido cancelado: ${pedidoCancelado.detallePedido}, fecha: ${new Date()}`);

    return res.json({
      mensaje: 'Pedido cancelado correctamente',
      pedido: pedidoCancelado
    });
    }
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar lógicamente un pedido (solo si no está activo)
exports.eliminarPedido = async (req, res) => {
  try {
    // Buscar el pedido por ID
    const pedido = await modeloPedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Verificar si el pedido ya está eliminado
    if (pedido.estadoEliminacion === true) {
      return res.status(400).json({ mensaje: 'El pedido ya está eliminado' });
    }

    // Regla de negocio: No eliminar si hay compra activa
    if (pedido.estadoPedido === 'aceptado' || pedido.estadoPedido === 'pendiente') {
      return res.status(400).json({
        mensaje: 'No se puede eliminar un pedido con compra activa. Estado actual: ' + pedido.estadoPedido
      });
    }

    // Realizar eliminación lógica
    const pedidoEliminado = await modeloPedido.findByIdAndUpdate(
      req.params.id,
      { estadoEliminacion: true },
      { new: true }
    );

    //Registrar log
    Log.generateLog('pedido.log', `Un pedido ha sido eliminado: ${pedidoEliminado}, fecha: ${new Date()}`);

    res.json({
      mensaje: 'Pedido eliminado correctamente',
      pedido: pedidoEliminado
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};