const modeloEmprendimiento = require('./emprendimiento.model');
const uploadImage = require('../servicios/subirImagen')
const mongoose = require('mongoose');

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
  const idEmprendimiento = req.params.id;   // obtener el parámetro de la URL
  try {
    const emprendimiento = await modeloEmprendimiento.findById(idEmprendimiento);

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
  const idUsuario = req.params.id;
  console.log(idUsuario)
  try {
    const emprendimientos = await modeloEmprendimiento.find({ usuario: new mongoose.Types.ObjectId(idUsuario) });

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
    // obtenemos ciudad/departamento intentando los nombres más comunes que puede enviar el formulario
    const ciudad = req.body['ubicacionEmprendimiento.ciudad'] || req.body['ubicacionEmprendimiento[ciudad]'] || (req.body.ubicacionEmprendimiento && req.body.ubicacionEmprendimiento.ciudad) || '';
    const departamento = req.body['ubicacionEmprendimiento.departamento'] || req.body['ubicacionEmprendimiento[departamento]'] || (req.body.ubicacionEmprendimiento && req.body.ubicacionEmprendimiento.departamento) || '';

    let datosEmprendimiento = {
      usuario: req.body.usuario,
      nombreEmprendimiento: req.body.nombreEmprendimiento,
      descripcionEmprendimiento: req.body.descripcionEmprendimiento,
      ubicacionEmprendimiento: {
        departamento: departamento,
        ciudad: ciudad
      }
    };

    // Si se subió un archivo (multer lo deja en req.file), guardamos su URL/ruta
    if (req.file) {
      datosEmprendimiento.logo = await uploadImage(req.file, "emprendimientos");
    }

    const nuevoEmprendimiento = new modeloEmprendimiento(datosEmprendimiento);
    const emprendimientoGuardado = await nuevoEmprendimiento.save();
    res.status(201).json(emprendimientoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear emprendimiento", detalle: error.message });
  }
};

// actualizar un emprendimiento
const actualizarEmprendimiento = async (req, res) => {
  const idEmprendimiento = req.params.id;
  try {
    const ciudad = req.body['ubicacionEmprendimiento.ciudad'] || req.body['ubicacionEmprendimiento[ciudad]'] || (req.body.ubicacionEmprendimiento && req.body.ubicacionEmprendimiento.ciudad) || '';
    const departamento = req.body['ubicacionEmprendimiento.departamento'] || req.body['ubicacionEmprendimiento[departamento]'] || (req.body.ubicacionEmprendimiento && req.body.ubicacionEmprendimiento.departamento) || '';

    let datosEmprendimiento = {
      usuario: req.body.usuario,
      nombreEmprendimiento: req.body.nombreEmprendimiento,
      descripcionEmprendimiento: req.body.descripcionEmprendimiento,
      ubicacionEmprendimiento: {
        departamento: departamento,
        ciudad: ciudad
      }
    };

    if (req.file) {
      datosEmprendimiento.logo = await uploadImage(req.file, "emprendimientos");
    }

    const emprendimientoActualizado = await modeloEmprendimiento.findByIdAndUpdate(
      idEmprendimiento,
      datosEmprendimiento,
      { new: true }
    );

    if (!emprendimientoActualizado) {
      return res.status(404).json({ mensaje: "Emprendimiento no encontrado" });
    }

    res.status(200).json(emprendimientoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar emprendimiento", detalle: error.message });
  }
};

// deshabilitar un emprendimiento
const deshabilitarEmprendimiento = async (req, res) => {
  try {
    const emprendimiento = await modeloEmprendimiento.findByIdAndUpdate(
      req.params.id,
      { emprendimientoActivo: false }, // Cambia el estado a false
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