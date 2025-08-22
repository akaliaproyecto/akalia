const modeloEmprendimiento = require('./emprendimiento.model');

//listar emprendimientos
const obtenerEmprendimientos = async (req, res) => {
  try {
    const emprendimientos = await modeloEmprendimiento.find();

    if (emprendimientos && emprendimientos.length > 0) {
      res.status(200).json(emprendimientos); 
    } else {
      res.status(404).json({ mensaje: "No se encontraron emprendimientos" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error en la base de datos", detalle: error.message });
  }
};

// listar un emprendimiento por ID
const obtenerEmprendimientoPorId = async (req, res) => {
  try {
    const emprendimiento = await modeloEmprendimiento.findById(req.params.id);

    if (emprendimiento) {
      res.status(200).json(emprendimiento); 
    } else {
      res.status(404).json({ mensaje: "Emprendimiento no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error en la base de datos", detalle: error.message });
  }
};

// listar emprendimientos por ID de usuario
const obtenerEmprendimientoPorIdUsuario = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const emprendimientos = await modeloEmprendimiento.find({ idPersona: idUsuario });

    if (emprendimientos && emprendimientos.length > 0) {
      res.status(200).json(emprendimientos); 
    } else {
      res.status(404).json({ mensaje: "No se encontraron emprendimientos para este usuario" });
    }
  } catch (error) {
    console.log("Error al consultar emprendimientos por usuario:", error);
    res.status(500).json({ mensaje: "Error en la base de datos", detalle: error.message });
  }
};

// crear un nuevo emprendimiento
const crearEmprendimiento = async (req, res) => {
  try {
    const { idPersona, nombreEmprendimiento, descripcionNegocio, fechaRegistro, ubicacionEmprendimiento } = req.body;

    let imagenLogo = null;
    if (req.file) {
      imagenLogo = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    const nuevo = new modeloEmprendimiento({
      idPersona,
      nombreEmprendimiento,
      descripcionNegocio,
      fechaRegistro: fechaRegistro || Date.now(),
      imagenLogo,
      estadoEmprendimiento: 'activo',
      ubicacionEmprendimiento 
    });
    await nuevo.save();

    res.status(201).json({ mensaje: "Emprendimiento creado correctamente", nuevo }); 
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear el emprendimiento", detalle: error.message });
  }
};

// actualizar un emprendimiento
const actualizarEmprendimiento = async (req, res) => {
  try {
    const datosActualizados = {
      nombreEmprendimiento: req.body.nombreEmprendimiento,
      descripcionNegocio: req.body.descripcionNegocio,
      categoria: req.body.categoria,
      fechaRegistro: req.body.fechaRegistro,
    };

    const actualizacion = await modeloEmprendimiento.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true }
    );

    if (actualizacion) {
      res.status(200).json({ mensaje: "Emprendimiento actualizado correctamente", actualizacion }); 
      res.status(404).json({ mensaje: "Emprendimiento no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el emprendimiento", detalle: error.message });
  }
};

// deshabilitar un emprendimiento
const deshabilitarEmprendimiento = async (req, res) => {
  try {
    const emprendimiento = await modeloEmprendimiento.findByIdAndUpdate(
      req.params.id,
      { estadoEmprendimiento: 'inactivo' }, // Cambia el estado a inactivo
      { new: true }
    );

    if (emprendimiento) {
      res.status(200).json({ mensaje: "Emprendimiento deshabilitado correctamente", emprendimiento }); 
    } else {
      res.status(404).json({ mensaje: "Emprendimiento no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al deshabilitar emprendimiento", detalle: error.message });
  }
};

module.exports = {
  obtenerEmprendimientos,
  obtenerEmprendimientoPorId,
  obtenerEmprendimientoPorIdUsuario,
  crearEmprendimiento,
  actualizarEmprendimiento,
  deshabilitarEmprendimiento
};