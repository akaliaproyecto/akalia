/* Servicios de usuarios: obtención, actualización, validación y desactivación de cuentas
Módulo que centraliza la lógica del frontend para usuarios: consulta la API (axios) usando la URL y cabeceras desde env, normaliza y formatea los datos para la vista (mi perfil), maneja la actualización del perfil (y actualiza la cookie), valida la contraseña actual contra el endpoint de login y marca la cuenta como inactiva (desactivación). */

const axios = require('axios');
require('dotenv').config();

const {
  verificarUsuarioLogueado,
} = require('./usuarios.utils')

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Verificar usuario logueado */
exports.obtenerUsuario = async (req, res) => {
  // Verificar si el usuario está autenticado
  const id = req.usuarioAutenticado.idPersona;
  let datos = req.usuarioAutenticado;

  try {
    const rutas = [`/usuarios/${id}`, `/api/usuarios/${id}`]; //crea un array con dos rutas que incluyen el id del usuario
    // itera el array de rutas y prueba cada una con una petición GET
    for (const ruta of rutas) {
      try {
        const { data } = await axios.get(`${API_BASE_URL}${ruta}`, { headers: HEADERS });
        datos = data;
        break;
      } catch (e) {
        /* intenta siguiente ruta */
      }
    }
  } catch (e) {
    console.error('Error API:', e.message || e);
  }

  //Ese bloque crea un objeto "usuario" con los campos que la vista necesita, tomando los valores de "datos" (respuesta de la API) y usando valores por defecto si faltan.
  const usuario = {
    idPersona: datos._id || datos.idPersona || id,
    nombreUsuario: datos.nombreUsuario || 'No disponible',
    apellidoUsuario: datos.apellidoUsuario || 'No disponible',
    email: datos.correo || datos.email || 'No disponible',
    telefono: datos.telefono || 'No registrado',
    contrasena: '********',
    fechaRegistro: datos.fechaRegistro || 'No disponible',
    rolUsuario: datos.rolUsuario || 'Usuario',
    estadoUsuario: datos.estadoUsuario || 'Activo'
  };

  // Formatear fecha de registro a formato legible
  if (datos.fechaRegistro) {
    const fecha = new Date(datos.fechaRegistro);
    if (!isNaN(fecha.getTime())) {
      usuario.fechaRegistroFormateada = fecha.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
  }

  // Renderizar la vista con los datos del usuario
  const renderData = {
    usuario,
    titulo: 'Mi Perfil - Akalia',
    mensajeExito: req.query.exito || null
  };

  if (datos === req.usuarioAutenticado) {
    renderData.errorCarga = 'Datos básicos de sesión';
  } else {
    renderData.errorCarga = null;
  }

  res.render('pages/usuario-perfil-ver', renderData);
};

/* Actualizar perfil del usuario */
exports.actualizarPerfilUsuario = async (req, res) => {
  // Extrae el id desde los parámetros de la ruta y los campos enviados en el body del formulario para actualizar el usuario
  const { id } = req.params;
  const { nombreUsuario, apellidoUsuario, email, contrasena, telefono } = req.body;

  // Error de validación
  if (!id) {
    return res.status(400).json({ error: 'Falta id de usuario' });
  }

  // Crea el objeto que se enviará a la API con los campos esperados
  const datosParaApi = {
    nombreUsuario,
    apellidoUsuario,
    correo: email,
    telefono
  };

  // Enviar la solicitud de actualización de perfil
  try {
    await axios.put(`${API_BASE_URL}/usuarios/${id}`, datosParaApi, { headers: HEADERS });
    // Actualizar la cookie con los nuevos datos del usuario
    const cookieUsuario = {
      idPersona: id,
      nombreUsuario: datosParaApi.nombreUsuario,
      apellidoUsuario: datosParaApi.apellidoUsuario,
      correo: datosParaApi.correo,
      rolUsuario: req.usuarioAutenticado?.rolUsuario || 'usuario'
    };

    // Establecer la cookie con los nuevos datos del usuario
    res.cookie('usuario', JSON.stringify(cookieUsuario), {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: false
    });

    return res.status(200).json({ mensaje: 'Perfil actualizado exitosamente', usuario: cookieUsuario });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar el perfil', mensaje: 'Inténtalo de nuevo más tarde.' });
  }
};

/* Validar contraseña del usuario */
exports.validarContrasenaUsuario = async (req, res) => {
  // Se obtiene el id del usuario desde la URL y la contraseña enviada en el cuerpo de la petición
  const { id: idUsuario } = req.params;
  const { contrasenaIngresada } = req.body;

  // Verifica que se envíe la contraseña.
  if (!contrasenaIngresada) {
    return res.status(400).json({ error: 'Debes ingresar tu contraseña actual' });
  }

  // Verifica que la contraseña no esté vacía
  try {
    // Obtener datos del usuario
    const { data: datosUsuario } = await axios.get(`${API_BASE_URL}/usuarios/${idUsuario}`, { headers: HEADERS });

    // Intentar login con la contraseña ingresada
    await axios.post(`${API_BASE_URL}/usuarios/login`, {
      correo: datosUsuario.correo || datosUsuario.email,
      contrasena: contrasenaIngresada
    }, { headers: HEADERS });

    return res.status(200).json({ mensaje: 'Contraseña validada correctamente', validacionExitosa: true });
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'La contraseña ingresada es incorrecta' });
    }

    return res.status(500).json({ error: 'Error del servidor al validar la contraseña', mensaje: 'Inténtalo de nuevo más tarde.' });
  }
};

/* Desactivar cuenta del usuario */
exports.desactivarCuentaUsuario = async (req, res) => {
  // Extrae el id desde los parámetros de la ruta
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Falta id de usuario' });

  // Verifica que el usuario exista
  try {
    // Realiza una petición para actualizar el estado del usuario
    await axios.put(`${API_BASE_URL}/usuarios/${id}`, { estadoUsuario: 'inactivo' }, { headers: HEADERS });
    return res.status(200).json({ mensaje: 'Cuenta desactivada exitosamente', estadoNuevo: 'inactivo' });

  } catch (errorDesactivacion) {
    const codigo = errorDesactivacion.response?.status || 500;
    return res.status(codigo).json({ error: 'Error al desactivar la cuenta' });
  }
};