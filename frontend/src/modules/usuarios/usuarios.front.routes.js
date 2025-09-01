const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Middleware para verificar usuario logueado (usa req.usuarioAutenticado si tu app lo setea) */
function verificarUsuarioLogueado(req, res, next) {
  if (!req.usuarioAutenticado) {
    return res.redirect('/?error=Debes iniciar sesión para acceder a tu perfil');
  }
  next();
}

/* GET /mi-perfil */
router.get('/mi-perfil', verificarUsuarioLogueado, async (req, res) => {
  const id = req.usuarioAutenticado.idPersona;
  let datos = req.usuarioAutenticado;
  try {
    const rutas = [`/usuarios/${id}`, `/api/usuarios/${id}`];
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

  if (datos.fechaRegistro) {
    const fecha = new Date(datos.fechaRegistro);
    if (!isNaN(fecha.getTime())) {
      usuario.fechaRegistroFormateada = fecha.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
  }

  res.render('pages/usuario-perfil-ver', {
    usuario,
    titulo: 'Mi Perfil - Akalia',
    mensajeExito: req.query.exito || null,
    errorCarga: datos === req.usuarioAutenticado ? 'Datos básicos de sesión' : null
  });
});

/* PUT /actualizar-perfil-usuario/:id */
router.put('/actualizar-perfil-usuario/:id', async (req, res) => {
  const { id } = req.params;
  const { nombreUsuario, apellidoUsuario, email, contrasena, telefono } = req.body;
  if (!id) return res.status(400).json({ error: 'Falta id de usuario' });

  const datosParaApi = { nombreUsuario, apellidoUsuario, correo: email, telefono };
  if (contrasena && contrasena.trim()) datosParaApi.contrasena = contrasena.trim();

  try {
    await axios.put(`${API_BASE_URL}/usuarios/${id}`, datosParaApi, { headers: HEADERS });

    const cookieUsuario = {
      idPersona: id,
      nombreUsuario: datosParaApi.nombreUsuario,
      apellidoUsuario: datosParaApi.apellidoUsuario,
      correo: datosParaApi.correo,
      rolUsuario: req.usuarioAutenticado?.rolUsuario || 'usuario'
    };

    res.cookie('usuario', JSON.stringify(cookieUsuario), {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: false
    });

    return res.status(200).json({ mensaje: 'Perfil actualizado exitosamente', usuario: cookieUsuario });
  } catch (err) {
    console.error('Error al actualizar perfil:', err.response?.data || err.message || err);
    return res.status(500).json({ error: 'Error al actualizar el perfil', mensaje: 'Inténtalo de nuevo más tarde.' });
  }
});

/* POST /validar-contrasena-usuario/:id */
router.post('/validar-contrasena-usuario/:id', async (req, res) => {
  const { id: idUsuario } = req.params;
  const { contrasenaIngresada } = req.body;
  if (!contrasenaIngresada || !contrasenaIngresada.trim()) {
    return res.status(400).json({ error: 'Debes ingresar tu contraseña actual' });
  }

  try {
    const { data: datosUsuario } = await axios.get(`${API_BASE_URL}/usuarios/${idUsuario}`, { headers: HEADERS });
    await axios.post(`${API_BASE_URL}/usuarios/login`, {
      correo: datosUsuario.correo || datosUsuario.email,
      contrasena: contrasenaIngresada.trim()
    }, { headers: HEADERS });

    return res.status(200).json({ mensaje: 'Contraseña validada correctamente', validacionExitosa: true });
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'La contraseña ingresada es incorrecta' });
    }
    console.error('Error al validar contraseña:', error.response?.data || error.message || error);
    return res.status(500).json({ error: 'Error del servidor al validar la contraseña', mensaje: 'Inténtalo de nuevo más tarde.' });
  }
});

/* PUT /desactivar-cuenta-usuario/:id */
router.put('/desactivar-cuenta-usuario/:id', verificarUsuarioLogueado, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Falta id de usuario' });

  try {
    await axios.put(`${API_BASE_URL}/usuarios/${id}`, { estadoUsuario: 'inactivo' }, { headers: HEADERS });
    return res.status(200).json({ mensaje: 'Cuenta desactivada exitosamente', estadoNuevo: 'inactivo' });
  } catch (errorDesactivacion) {
    console.error('Error al desactivar cuenta:', errorDesactivacion.response?.data || errorDesactivacion.message || errorDesactivacion);
    const codigo = errorDesactivacion.response?.status || 500;
    const mensaje = codigo === 404 ? 'Usuario no encontrado' : 'No se pudo completar la eliminación de la cuenta. Inténtalo de nuevo más tarde.';
    return res.status(codigo).json({ error: 'Error al desactivar la cuenta', mensaje });
  }
});

module.exports = router;