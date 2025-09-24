const modeloEmprendimiento = require('./emprendimiento.model');
const uploadImage = require('../servicios/subirImagen')
const mongoose = require('mongoose');
const { json } = require('express');
const Log = require('../middlewares/logs');
const {
  validarIdMongoDB,
  emprendimientoExistePorId,
  validarDatosCreacionEmprendimiento,
  validarDatosActualizacionEmprendimiento
} = require('./emprendimiento.validations');
/* listar emprendimientos */
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

/* listar un emprendimiento por ID */
const obtenerEmprendimientoPorId = async (req, res) => {
  const idEmprendimiento = req.params.id;   // obtener el parámetro de la URL
  try {
    // Validar formato de ID
    if (!validarIdMongoDB(idEmprendimiento)) {
      return res.status(400).json({ mensaje: 'ID de emprendimiento inválido' });
    }
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

/* listar emprendimientos por ID de usuario */
const obtenerEmprendimientoPorIdUsuario = async (req, res) => {
  const idUsuario = req.params.id;
  try {
    const emprendimientos = await modeloEmprendimiento.find({ usuario: new mongoose.Types.ObjectId(idUsuario), emprendimientoEliminado: false });
      res.status(200).json(emprendimientos);
  } catch (error) {
    console.error("Error al consultar emprendimientos por usuario:", error);
    res.status(500).json({ mensaje: "Error en la base de datos", detalle: error.message });
  }
};

/* crear un nuevo emprendimiento */
const crearEmprendimiento = async (req, res) => {
  try {
    payload = JSON.parse(req.body.payload)

    let datosEmprendimiento = {
      usuario: payload.usuario,
      nombreEmprendimiento: payload.nombreEmprendimiento,
      descripcionEmprendimiento: payload.descripcionEmprendimiento,
      ubicacionEmprendimiento: payload.ubicacionEmprendimiento
    };
    
    // Si se subió un archivo (multer lo deja en req.file)
    if (req.file) {
      datosEmprendimiento.logo = await uploadImage(req.file, "emprendimientos");
    }

    const nuevoEmprendimiento = new modeloEmprendimiento(datosEmprendimiento);
    const emprendimientoGuardado = await nuevoEmprendimiento.save();
        //Registrar log
    Log.generateLog('emprendimiento.log', `Un emprendimiento ha sido creado por el usuario ${datosEmprendimiento.usuario}, emprendimiento: ${emprendimientoGuardado}, fecha: ${new Date()}`);

    res.status(201).json(emprendimientoGuardado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear emprendimiento", detalle: error.message });
  }
};

/* actualizar un emprendimiento */
const actualizarEmprendimiento = async (req, res) => {
  const idEmprendimiento = req.params.id;
  try {
    payload = JSON.parse(req.body.payload)
    let datosEmprendimiento = {
      nombreEmprendimiento: payload.nombreEmprendimiento,
      descripcionEmprendimiento: payload.descripcionEmprendimiento,
      emprendimientoActivo: payload.emprendimientoActivo,
      ubicacionEmprendimiento: payload.ubicacionEmprendimiento
      }
    
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
    //Registrar log
    Log.generateLog('emprendimiento.log', `Un emprendimiento ha sido editado: ${emprendimientoActualizado}, fecha: ${new Date()}`);

    res.status(200).json(emprendimientoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar emprendimiento", detalle: error.message });
  }
};

/* deshabilitar un emprendimiento */
const deshabilitarEmprendimiento = async (req, res) => {
  const idEmprendimiento = req.params.id;
  try {
    // Permitimos recibir en el body { emprendimientoEliminado: true|false }
    // Si no viene, por compatibilidad se asume false (comportamiento previo)
    let nuevoEstado = true;
    if (typeof req.body?.emprendimientoEliminado !== 'undefined') {
      // Aceptar booleano o string 'true'/'false'
      const v = req.body.emprendimientoEliminado;
      nuevoEstado = (v === true || v === 'true' || v === '1' || v === 1);
    }
    
    const emprendimiento = await modeloEmprendimiento.findByIdAndUpdate(
      idEmprendimiento,
      { emprendimientoEliminado: true },
      { new: true }
    );
    
    //Registrar log
    Log.generateLog('emprendimiento.log', `Un emprendimiento ha sido eliminado: ${idEmprendimiento}, fecha: ${new Date()}`);

    if (emprendimiento) {
      res.status(200).json({ mensaje: "Estado de emprendimiento actualizado correctamente", emprendimiento });
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