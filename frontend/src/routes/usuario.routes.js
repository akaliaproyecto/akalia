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

// Función middleware para verificar si el usuario está autenticado
function verificarUsuarioLogueado(req, res, next) {
  console.log('Verificando autenticación de usuario...');
  console.log('Usuario autenticado:', req.usuarioAutenticado);

  // Comprobar si existe un usuario autenticado en la sesión
  if (!req.usuarioAutenticado) {
    console.log('Usuario no autenticado, redirigiendo a login');
    // Si no está logueado, redirigir a la página de inicio con mensaje
    return res.redirect('/?error=Debes iniciar sesión para acceder a tu perfil');
  }

  console.log('Usuario autenticado correctamente');
  // Si está logueado, continuar con la siguiente función
  next();
}

// Ruta para mostrar la página del perfil del usuario autenticado
router.get('/mi-perfil', verificarUsuarioLogueado, async (req, res) => {
  try {
    console.log('Cargando perfil para usuario:', req.usuarioAutenticado.nombreUsuario);

    // Obtener ID del usuario desde las cookies de sesión
    const idUsuarioLogueado = req.usuarioAutenticado.idPersona;
    console.log('ID del usuario a buscar:', idUsuarioLogueado);

    // CORRECCIÓN: Probar diferentes rutas de API que pueden existir en el backend
    let respuestaUsuario;
    let datosUsuarioCompletos;

    try {
      // Intentar primera ruta: sin el prefijo /api
      console.log('Intentando ruta sin /api:', `${API_BASE_URL}/usuarios/${idUsuarioLogueado}`);
      respuestaUsuario = await axios.get(`${API_BASE_URL}/usuarios/${idUsuarioLogueado}`, {
        headers: {
          'Content-Type': 'application/json',
          'akalia-api-key': process.env.API_KEY
        }
      });
      datosUsuarioCompletos = respuestaUsuario.data;
      console.log('✅ Datos obtenidos con ruta sin /api');

    } catch (errorPrimeraRuta) {
      console.log('❌ Error con ruta sin /api, intentando con /api...');

      try {
        // Intentar segunda ruta: con el prefijo /api
        console.log('Intentando ruta con /api:', `${API_BASE_URL}/api/usuarios/${idUsuarioLogueado}`);
        respuestaUsuario = await axios.get(`${API_BASE_URL}/api/usuarios/${idUsuarioLogueado}`, {
          headers: {
            'Content-Type': 'application/json',
            'akalia-api-key': process.env.API_KEY
          }
        });
        datosUsuarioCompletos = respuestaUsuario.data;
        console.log('✅ Datos obtenidos con ruta con /api');

      } catch (errorSegundaRuta) {
        console.log('❌ Error con ambas rutas, usando datos de cookies como fallback');
        throw new Error('No se pudieron obtener datos desde ninguna ruta de API');
      }
    }

    console.log('📊 Datos completos obtenidos desde MongoDB:', datosUsuarioCompletos);

    // Mapear datos del usuario desde la respuesta de la API a formato de vista
    const datosUsuarioParaMostrar = {
      // ID del usuario (puede venir como _id o idPersona dependiendo de la API)
      idPersona: datosUsuarioCompletos._id || datosUsuarioCompletos.idPersona,

      // Información básica del usuario
      nombreUsuario: datosUsuarioCompletos.nombreUsuario || 'No disponible',
      apellidoUsuario: datosUsuarioCompletos.apellidoUsuario || 'No disponible',
      email: datosUsuarioCompletos.correo || datosUsuarioCompletos.email || 'No disponible',

      // Información de contacto (mapear desde MongoDB)
      telefono: datosUsuarioCompletos.telefono || 'No registrado',

      // Seguridad: siempre ocultar la contraseña real
      contrasena: '********',

      // Fecha de registro (mapear desde MongoDB)
      fechaRegistro: datosUsuarioCompletos.fechaRegistro || 'No disponible',

      // Información adicional del usuario
      rolUsuario: datosUsuarioCompletos.rolUsuario || 'Usuario',
      estadoUsuario: datosUsuarioCompletos.estadoUsuario || 'Activo'
    };

    // Formatear la fecha de registro para mostrarla de manera más legible
    if (datosUsuarioCompletos.fechaRegistro) {
      const fechaOriginalRegistro = new Date(datosUsuarioCompletos.fechaRegistro);

      // Verificar que la fecha es válida antes de formatearla
      if (!isNaN(fechaOriginalRegistro.getTime())) {
        datosUsuarioParaMostrar.fechaRegistroFormateada = fechaOriginalRegistro.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        console.log('📅 Fecha formateada:', datosUsuarioParaMostrar.fechaRegistroFormateada);
      }
    }

    console.log('🎯 Datos formateados para la vista:', datosUsuarioParaMostrar);

    // Renderizar la vista del perfil con los datos completos obtenidos
    res.render('pages/usuario-perfil-ver', {
      usuario: datosUsuarioParaMostrar,
      titulo: 'Mi Perfil - Akalia',
      mensajeExito: req.query.exito || null
    });

  } catch (errorAlCargarPerfil) {
    console.error('🚨 Error al obtener datos completos del usuario:', errorAlCargarPerfil.message);

    // FALLBACK: En caso de error con la API, usar datos básicos de cookies como respaldo
    console.log('🔄 Activando modo fallback con datos de cookies...');
    const datosUsuarioBasicos = req.usuarioAutenticado;

    // Crear objeto con datos limitados desde las cookies de sesión
    const datosUsuarioFallback = {
      idPersona: datosUsuarioBasicos.idPersona,
      nombreUsuario: datosUsuarioBasicos.nombreUsuario || 'No disponible',
      apellidoUsuario: datosUsuarioBasicos.apellidoUsuario || 'No disponible',
      email: datosUsuarioBasicos.correo || 'No disponible',
      telefono: 'Error al cargar - Revisar conexión con API',
      contrasena: '********',
      fechaRegistro: 'Error al cargar - Revisar conexión con API',
      rolUsuario: datosUsuarioBasicos.rolUsuario || 'Usuario'
    };

    console.log('⚠️ Renderizando vista con datos limitados:', datosUsuarioFallback);

    // Renderizar vista con datos limitados y mensaje de error informativo
    res.render('pages/usuario-perfil-ver', {
      usuario: datosUsuarioFallback,
      titulo: 'Mi Perfil - Akalia',
      mensajeExito: req.query.exito || null,
      errorCarga: 'No se pudieron cargar todos los datos del perfil desde el servidor. Se muestran datos básicos de la sesión. Verifica que el backend esté funcionando correctamente.'
    });
  }
});


/*****************************************
 *   NUEVA RUTA PUT PARA ACTUALIZAR PERFIL DESDE MODAL  *
 *****************************************/
// Esta ruta maneja las actualizaciones del perfil que vienen desde el modal
router.put("/actualizar-perfil-usuario/:id", async (req, res) => {
  const { id } = req.params;
  const { nombreUsuario, apellidoUsuario, email, contrasena, telefono } = req.body;

  console.log("🔄 Actualizando perfil del usuario:", id);
  console.log("📝 Datos recibidos:", { nombreUsuario, apellidoUsuario, email, telefono });

  try {
    // Preparar objeto con datos a actualizar
    const datosActualizacion = {
      nombreUsuario,
      apellidoUsuario,
      correo: email, // Mapear 'email' a 'correo' para la API
      telefono,
    };

    // Solo incluir la contraseña si se proporcionó una nueva
    if (contrasena && contrasena.trim() !== '') {
      datosActualizacion.contrasena = contrasena;
      console.log("🔐 Incluida nueva contraseña en la actualización");
    }

    // Hacer petición PUT a la API del backend
    const respuestaAPI = await axios.put(`${API_BASE_URL}/usuarios/${id}`, datosActualizacion, {
      headers: {
        'Content-Type': 'application/json',
        'akalia-api-key': process.env.API_KEY
      }
    });

    console.log("✅ Usuario actualizado exitosamente en la base de datos");

    // Actualizar también la cookie de sesión con los nuevos datos
    const datosUsuarioActualizados = {
      idPersona: id,
      nombreUsuario: datosActualizacion.nombreUsuario,
      apellidoUsuario: datosActualizacion.apellidoUsuario,
      correo: datosActualizacion.correo,
      rolUsuario: req.usuarioAutenticado?.rolUsuario || 'usuario'
    };

    // Establecer nueva cookie con datos actualizados
    res.cookie('usuario', JSON.stringify(datosUsuarioActualizados), {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      httpOnly: false,
      secure: false
    });

    console.log("🍪 Cookie de sesión actualizada con nuevos datos");

    // Responder con éxito
    res.status(200).json({
      mensaje: 'Perfil actualizado exitosamente',
      usuario: datosUsuarioActualizados
    });

  } catch (errorActualizacion) {
    console.error("❌ Error al actualizar el usuario:", errorActualizacion.message);

    // Responder con error específico
    res.status(500).json({
      error: "Error al actualizar el perfil",
      mensaje: "No se pudieron guardar los cambios. Inténtalo de nuevo más tarde."
    });
  }
});


/*****************************************
 *   NUEVA RUTA POST PARA VALIDAR CONTRASEÑA ANTES DE ELIMINAR CUENTA (SIMPLIFICADA)  *
 *****************************************/
// Esta ruta valida la contraseña usando el mismo sistema de login
router.post("/validar-contrasena-usuario/:id", async (req, res) => {
  const { id } = req.params;
  const { contrasenaIngresada } = req.body;

  console.log("🔐 Validando contraseña para eliminar cuenta del usuario:", id);

  try {
    // Verificar que se proporcione la contraseña
    if (!contrasenaIngresada || contrasenaIngresada.trim() === '') {
      console.log("❌ No se proporcionó contraseña");
      return res.status(400).json({
        error: "Debes ingresar tu contraseña actual"
      });
    }

    // PASO 1: Primero obtener los datos del usuario para conseguir su email
    let datosUsuario;
    try {
      // Intentar obtener datos del usuario
      const respuestaUsuario = await axios.get(`${API_BASE_URL}/usuarios/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'akalia-api-key': process.env.API_KEY
        }
      });
      datosUsuario = respuestaUsuario.data;
      console.log("✅ Datos del usuario obtenidos para validación");
    } catch (errorObtenerUsuario) {
      console.error("❌ Error al obtener datos del usuario:", errorObtenerUsuario.message);
      return res.status(500).json({
        error: "Error al obtener datos del usuario",
        mensaje: "No se pudo verificar la información del usuario."
      });
    }

    // PASO 2: Usar el mismo endpoint de login para validar la contraseña
    console.log("🔐 Validando contraseña usando endpoint de login...");
    const validacionLogin = await axios.post(`${API_BASE_URL}/usuarios/login`, {
      correo: datosUsuario.correo || datosUsuario.email,
      contrasena: contrasenaIngresada.trim()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'akalia-api-key': process.env.API_KEY
      }
    });

    console.log("✅ Contraseña validada exitosamente usando login");

    // Responder con éxito si la contraseña es correcta
    res.status(200).json({
      mensaje: 'Contraseña validada correctamente',
      validacionExitosa: true
    });

  } catch (errorValidacion) {
    console.error("❌ Error al validar contraseña:", errorValidacion.message);

    // Si el error es 401 (Unauthorized), significa contraseña incorrecta
    if (errorValidacion.response?.status === 401) {
      return res.status(401).json({
        error: "La contraseña ingresada es incorrecta"
      });
    }

    // Para otros errores del servidor
    console.error("🔍 Detalles del error:", errorValidacion.response?.data || errorValidacion.message);
    res.status(500).json({
      error: "Error del servidor al validar la contraseña",
      mensaje: "No se pudo verificar la contraseña. Inténtalo de nuevo más tarde."
    });
  }
});

/*****************************************
 *   NUEVA RUTA PUT PARA DESACTIVAR CUENTA (ELIMINACIÓN SUAVE)  *
 *****************************************/
// Esta ruta maneja la "eliminación" de cuenta cambiando el estado a "inactivo"
router.put("/desactivar-cuenta-usuario/:id", async (req, res) => {
  const { id } = req.params;

  console.log("🗑️ Desactivando cuenta del usuario:", id);

  try {
    // Preparar objeto para cambiar solo el estado del usuario
    const datosDesactivacion = {
      estadoUsuario: "inactivo" // Cambiar estado a inactivo en lugar de eliminar
    };

    // Hacer petición PUT a la API del backend para actualizar el estado
    const respuestaAPI = await axios.put(`${API_BASE_URL}/usuarios/${id}`, datosDesactivacion, {
      headers: {
        'Content-Type': 'application/json',
        'akalia-api-key': process.env.API_KEY
      }
    });

    console.log("✅ Cuenta desactivada exitosamente en la base de datos");

    // Responder con éxito (no actualizar cookie porque la cuenta está inactiva)
    res.status(200).json({
      mensaje: 'Cuenta desactivada exitosamente',
      estadoNuevo: 'inactivo'
    });

  } catch (errorDesactivacion) {
    console.error("❌ Error al desactivar la cuenta del usuario:", errorDesactivacion.message);

    // Responder con error específico
    res.status(500).json({
      error: "Error al desactivar la cuenta",
      mensaje: "No se pudo completar la eliminación de la cuenta. Inténtalo de nuevo más tarde."
    });
  }
});


module.exports = router;
