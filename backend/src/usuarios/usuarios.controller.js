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
      filtros.fechaRegistro = { $regex: fechaRegistro, $options: 'i' };
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
exports.crearUsuario = async (req, res) => {
  const datosUsuario = req.body; // datos enviados por el cliente

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await modeloUsuario.findOne({ correo: correo.toLowerCase() });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Ya existe una cuenta con este correo electrónico.'
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const contrasenaHasheada = await bcrypt.hash(contrasena, saltRounds);

    // Crear nuevo usuario
    const nuevoUsuario = new modeloUsuario({
      nombreUsuario,
      apellidoUsuario,
      correo: correo.toLowerCase(),
      contrasena: contrasenaHasheada,
      telefono: telefono || null,
    });

    // Guardar en la base de datos
    const usuarioGuardado = await nuevoUsuario.save();

    // Remover la contraseña de la respuesta
    const { contrasena: _, ...usuarioSinContrasena } = usuarioGuardado.toObject();

    console.log("Usuario registrado correctamente:", usuarioGuardado._id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: usuarioSinContrasena
    });

  } catch (error) {
    console.error("Error al registrar usuario:", error);

    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errores
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Ya existe una cuenta con este correo electrónico.'
      });
    }

    next(error);
  }
};

//editar un usuario por su id
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



