// Se importa el modelo de etiquetas
const modeloEtiquetas = require("./etiquetas.model");
const Log = require('../middlewares/logs')

/**
 * Obtener todas las etiquetas
 * - Responde con un array de etiquetas si se encuentran, o 404 si no hay resultados.
 * @param {import('express').Request} req - Objeto de petición
 * @param {import('express').Response} res - Objeto de respuesta
 */
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

/**
 * Obtener una etiqueta por su ID
 * - Busca la etiqueta por su identificador y responde 200 con el documento o 404 si no existe.
 * @param {import('express').Request} req - req.params.id contiene el ID de la etiqueta
 * @param {import('express').Response} res
 */
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

/**
 * Crear una nueva etiqueta
 * - Lee los datos desde req.body, crea el documento y devuelve 201 con la etiqueta creada.
 * @param {import('express').Request} req - req.body con los datos de la etiqueta
 * @param {import('express').Response} res
 */
//Crear una nueva etiquetas
exports.crearEtiqueta = async (req, res) => {
  const datosEtiqueta = req.body;
  try {
    const nuevaEtiqueta = new modeloEtiquetas(datosEtiqueta);
    const etiquetaGuardada = await nuevaEtiqueta.save();

    //Registrar log
    Log.generateLog('etiqueta.log', `Una etiqueta ha sido creada: ${etiquetaGuardada}, fecha: ${new Date()}`);

    res.status(201).json(etiquetaGuardada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear etiqueta", detalle: error.message });
  }
};

/**
 * Actualizar una etiqueta por su ID
 * - Actualiza los campos recibidos en req.body y devuelve el documento actualizado.
 * @param {import('express').Request} req - req.params.id e req.body con los cambios
 * @param {import('express').Response} res
 */
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

    //Registrar log
    Log.generateLog('etiqueta.log', `Una etiqueta ha sido actualizada: ${etiquetasActualizada}, fecha: ${new Date()}`);

    if (!etiquetasActualizada) {
      return res.status(404).json({ mensaje: "Etiqueta no encontrada" });
    }

    res.status(200).json(etiquetasActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar etiquetas", detalle: error.message });
  }
};

/**
 * Eliminar (deshabilitar) una etiqueta por su ID
 * - Marca la etiqueta como inactiva y devuelve el documento actualizado.
 * @param {import('express').Request} req - req.params.id
 * @param {import('express').Response} res
 */
//eliminar una etiquetas por su id
exports.eliminarEtiqueta = async (req, res) => {
  try {
    const etiquetasEliminada = await modeloEtiquetas.findByIdAndUpdate(
      req.params.id,
      { etiquetaActiva: false },
      { new: true }
    );

    //Registrar log
    Log.generateLog('etiqueta.log', `Una etiqueta ha sido eliminada: ${etiquetasEliminada}, fecha: ${new Date()}`);

    if (!etiquetasEliminada) {
      return res.status(404).json({ mensaje: 'Etiqueta no encontrada' });
    }
    res.json({ mensaje: 'Etiqueta deshabilitada correctamente', etiqueta: etiquetasEliminada });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};



