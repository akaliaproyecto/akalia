/*****************************************
 *           IMPORTAR MÓDULOS            *
 *****************************************/
const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

/*****************************************
 *      DEFINIR URL BASE DE LA API       *
 *****************************************/
const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4000';


/*****************************************
 *          RUTA GET USUARIOS            *
 *****************************************/
//Listar usuario
router.get('/usuarios', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usuarios`);
    const usuarios = response.data;

    return res.render('pages/usuarios', {
      usuarios: usuarios,
      titulo: 'Usuarios',
    });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error.message);

    // Renderizar pagina de error
    return res.status(500).render('Error al obtener los usuarios', {
      error: 'Error del servidor',
      message: 'No se pudieron cargar los usuarios. Verifica que el backend esté funcionando.',
    });
  }
});

router.get("/usuario-perfil/:id", async (req, res) => {
  try {
    const usuario = await axios.get(`${API_BASE_URL}/api/usuarios/${req.params.id}`);

    const responseCategorias = await axios.get(`${API_BASE_URL}/categorias`);
    const categorias = responseCategorias.data;

    return res.status(200).render("pages/usuario-perfil", {
      usuario: usuario.data,
      categorias: categorias
    });
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error.message);
    return res.status(500).render("views/pages/error", {
      error: 'Error del servidor',
      message: 'No se pudo obtener el perfil del usuario. Inténtalo de nuevo más tarde.',
    });
  }
});

/*****************************************
 *       RUTA GET EDITAR PERFIL USUARIO  *
 *****************************************/
router.get("/usuario-editar-perfil/:id", async (req, res) => {
  try {
    const usuario = await axios.get(`${API_BASE_URL}/api/usuarios/${req.params.id}`);
    return res.status(200).render("pages/usuario-editar-perfil", {
      usuario: usuario.data,
      title: "Editar Perfil"
    });
  } catch (error) {
    console.error("Error al obtener usuario para editar:", error.message);
    return res.status(500).render("views/pages/error", {
      error: 'Error del servidor',
      message: 'No se pudo cargar la vista de edición de perfil.',
    });
  }
});

/*****************************************
 *   RUTA POST PARA GUARDAR LOS CAMBIOS  *
 *****************************************/
router.post("/usuario-editar-perfil/:id", async (req, res) => {
  const { id } = req.params;
  const { nombreUsuario, apellidoUsuario, email, contrasena, telefono } = req.body;

  try {
    await axios.put(`${API_BASE_URL}/api/usuarios/${id}`, {
      nombreUsuario,
      apellidoUsuario,
      email,
      contrasena,
      telefono,
    });

    // Redirige al perfil actualizado
    res.redirect(`/usuario-perfil/${id}`);
  } catch (error) {
    console.error("Error al actualizar el usuario:", error.message);
    res.status(500).render("views/pages/error", {
      error: "Error al actualizar",
      message: "No se pudo guardar los cambios del perfil.",
    });
  }
});


/*****************************************
 *       RUTA POST PARA REGISTRO         *
 *****************************************/
router.post('/registro', async (req, res) => {
  const { email, nombreUsuario, apellidoUsuario, telefono, contrasena } = req.body;

  try {
    // Hacer petición al backend para crear el usuario
    const response = await axios.post(`${API_BASE_URL}/usuarios`, {
      correo: email,
      nombreUsuario,
      apellidoUsuario,
      telefono: telefono || null,
      contrasena
    }, {
      headers: {
        'Content-Type': 'application/json',
        'akalia-api-key': process.env.API_KEY
      }
    });

    console.log('Usuario registrado exitosamente:', response.data);

    // Crear cookie con datos del usuario para mantener la sesión
    const datosUsuarioParaCookie = {
      idPersona: response.data.usuario._id,
      nombreUsuario: response.data.usuario.nombreUsuario,
      apellidoUsuario: response.data.usuario.apellidoUsuario,
      correo: response.data.usuario.correo
    };

    // Establecer cookie que dura 7 días
    res.cookie('usuario', JSON.stringify(datosUsuarioParaCookie), {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      httpOnly: false, // Permitir acceso desde JavaScript del frontend
      secure: false // Para desarrollo local
    });

    // Redirigir a la página principal (mismo contenido, solo cambia navbar)
    res.redirect('/');

  } catch (error) {
    console.error('Error al registrar usuario:', error.response?.data || error.message);

    // Si hay error, mostrar mensaje de error
    const errorMessage = error.response?.data?.error || 'Error al crear la cuenta';

    res.render('pages/index', {
      error: errorMessage,
      titulo: 'Inicio'
    });
  }
});

/*****************************************
 *       RUTA POST PARA INICIO SESIÓN   *
 *****************************************/
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;

  console.log('Procesando inicio de sesión para:', email);

  try {
    // Hacer petición al backend para validar credenciales
    const response = await axios.post(`${API_BASE_URL}/usuarios/login`, {
      correo: email,
      contrasena: contrasena
    }, {
      headers: {
        'Content-Type': 'application/json',
        'akalia-api-key': process.env.API_KEY
      }
    });

    console.log('Login exitoso en backend');

    // Crear cookie con datos del usuario para mantener la sesión
    const datosUsuarioParaCookie = {
      idPersona: response.data.usuario.idPersona,
      nombreUsuario: response.data.usuario.nombreUsuario,
      apellidoUsuario: response.data.usuario.apellidoUsuario,
      correo: response.data.usuario.correo,
      rolUsuario: response.data.usuario.rolUsuario
    };

    // Establecer cookie que dura 7 días
    res.cookie('usuario', JSON.stringify(datosUsuarioParaCookie), {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      httpOnly: false, // Permitir acceso desde JavaScript del frontend
      secure: false // Para desarrollo local
    });

    // Responder con éxito para JavaScript del frontend
    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: datosUsuarioParaCookie
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error.response?.data || error.message);

    // Responder con error específico según el tipo
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    res.status(500).json({
      error: 'Error al iniciar sesión. Inténtalo de nuevo más tarde.'
    });
  }
});


module.exports = router;
