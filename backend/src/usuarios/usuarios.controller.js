// Se importa el modelo de usuarios
const modeloUsuario = require("./usuarios.model");
const bcrypt = require('bcrypt');
const Log = require('../middlewares/logs')

/*Listar todos los usuarios*/
exports.obtenerUsuarios = async (req, res) => {
  try {
    const { nombre, correo, rol, estado, esVendedor, telefono, fecha } = req.query;
    let filtros = {};

    if (nombre) {
      filtros.$or = [
        { nombreUsuario: { $regex: nombre, $options: 'i' } },
        { apellidoUsuario: { $regex: nombre, $options: 'i' } }
      ];
    }

    if (correo) {
      filtros.correo = { $regex: correo, $options: 'i' };
    }

    if (rol) {
      filtros.rolUsuario = rol;
    }

    if (estado) {
      filtros.estadoUsuario = estado;
    }

    if (esVendedor) {
      filtros.esVendedor = esVendedor === 'true';
    }

    if (telefono) {
      filtros.telefono = { $regex: telefono, $options: 'i' };
    }

    if (fecha) {
      filtros.fechaRegistro = { $regex: fecha, $options: 'i' };
    }
    const listarUsuarios = await modeloUsuario.find(filtros);

    if (listarUsuarios && listarUsuarios.length > 0) {
      res.status(200).json(listarUsuarios);
    } else {
      res.status(404).json({ mensaje: "No se encontraron usuarios" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar usuarios", detalle: error.message });
  }
};

/*Listar un usuario por su id*/
exports.obtenerUsuarioPorId = async (req, res) => {
  const idUsuario = req.params.id;   // obtener el parámetro de la URL

  try {
    // Autorización mínima: se asume que validateApiKey o middleware de auth ya está en la ruta,
    // pero comprobamos que exista la cabecera para dar un mensaje claro.
    if (!req.headers['akalia-api-key']) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    // Consulta a Mongo (lean para obtener objeto plano)
    const usuarioEncontrado = await modeloUsuario.findById(idUsuario).lean();

    if (!usuarioEncontrado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Formateo simple y eliminación de datos sensibles
    const usuarioFormateado = {
      idUsuario: usuarioEncontrado._id,
      nombreUsuario: usuarioEncontrado.nombreUsuario || 'No disponible',
      apellidoUsuario: usuarioEncontrado.apellidoUsuario || 'No disponible',
      email: usuarioEncontrado.correo || usuarioEncontrado.email || 'No disponible',
      telefono: usuarioEncontrado.telefono || 'No registrado',
      rolUsuario: usuarioEncontrado.rolUsuario || 'usuario',
      estadoUsuario: usuarioEncontrado.estadoUsuario || 'activo',
      esVendedor: !!usuarioEncontrado.esVendedor,
      fechaRegistro: usuarioEncontrado.fechaRegistro || usuarioEncontrado.createdAt || null,
      // Fecha formateada para mostrar en frontend
      fechaRegistroFormateada: usuarioEncontrado.fechaRegistro ? new Date(usuarioEncontrado.fechaRegistro).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      }) : null
      // NOTA: no incluimos contrasena, totpSecret ni campos sensibles
    };

    return res.status(200).json({ usuario: usuarioFormateado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar usuario", detalle: error.message });
  }
};

/*Consultar un usuario por su nombre*/
exports.obtenerUsuarioPorNombre = async (req, res) => {
  const nombreUsuario = req.params.nombre;

  try {
    const usuarioEncontrado = await modeloUsuario.findOne({ nombreUsuario: nombreUsuario });

    if (usuarioEncontrado) {
      res.status(200).json(usuarioEncontrado);
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar usuario", detalle: error.message });
  }
};

/*Crear un nuevo usuario*/
exports.crearUsuario = async (req, res, next) => {
  try {
    const { nombreUsuario, apellidoUsuario, correo, contrasena, telefono } = req.body;

    // Preparar datos (dejar la validación a Mongoose/schema)
    const datosUsuario = {
      nombreUsuario,
      apellidoUsuario,
      correo: correo ? correo.toLowerCase() : undefined,
      telefono: telefono || null
    };

    // Hashear contraseña solo si llega (schema puede requerirla)
    if (contrasena) {
      const saltRounds = 10;
      datosUsuario.contrasena = await bcrypt.hash(contrasena, saltRounds);
    }

    const nuevoUsuario = new modeloUsuario(datosUsuario);
    const usuarioGuardado = await nuevoUsuario.save();

    // Remover la contraseña antes de responder
    const { contrasena: _, ...usuarioSinContrasena } = usuarioGuardado.toObject();
    const usuario = usuarioSinContrasena
    //Registrar log
    Log.generateLog('usuario.log', `Un usuario se ha registrado: ${usuario}, fecha: ${new Date()}`);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario
    });
  } catch (err) {
    console.error("Error al registrar usuario:", err);

    if (err.name === 'ValidationError') {
      const errores = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errores
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Ya existe una cuenta con este correo electrónico.'
      });
    }

    return res.status(500).json({ mensaje: "Error al crear usuario", detalle: err.message });
  }
};

/* Actualizar un usuario por su id */
exports.actualizarUsuario = async (req, res) => {
  const idUsuario = req.params.idUsuario || req.params.id;  // leer el id desde la URL 
  const datosRecibidos = req.body; // datos que llegan con el request

  try {
    // Construir objeto con solo campos permitidos para actualizar (delegar validaciones al schema)
    const camposPermitidos = ['nombreUsuario', 'apellidoUsuario', 'correo', 'telefono', 'contrasena'];
    const datosParaActualizar = {};
    for (const key of camposPermitidos) {
      if (typeof datosRecibidos[key] !== 'undefined') {
        datosParaActualizar[key] = datosRecibidos[key];
      }
    }

    // Normalizar correo si viene
    if (datosParaActualizar.correo) {
      datosParaActualizar.correo = datosParaActualizar.correo.toLowerCase();
      // NOTA: no validar unicidad aquí; el schema/índice único lanzará error si aplica
    }

    // Si llega nueva contraseña, hashearla aquí
    if (datosParaActualizar.contrasena) {
      const saltRounds = 10;
      datosParaActualizar.contrasena = await bcrypt.hash(datosParaActualizar.contrasena, saltRounds);
    }

    // Ejecutar actualización (runValidators para respetar esquema)
    const usuarioActualizado = await modeloUsuario.findByIdAndUpdate(idUsuario, datosParaActualizar, { new: true, runValidators: true }).lean();

    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Formatear respuesta (eliminar campos sensibles)
    const usuarioFormateado = {
      idUsuario: usuarioActualizado._id,
      nombreUsuario: usuarioActualizado.nombreUsuario || 'No disponible',
      apellidoUsuario: usuarioActualizado.apellidoUsuario || 'No disponible',
      email: usuarioActualizado.correo || usuarioActualizado.email || 'No disponible',
      telefono: usuarioActualizado.telefono || 'No registrado',
      rolUsuario: usuarioActualizado.rolUsuario || 'usuario',
      estadoUsuario: usuarioActualizado.estadoUsuario || 'activo',
      esVendedor: !!usuarioActualizado.esVendedor,
      fechaRegistro: usuarioActualizado.fechaRegistro || usuarioActualizado.createdAt || null,
      fechaRegistroFormateada: usuarioActualizado.fechaRegistro ? new Date(usuarioActualizado.fechaRegistro).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      }) : null
    };

    //Registrar log
    Log.generateLog('usuario.log', `Un usuario ha editado su información personal: ${usuarioFormateado.email}, información nueva: ${usuarioFormateado}  fecha: ${new Date()}`);

    // Actualizar cookie pública 'usuario' si se desea exponerla al frontend
    const cookieUsuario = {
      idUsuario: usuarioFormateado.idUsuario,
      nombreUsuario: usuarioFormateado.nombreUsuario,
      apellidoUsuario: usuarioFormateado.apellidoUsuario,
      correo: usuarioFormateado.email,
      rolUsuario: usuarioFormateado.rolUsuario
    };

    res.cookie('usuario', JSON.stringify(cookieUsuario), {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return res.status(200).json({ mensaje: 'Perfil actualizado exitosamente', usuario: usuarioFormateado });
  } catch (error) {
    console.error('actualizarUsuario:', error);
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: 'Datos de entrada inválidos', detalles: errores });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }
    return res.status(500).json({ error: 'Error al actualizar usuario', detalle: error.message });
  }
};

/* eliminar un usuario por su id */
exports.eliminarUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ mensaje: 'Falta id de usuario' });

    const usuario = await modeloUsuario.findByIdAndUpdate(
      id,
      { estadoUsuario: 'inactivo' },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Registrar log con el correo disponible en el documento
    const correoParaLog = usuario.correo || usuario.email || 'correo no disponible';
    Log.generateLog('usuario.log', `Un usuario ha eliminado su cuenta: ${correoParaLog}, fecha: ${new Date()}`);

    return res.status(200).json({ mensaje: 'Usuario deshabilitado correctamente', usuario });
  } catch (error) {
    console.error('eliminarUsuario error:', error);
    return res.status(500).json({ mensaje: 'Error al deshabilitar usuario', detalle: error.message });
  }
};