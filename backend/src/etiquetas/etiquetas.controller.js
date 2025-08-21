// Se importa el modelo de etiquetas
const modeloEtiquetas = require("./etiquetas.model");

//Listar todas las etiquetas
exports.obtenerEtiquetas = async (req, res) => {
  try {
    const etiquetasEncontradas = await modeloEtiquetas.find();

    if (etiquetasEncontradas && etiquetasEncontradas.length > 0) {
      res.status(200).json(etiquetasEncontradas);
    } else {
      res.status(404).json({ mensaje: "No se encontraron etiquetas" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar etiquetas", detalle: error.message });
  }
};

//Listar una etiquetas por su id
exports.obtenerEtiquetaPorId = async (req, res) => {
  const idEtiqueta = req.params.id;   // obtener el parámetro de la URL

  try {
    const etiquetaEncontrada = await modeloEtiquetas.findById(idEtiqueta);

    if (etiquetaEncontrada) {
      res.status(200).json(etiquetaEncontrada);
    } else {
      res.status(404).json({ mensaje: "Etiqueta no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar etiqueta", detalle: error.message });
  }
};

//Crear una nueva etiquetas
exports.crearEtiqueta = async (req, res) => {
  const datosEtiqueta = req.body;
  try {
    const nuevaEtiqueta = new modeloEtiquetas(datosEtiqueta);
    const etiquetaGuardada = await nuevaEtiqueta.save();
    res.status(201).json(etiquetaGuardada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear etiqueta", detalle: error.message });
  }
};

//editar una etiquetas por su id
exports.actualizarEtiqueta = async (req, res) => {
  const idEtiqueta = req.params.id;
  const datosEtiqueta = req.body;

  try {
    
    const etiquetasActualizada = await modeloEtiquetas.findByIdAndUpdate(
      idEtiqueta,
      datosEtiqueta,
      { new: true }
    );

    if (!etiquetasActualizada) {
      return res.status(404).json({ mensaje: "Etiqueta no encontrada" });
    }

    res.status(200).json(etiquetasActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar etiquetas", detalle: error.message });
  }
};

//eliminar una etiquetas por su id
exports.eliminarEtiqueta = async (req, res) => {
  try {
    const etiquetasEliminada = await modeloEtiquetas.findByIdAndUpdate(
      req.params.id,
      { etiquetaActiva: false },
      { new: true }
    );
    if (!etiquetasEliminada) {
      return res.status(404).json({ mensaje: 'Etiqueta no encontrada' });
    }
    res.json({ mensaje: 'Etiqueta deshabilitada correctamente', etiqueta: etiquetasEliminada });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};



