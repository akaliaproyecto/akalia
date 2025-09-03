// Importar el modelo de productos
const modeloProducto = require("./productos.model");
const uploadImage = require('../servicios/subirImagen');
const mongoose = require('mongoose'); // Para validar/convertir ObjectId


/*Consultar todos los productos*/
exports.obtenerProductos = async (req, res) => {
  try {
    // Solo mostramos productos que NO están eliminados lógicamente
    // (aquí se filtra por estadoProducto: 'activo' tal y como estaba)
    const productosEncontrados = await modeloProducto.find({ estadoProducto: 'activo' });

    if (productosEncontrados && productosEncontrados.length > 0) {
      return res.status(200).json(productosEncontrados);
    } else {
      return res.status(404).json({ mensaje: "No se encontraron productos" });
    }
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al consultar productos", detalle: error.message });
  }
};

/*Consultar un producto por su id*/
exports.obtenerProductoPorId = async (req, res) => {
  const idProducto = req.params.id;

  try {
    // Solo buscamos productos que NO están eliminados lógicamente
    const productoEncontrado = await modeloProducto.findOne({
      _id: idProducto,
      estadoProducto: 'activo'
    });

    if (productoEncontrado) {
      res.status(200).json(productoEncontrado);
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar producto", detalle: error.message });
  }
};

/*Consultar un producto por su nombre*/
exports.obtenerProductoPorNombre = async (req, res) => {
  const nombreProducto = req.params.nombre;

  const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  try {
    const regex = new RegExp(escapeRegex(nombreProducto), 'i'); // 'i': case-insensitive

    // Usamos find para devolver todos los productos que contengan la palabra
    const productosEncontrados = await modeloProducto.find({
      tituloProducto: { $regex: regex },
      estadoProducto: 'activo'
    });

    if (productosEncontrados && productosEncontrados.length > 0) {
      res.status(200).json(productosEncontrados);
    } else {
      res.status(404).json({ mensaje: "No se encontraron productos con ese nombre/parcial" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar producto", detalle: error.message });
  }
};

/*Crear un nuevo producto*/
exports.crearProducto = async (req, res) => {
  // datos enviados por el cliente (formulario)
  const datosProducto = req.body;

  try {
    // Guardamos URLs de las imágenes subidas (si hay)
    let imagenes = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file, "productos");
        imagenes.push(url);
      }
    }

    // Construimos el documento con los datos y las URLs de imagen
    const nuevoProducto = new modeloProducto({ ...datosProducto, imagenes });
    const productoGuardado = await nuevoProducto.save();

    return res.status(201).json(productoGuardado);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al crear producto", detalle: error.message });
  }
};

/*editar un producto por su id*/
exports.actualizarProducto = async (req, res) => {

  const idProducto = req.params.idProducto || req.params.id;  // leer el id desde la URL 
  const datosProducto = req.body; // datos que llegan con el request

  try {

    let imagenes = [];
    //Si hay nuevas imagenes en la request
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file, "productos");
        imagenes.push(url);
      }
      datosProducto.imagenes = imagenes; // reemplazar completamente
    }
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

/*Borrado lógico de un producto por su id*/
exports.eliminarProducto = async (req, res) => {
  const idProducto = req.params.id;
  try {
    // En lugar de eliminar físicamente, marcamos el producto como 'eliminado'
    const productoActualizado = await modeloProducto.findByIdAndUpdate(
      idProducto,
      { estadoProducto: 'eliminado' },
      { new: true }
    );

    if (productoActualizado) {
      res.status(200).json({
        mensaje: "Producto eliminado lógicamente y desactivado",
        producto: productoActualizado
      });
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar producto", detalle: error.message });
  }
};

/* obtener Productos por Emprendimiento */
exports.obtenerProductosEmprendimiento = async (req, res) => {
  const idEmprendimiento = req.params.idEmprendimiento || req.params.id;
  if (!idEmprendimiento) return res.status(400).json({ mensaje: 'Se requiere idEmprendimiento' });

  try {
    const isOid = mongoose.Types.ObjectId.isValid(idEmprendimiento);
    const oid = isOid ? new mongoose.Types.ObjectId(idEmprendimiento) : null;
    const filtro = isOid
      ? { estadoProducto: 'activo', $or: [{ idEmprendimiento: oid }, { idEmprendimiento: idEmprendimiento }] }
      : { estadoProducto: 'activo', idEmprendimiento: idEmprendimiento };

    const native = modeloProducto.collection;
    const [totalDocs, resultadosPorString, resultadosPorObjectId, productosDelEmprendimiento] =
      await Promise.all([
        modeloProducto.countDocuments(),
        native.find({ idEmprendimiento: idEmprendimiento }).toArray(),
        isOid ? native.find({ idEmprendimiento: oid }).toArray() : Promise.resolve([]),
        native.find(filtro).toArray()
      ]);

    return res.status(200).json(productosDelEmprendimiento);
  } catch (error) {
    console.error('Error al obtener productos por emprendimiento:', error);
    return res.status(500).json({ mensaje: 'Error al obtener productos del emprendimiento', detalle: error.message });
  }
};
