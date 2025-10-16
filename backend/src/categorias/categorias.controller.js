/**
 * @file Controlador de categorías
 * @description Contiene la lógica para listar, crear, actualizar y eliminar categorías.
 * Los comentarios son sencillos y en español para estudiantes.
 */
// Se importa el modelo de categorías
const modeloCategoria = require("./categorias.model");
const uploadImage = require('../servicios/subirImagen')
const Log = require('../middlewares/logs')
const cookie = require('cookie');

/**
 * Obtiene todas las categorías y las almacena en una cookie para uso frontend.
 * @param {Object} req - Request de Express.
 * @param {Object} res - Response de Express.
 */
exports.obtenerCategorias = async (req, res) => {
  try {
    const categoriasEncontradas = await modeloCategoria.find();
    const nombresCategorias = categoriasEncontradas.map(cat => ({nombreCategoria : cat.nombreCategoria, id: cat._id}));
    res.cookie('categorias', JSON.stringify(nombresCategorias), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // necesario si front y back en dominios distintos
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
    if (categoriasEncontradas && categoriasEncontradas.length > 0) {
      res.status(200).json(categoriasEncontradas); // <-- Respuesta en formato JSON
    } else {
      res.status(404).json({ mensaje: "No se encontraron categorías" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar categorías", detalle: error.message });
  }
};

/**
 * Obtiene una categoría por su ID.
 * @param {Object} req - Request con params.id.
 * @param {Object} res - Response que devuelve la categoría o error.
 */
exports.obtenerCategoriaPorId = async (req, res) => {
  const idCategoria = req.params.id;   // obtener el parámetro de la URL

  try {
    const categoriaEncontrada = await modeloCategoria.findById(idCategoria);

    if (categoriaEncontrada) {
      res.status(200).json(categoriaEncontrada);
    } else {
      res.status(404).json({ mensaje: "Categoría no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar categoría", detalle: error.message });
  }
};

/**
 * Crea una nueva categoría. Si se recibe un archivo, lo sube y guarda la URL.
 * @param {Object} req - Request con body y posible archivo en req.file.
 * @param {Object} res - Response que devuelve la categoría creada o error.
 */
exports.crearCategoria = async (req, res) => {
  const datosCategoria = req.body;
  try {
    if (req.file) {
      datosCategoria.imagen = await uploadImage(req.file, "categorias");
    }

    const nuevaCategoria = new modeloCategoria(datosCategoria);
    const categoriaGuardada = await nuevaCategoria.save();

    //Registrar log
    Log.generateLog('categoria.log', `Una categoría ha sido creada: ${categoriaGuardada}, fecha: ${new Date()}`);

    res.status(201).json(categoriaGuardada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear categoría", detalle: error.message });
  }
};

/**
 * Actualiza una categoría por su ID. Permite reemplazar imagen si se sube archivo.
 * @param {Object} req - Request con params.id y body con datos a actualizar.
 * @param {Object} res - Response con la categoría actualizada o error.
 */
exports.actualizarCategoria = async (req, res) => {
  const idCategoria = req.params.id;
  const datosCategoria = req.body;

  try {
    if (req.file) {
      datosCategoria.imagen = await uploadImage(req.file, "categorias");
    }

    const categoriaActualizada = await modeloCategoria.findByIdAndUpdate(
      idCategoria,
      datosCategoria,
      { new: true }
    );

    //Registrar log
    Log.generateLog('categoria.log', `Una categoría ha sido actualizada: ${categoriaActualizada}, fecha: ${new Date()}`);

    if (!categoriaActualizada) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    res.status(200).json(categoriaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar categoría", detalle: error.message });
  }
};

/**
 * Marca una categoría como inactiva en vez de eliminarla físicamente.
 * @param {Object} req - Request con params.id.
 * @param {Object} res - Response con resultado de la operación.
 */
exports.eliminarCategoria = async (req, res) => {
  try {
    const categoriaEliminada = await modeloCategoria.findByIdAndUpdate(
      req.params.id,
      { categoriaActiva: false },
      { new: true }
    );

    //Registrar log
    Log.generateLog('categoria.log', `Una categoría ha sido eliminada: ${categoriaEliminada}, fecha: ${new Date()}`);

    if (!categoriaEliminada) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json({ mensaje: 'Categoría deshabilitada correctamente', categoria: categoriaEliminada });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};



