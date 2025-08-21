const modeloComision = require('./comision.model');

// Obtener todas las comisiones activas
const obtenerComisiones = async (req, res) => {
  try {
    const comisiones = await modeloComision.find()
      .populate('idUsuario')
      .populate('detalles.idPedido');
    res.status(200).json(comisiones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener comisiones', error: error.message });
  }
};

// Obtener comisión por ID
const obtenerComisionPorId = async (req, res) => {
  try {
    const comision = await modeloComision.findOne({ _id: req.params.id, activo: true })
      .populate('idUsuario') //populate para obtener los detalles del usuario y llenar el campo
      .populate('detalles.idPedido');

    if (!comision) {
      return res.status(404).json({ mensaje: 'Comisión no encontrada' });
    }
    res.status(200).json(comision);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la comisión', error: error.message });
  }
};

const insertarComision = async (req, res) => {
  try {
    const nuevaComision = new modeloComision(req.body);
    const comisionGuardada = await nuevaComision.save();
    res.status(200).json(comisionGuardada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la comisión', error: error.message });
  }
};


const actualizarComision = async (req, res) => {
  try {
    const comision = await modeloComision.findOneAndUpdate(
      { _id: req.params.id, activo: true },
      req.body,
      { new: true }
    );

    if (!comision) {
      return res.status(404).json({ mensaje: 'Comisión no encontrada para actualizar' });
    }
    res.status(200).json(comision);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la comisión', error: error.message });
  }
};

const deshabilitarComision = async (req, res) => {
  try {
    const comision = await modeloComision.findOneAndUpdate(
      { _id: req.params.id, activo: true }, // Buscar comisión activa
      { activo: false }, // Cambiar el campo activo a false
      { new: true } // Retorna el documento actualizado
    );

    if (!comision) {
      return res.status(404).json({ mensaje: 'Comisión no encontrada para deshabilitar' });
    }
    res.status(200).json({ mensaje: 'Comisión deshabilitada con éxito', comision });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al deshabilitar la comisión', error: error.message });
  }
};

module.exports = {
  obtenerComisiones,
  obtenerComisionPorId,
  insertarComision,
  actualizarComision,
  deshabilitarComision
};