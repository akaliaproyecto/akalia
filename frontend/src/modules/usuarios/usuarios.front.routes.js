/* En este archivo se definen las rutas disponibles para este módulo. Cada ruta recibe las solicitudes (requests) desde el navegador y las envía al servicio correspondiente para manejar la lógica. */

const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const {
  obtenerUsuario,
  actualizarPerfilUsuario,
  validarContrasenaUsuario,
  desactivarCuentaUsuario,
  obtenerDetalleUsuario,
  verificarContrasenaActual
} = require('./usuarios.services')

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Ruta GET para obtener el perfil del usuario */
router.get('/mi-perfil', obtenerUsuario);

/* Ruta PUT para actualizar el perfil del usuario */
router.put('/actualizar-perfil-usuario/:id', actualizarPerfilUsuario);

/* Ruta POST para actualizar el perfil del usuario (form submit SSR) */
router.post('/actualizar-perfil-usuario/:id', actualizarPerfilUsuario);

/* ruta POST para validar contraseña */
router.post('/validar-contrasena-usuario/:id', validarContrasenaUsuario);

/* Ruta PUT para desactivar usuario */
router.put('/desactivar-cuenta-usuario/:id', desactivarCuentaUsuario);

/* Ruta para obtener detalle de usuario en formato JSON (proxy al backend) */
router.get('/usuario-detalle/:id', obtenerDetalleUsuario);

/* Ruta para verificar contraseña actual */
router.post('/usuario-detalle/verificar-contrasena', verificarContrasenaActual);
/* Ruta para obtener municipios por departamento */
router.get('/municipios-por-departamento', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usuarios/municipios-por-departamento`, { headers: HEADERS });
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo municipios:', error);
    res.status(500).json({ error: 'Error al cargar municipios' });
  }
});

module.exports = router;