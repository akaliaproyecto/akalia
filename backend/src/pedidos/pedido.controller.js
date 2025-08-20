//Importar el modelo de pedido
const modeloPedido = require("./order.model");


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
    res.status(201).json(pedidoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear pedido", detalle: error.message })
  }
};


//Editar un pedido por su id
exports.editarPedido = async (req, res) => {
  const idPedido = req.params.id;
  const datosPedido = req.body;

  try {
    const pedidoActualizado = await modeloPedido.findByIdAndUpdate(
      idPedido,
      datosPedido,
      { new: true, runValidators: true }
    );

    if (pedidoActualizado) {
      res.status(200).json(pedidoActualizado);
    } else {
      res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el pedido", detalle: error.message });
  }
};


//Eliminar pedido por id
exports.eliminarPedido = async (req, res) => {
  const idPedido = req.params.id;

  try {
    const pedidoEliminado = await modeloPedido.findByIdAndDelete(idPedido);

    if (pedidoEliminado) {
      res.status(200).json({ mensaje: "Pedido eliminado correctamente" })
    } else {
      res.status(404).json({ mensaje: "Pedido no encontrado" })
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al elimianr pedido", detalle: error.message })
  }
};