//Importar el modelo de pedido
const modeloPedido = require("./pedidos.model");
const Log = require('../middlewares/logs')

//Consultar todos los pedidos (panel admin)
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


//Consultar un pedido por ID
exports.obtenerPedidosPorId = async (req, res) => {
  const idPedido = req.params.id; // obtener el parámetro de la URL

  try {
    const pedidoEncontrado = await modeloPedido.findById(idPedido);

    if (pedidoEncontrado) {
      res.status(200).json(pedidoEncontrado);
    } else {
      res.status(404).json({ mensaje: "Pedido no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar pedido", detalle: error.message });
  }
};


//Crear nuevo pedido
exports.crearPedido = async (req, res) => {
  const datosPedido = req.body;

  try {
    const nuevoPedido = new modeloPedido(datosPedido);
    const pedidoGuardado = await nuevoPedido.save();

    //Registrar log
    Log.generateLog('pedido.log', `Un pedido ha sido creado: ${pedidoGuardado}, fecha: ${new Date()}`);

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
    if (!pedidoExistente) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // si ya está marcado como eliminado no permitir edición
    if (pedidoExistente.estadoEliminacion === 'eliminado') {
      return res.status(400).json({ mensaje: 'No se puede editar un pedido eliminado' });
    }

    // realizar la actualización
    const pedidoActualizado = await modeloPedido.findByIdAndUpdate(
      idPedido,
      datosPedido,
      { new: true, runValidators: true }
    );

    //Registrar log
    Log.generateLog('pedido.log', `Un pedido ha sido actualizado: ${pedidoActualizado}, fecha: ${new Date()}`);

    res.json(pedidoActualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
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
    if (pedido.estadoEliminacion === 'eliminado') {
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
      { estadoEliminacion: 'eliminado' },
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