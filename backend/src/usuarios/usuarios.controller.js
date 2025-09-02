// Se importa el modelo de usuarios
const modeloUsuario = require("./usuarios.model");
const bcrypt = require('bcrypt');

//Listar todos los usuarios
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

//Listar un usuario por su id
exports.obtenerUsuarioPorId = async (req, res) => {
  const idUsuario = req.params.id;   // obtener el parámetro de la URL

  try {
    const usuarioEncontrado = await modeloUsuario.findById(idUsuario);

    if (usuarioEncontrado) {
      res.status(200).json(usuarioEncontrado);
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar usuario", detalle: error.message });
  }
};

//Consultar un usuario por su nombre
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

//Crear un nuevo usuario
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

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: usuarioSinContrasena
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

exports.actualizarUsuario = async (req, res) => {

  const idUsuario = req.params.idUsuario || req.params.id;  // leer el id desde la URL 
  const datosUsuario = req.body; // datos que llegan con el request

  try {
    // actualizar y devolver el documento actualizado (new:true)
    const usuarioActualizado = await modeloUsuario.findByIdAndUpdate(idUsuario, datosUsuario, { new: true });
    if (usuarioActualizado) {
      res.status(200).json(usuarioActualizado);
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar usuario", detalle: error.message });
  }
};

//eliminar un usuario por su id
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await modeloUsuario.findByIdAndUpdate(
      req.params.id,
      { estadoUsuario: 'inactivo' },
      { new: true }
    );
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario deshabilitado correctamente', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/*****************************************
 *    FUNCIÓN PARA INICIAR SESIÓN       *
 *****************************************/
exports.iniciarSesion = async (req, res) => {
  const { correo, contrasena } = req.body;

  // Validar que lleguen los datos requeridos
  if (!correo || !contrasena) {
    return res.status(400).json({
      error: 'Correo y contraseña son requeridos'
    });
  }

  try {
    // Buscar usuario activo por correo en la base de datos
    const usuarioEncontrado = await modeloUsuario.findOne({
      correo: correo.toLowerCase(),
      estadoUsuario: 'activo'
    });

    if (!usuarioEncontrado) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    // Verificar que el usuario tenga contraseña válida
    if (!usuarioEncontrado.contrasena) {
      return res.status(401).json({
        error: 'Error en la cuenta del usuario'
      });
    }

    // Comparar contraseña ingresada con contraseña encriptada en BD
    const contrasenaValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);

    if (!contrasenaValida) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    // Preparar datos del usuario para respuesta (sin contraseña)
    const datosUsuarioParaSesion = {
      idPersona: usuarioEncontrado._id,
      nombreUsuario: usuarioEncontrado.nombreUsuario,
      apellidoUsuario: usuarioEncontrado.apellidoUsuario,
      correo: usuarioEncontrado.correo,
      telefono: usuarioEncontrado.telefono,
      rolUsuario: usuarioEncontrado.rolUsuario
    };

    // Responder con datos del usuario
    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: datosUsuarioParaSesion
    });

  } catch (error) {
    console.error('Error en función iniciar sesión:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};
