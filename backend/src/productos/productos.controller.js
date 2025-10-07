/* IMPORTANTE: AL HABER CAMBIADO EL SCHEMA, estadoProducto NO ES VÁLIDO, POR ENDE, DEBE SER ELIMINADO EN UNA ETAPA MAS ADELANTADA DE DESARROLLO */

// Importar el modelo de productos
const modeloProducto = require("./productos.model");
const uploadImage = require('../servicios/subirImagen');
const mongoose = require('mongoose');
const Log = require('../middlewares/logs');
const {
  validarIdMongoDB,
  productoExistePorId,
  validarDatosCreacionProducto,
  validarDatosActualizacionProducto
} = require('./productos.validations');

/*Consultar todos los productos*/
exports.obtenerProductos = async (req, res) => {
  try {
    const productosEncontrados = await modeloProducto.find({
      $or: [
        { estadoProducto: 'activo' },
        { productoActivo: true, productoEliminado: false }
      ]
    });

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
  let idProducto = req.params.id;

  try {
    // Validar formato de id antes de consultar
    if (!validarIdMongoDB(idProducto)) {
      return res.status(400).json({ mensaje: 'Id de producto inválido' });
    }

    // Buscamos el producto por id y aceptamos ambos esquemas de estado
    const productoEncontrado = await modeloProducto.findOne({
      _id: idProducto,
       productoEliminado: false 
      }).populate('idEmprendimiento');
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
      $or: [
        { estadoProducto: 'activo' },
        { productoActivo: true, productoEliminado: false }
      ]
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

    //Registrar log
    Log.generateLog('producto.log', `Un producto ha sido creado: ${productoGuardado._id}, información: ${productoGuardado}  fecha: ${new Date()}`);

    return res.status(201).json(productoGuardado);
  } catch (error) {
    // Sanitizar y loggear el error completo (truncando HTML si apareciera)
    try {
      const raw = String(error && error.message ? error.message : error);
      const isHtml = raw.trim().toLowerCase().startsWith('<!doctype') || raw.trim().toLowerCase().startsWith('<html');
      const safe = isHtml ? (raw.slice(0, 200) + '... [HTML truncated]') : raw;
      console.error('Error en crearProducto:', safe);
      if (error && error.stack) console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    } catch (logErr) {
      console.error('Error al loggear el error en crearProducto:', error && error.message ? error.message : error);
    }

    return res.status(500).json({ mensaje: "Error al crear producto", detalle: error.message });
  }
};

/*editar un producto por su id*/
exports.actualizarProducto = async (req, res) => {
  let idProducto = req.params.idProducto || req.params.id;  // leer el id desde la URL 
  const datosProducto = req.body; // datos que llegan con el request
  console.log('AAAA')
  console.log(datosProducto)
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
    // Validar id antes de actualizar
    if (!mongoose.isValidObjectId(idProducto)) {
      return res.status(400).json({ mensaje: 'Id de producto inválido' });
    }

    // actualizar y devolver el documento actualizado (new:true)
    const productoActualizado = await modeloProducto.findByIdAndUpdate(idProducto, datosProducto, { new: true });

    //Registrar log
    Log.generateLog('producto.log', `Un producto ha sido actualizado: ${productoActualizado}, fecha: ${new Date()}`);

    if (productoActualizado) {
      res.status(200).json(productoActualizado);
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    try {
      const raw = String(error && error.message ? error.message : error);
      const isHtml = raw.trim().toLowerCase().startsWith('<!doctype') || raw.trim().toLowerCase().startsWith('<html');
      const safe = isHtml ? (raw.slice(0, 200) + '... [HTML truncated]') : raw;
      console.error('Error en actualizarProducto:', safe);
      if (error && error.stack) console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    } catch (logErr) {
      console.error('Error al loggear el error en actualizarProducto:', error && error.message ? error.message : error);
    }

    res.status(500).json({ mensaje: "Error al actualizar producto", detalle: error.message });
  }
};

/*Borrado lógico de un producto por su id*/
exports.eliminarProducto = async (req, res) => {
  let idProducto = req.params.id;
  try {
    if (!mongoose.isValidObjectId(idProducto)) {
      return res.status(400).json({ mensaje: 'Id de producto inválido' });
    }
    // En lugar de eliminar físicamente, marcamos el producto como 'eliminado'.
    // Actualizamos ambos formatos: añadimos/actualizamos `estadoProducto` y
    // también `productoActivo`/`productoEliminado` para contemplar ambos esquemas.
    const productoActualizado = await modeloProducto.findByIdAndUpdate(
      idProducto,
      {
        estadoProducto: 'eliminado',
        productoActivo: false,
        productoEliminado: true
      },
      { new: true }
    );

    if (productoActualizado) {
      //Registrar log solo si existe el producto actualizado
      Log.generateLog('producto.log', `Un producto ha sido eliminado: ${productoActualizado._id}, fecha: ${new Date()}`);

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
  try {
    if (!idEmprendimiento || !mongoose.isValidObjectId(idEmprendimiento)) {
      return res.status(400).json({ mensaje: 'Id de emprendimiento inválido' });
    }

    const productosDelEmprendimiento = await modeloProducto.find({
      idEmprendimiento: idEmprendimiento,
    });

    return res.status(200).json(productosDelEmprendimiento);
  } catch (error) {
    console.error('Error al obtener productos por emprendimiento:', error);
    return res.status(500).json({ mensaje: 'Error al obtener productos del emprendimiento', detalle: error.message });
  }
};

/* Obtener productos por usuario (todos los productos de los emprendimientos del usuario) */
exports.obtenerProductosPorUsuario = async (req, res) => {
  const idUsuario = req.params.id;
  try {
    // Validar idUsuario si es necesario
    // Importamos modelo de emprendimiento dinámicamente para evitar ciclos
    const ModeloEmpr = require('../emprendimientos/emprendimiento.model');
    const mongoose = require('mongoose');

    // Obtener emprendimientos del usuario
    const emprendimientosUsuario = await ModeloEmpr.find({ usuario: new mongoose.Types.ObjectId(idUsuario), emprendimientoEliminado: false });
    const listaIdsEmpr = emprendimientosUsuario.map(e => e._id ? String(e._id) : null).filter(Boolean);

    if (listaIdsEmpr.length === 0) {
      return res.status(200).json([]); // el usuario no tiene emprendimientos
    }

    // Buscar productos cuyos idEmprendimiento estén en la lista
    const productosUsuario = await modeloProducto.find({
      idEmprendimiento: { $in: listaIdsEmpr },
       productoEliminado: false
    });

    return res.status(200).json(productosUsuario);
  } catch (error) {
    console.error('Error al obtener productos por usuario:', error);
    return res.status(500).json({ mensaje: 'Error al obtener productos por usuario', detalle: error.message });
  }
};

/*Obtener productos de una categoría específica*/
exports.obtenerProductosPorCategoria = async (req, res) => {
  const idCategoria = req.params.idCategoria || req.params.id;
  try {
    if (!idCategoria) {
      return res.status(400).json({ mensaje: 'Id o nombre de categoría requerido' });
    }

    // El campo `categoria` en Producto es un string con el nombre de la categoría.
    // Si el parámetro es un ObjectId válido, intentamos buscar la categoría por id
    // y usar su nombre; si no es un ObjectId, lo tratamos como nombre directamente.
    let nombreCategoria = idCategoria;

    if (mongoose.isValidObjectId(idCategoria)) {
      const ModeloCategoria = require('../categorias/categorias.model');
      const categoriaEncontrada = await ModeloCategoria.findById(idCategoria).lean();
      if (!categoriaEncontrada) {
        return res.status(404).json({ mensaje: 'Categoría no encontrada' });
      }
      nombreCategoria = categoriaEncontrada.nombreCategoria;
    }

    // Buscar productos cuyo campo `categoria` coincida (case-insensitive)
    const regex = new RegExp('^' + nombreCategoria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');

    const productosEncontrados = await modeloProducto.find({
      categoria: { $regex: regex },
      $or: [ { productoActivo: true, productoEliminado: false }, { estadoProducto: 'activo' } ]
    });

    return res.status(200).json(productosEncontrados);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al consultar productos por categoría", detalle: error.message });
  } 
};  

/* Filtrar productos */
exports.filtrarProductos = async (req, res) => {
  try {
    // // query: es el objeto con los filtros de búsqueda y options: es el objeto con opciones de consulta
    const { query = {}, options = {} } = req.body || {};

    // Construir la consulta a partir del query recibido
    let consulta = modeloProducto.find(query);

    // Aplicar ordenamiento si viene en options
    if (options.sort && typeof options.sort === 'object') {
      consulta = consulta.sort(options.sort);
    }

    // Aplicar límite si se especifica
    if (options.limit) {
      const limite = parseInt(options.limit) || undefined;
      if (limite) consulta = consulta.limit(limite);
    }

    // Ejecutar consulta y devolver resultados
    const resultados = await consulta.exec();
    return res.status(200).json(resultados);
  } catch (error) {
    console.error('Error en filtrarProductos:', error && error.message ? error.message : error);
    return res.status(500).json({ mensaje: 'Error al filtrar productos', detalle: error.message });
  }
};

