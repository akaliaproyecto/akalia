// Importar el modelo de productos
const modeloProducto = require("./product.model");

//Consultar todos los productos
exports.obtenerProductos = async (req, res) => {
  try {
    let productosEncontrados = await modeloProducto.find();

    if (productosEncontrados && productosEncontrados.length > 0) {
      res.status(200).json(productosEncontrados);
    } else {
      res.status(404).json({ mensaje: "No se encontraron productos" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar productos", detalle: error.message });
  }
};

//Consultar un producto por su id
exports.obtenerProductoPorId = async (req, res) => {
  const idProducto = req.params.id;   // obtener el parámetro de la URL

  try {
    const productoEncontrado = await modeloProducto.findById(idProducto);

    if (productoEncontrado) {
      res.status(200).json(productoEncontrado);
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar producto", detalle: error.message });
  }
};

//Crear un nuevo producto
exports.crearProducto = async (req, res) => {
  const datosProducto = req.body; // datos enviados por el cliente

  try {
    const nuevoProducto = new modeloProducto(datosProducto);
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear producto", detalle: error.message });
  }
};

//editar un producto por su id
exports.actualizarProducto = async (req, res) => {

  const idProducto = req.params.idProducto || req.params.id;  // leer el id desde la URL 
  const datosProducto = req.body; // datos que llegan con el request

  try {
    // actualizar y devolver el documento actualizado (new:true)
    const productoActualizado = await modeloProducto.findByIdAndUpdate(idProducto, datosProducto, { new: true });
    if (productoActualizado) {
      res.status(200).json(productoActualizado);
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar producto", detalle: error.message });
  }
};

//eliminar un producto por su id
exports.eliminarProducto = async (req, res) => {
  const idProducto = req.params.id;
  try {
    const productoEliminado = await modeloProducto.findByIdAndDelete(idProducto);
    if (productoEliminado) {
      res.status(200).json({ mensaje: "Producto eliminado correctamente" });
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar producto", detalle: error.message });
  }
};

