// Se importa el modelo de categorías
const modeloCategoria = require("./categorias.model");
const uploadImage = require('../servicios/subirImagen')
const Log = require('../middlewares/logs')

//Listar todas las categorías
// Esta función responde con un arreglo JSON de todas las categorías almacenadas en MongoDB
exports.obtenerCategorias = async (req, res) => {
  try {
    const categoriasEncontradas = await modeloCategoria.find();

    if (categoriasEncontradas && categoriasEncontradas.length > 0) {
      res.status(200).json(categoriasEncontradas); // <-- Respuesta en formato JSON
    } else {
      res.status(404).json({ mensaje: "No se encontraron categorías" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar categorías", detalle: error.message });
  }
};

//Listar una categoría por su id
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

//Crear una nueva categoría
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

//editar una categoría por su id
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

//eliminar una categoría por su id
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



