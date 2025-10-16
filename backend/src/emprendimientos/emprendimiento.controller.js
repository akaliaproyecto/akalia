const modeloEmprendimiento = require('./emprendimiento.model');
const modeloProducto = require('../productos/productos.model')
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

/* listar un emprendimiento por ID */1
const obtenerEmprendimientoPorId = async (req, res) => {
  const idEmprendimiento = req.params.id;   // obtener el parámetro de la URL
  try {
    // Validar formato de ID
    if (!validarIdMongoDB(idEmprendimiento)) {
      return res.status(400).json({ mensaje: 'ID de emprendimiento inválido' });
    }

    const emprendimiento = await modeloEmprendimiento.findById(idEmprendimiento);

    if (emprendimiento && (req.session.userId === emprendimiento.usuario.toString())) {
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
    const emprendimientos = await modeloEmprendimiento.find({ usuario: new mongoose.Types.ObjectId(idUsuario), emprendimientoEliminado: false }) ; 
    if (!emprendimientos || emprendimientos.length === 0) {
      return res.status(200).json([]); // Usuario válido, pero sin emprendimientos
    }
      // Si sí tiene emprendimientos, validar permisos
    const tienePermiso = emprendimientos.some(
      e => e.usuario?.toString() === req.session.userId
    );

    if (!tienePermiso) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a estos emprendimientos' });
    }

    // Todo correcto
    return res.status(200).json(emprendimientos);
    
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
    const emp = await modeloEmprendimiento.findById(idEmprendimiento);
    const tienePermiso = emp.usuario.toString() === req.session.userId;
    if (tienePermiso) {
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
      let updateProductos = {};

      if (emprendimientoActualizado.emprendimientoActivo === false) {
        updateProductos = { $set: { productoActivo: false } };
      } else {
        updateProductos = { $set: { productoActivo: true } };
      }

      const productosActualizados = await modeloProducto.updateMany(
        { idEmprendimiento: idEmprendimiento },
        updateProductos
      );
      Log.generateLog('emprendimiento.log', `Un emprendimiento ha sido editado: ${emprendimientoActualizado}, fecha: ${new Date()}`);
      return res.status(200).json(emprendimientoActualizado, productosActualizados);
    } else {
      return res.status(404).json({ mensaje: "Emprendimiento no actualizado" });
    }
    //Registrar log
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
    const emp = await modeloEmprendimiento.findById(idEmprendimiento);
    const tienePermiso = emp.usuario.toString() === req.session.userId;
    if (tienePermiso) {
      const emprendimiento = await modeloEmprendimiento.findByIdAndUpdate(
        idEmprendimiento,
        {
          emprendimientoEliminado: true,
          emprendimientoActivo: false
        },
        { new: true }
      );
      // Actualizamos el estado de los productos pertenecientes al emprendimiento
      const productos = await modeloProducto.updateMany(
        { idEmprendimiento: idEmprendimiento },
        { $set: { productoEliminado: true, productoActivo: false } }
      );

      //Registrar log
      Log.generateLog('emprendimiento.log', `Un emprendimiento ha sido eliminado: ${idEmprendimiento}, fecha: ${new Date()}`);
      res.status(200).json({ mensaje: "Estado de emprendimiento actualizado correctamente", emprendimiento });
    } else {
      res.status(404).json({ mensaje: "Emprendimiento no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al deshabilitar emprendimiento", detalle: error.message });
  }
};

/* Verificar si un emprendimiento está activo */
const verificarEmprendimientoActivo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: "ID de emprendimiento es requerido" });
    }

    // Validar formato de ID
    if (!validarIdMongoDB(id)) {
      return res.status(400).json({ mensaje: 'ID de emprendimiento inválido' });
    }

    const emprendimiento = await modeloEmprendimiento.findById(id);

    if (!emprendimiento) {
      return res.status(404).json({ activo: false, mensaje: "Emprendimiento no encontrado" });
    }

    if (emprendimiento.emprendimientoEliminado) {
      return res.status(200).json({ activo: false, mensaje: "El emprendimiento está eliminado" });
    }

    return res.status(200).json({
      activo: emprendimiento.emprendimientoActivo,
      mensaje: emprendimiento.emprendimientoActivo ? "Emprendimiento activo" : "Emprendimiento inactivo"
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al verificar estado del emprendimiento", detalle: error.message });
  }
};

module.exports = {
  obtenerEmprendimientos,
  obtenerEmprendimientoPorId,
  obtenerEmprendimientoPorIdUsuario,
  crearEmprendimiento,
  actualizarEmprendimiento,
  deshabilitarEmprendimiento,
  verificarEmprendimientoActivo
};