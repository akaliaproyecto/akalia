// //Importación de módulos
// const express = require('express');
// const axios = require('axios');
// const router = express.Router();
// require('dotenv').config();

// /* Ruta API */
// const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4000';

// /* Ruta para registro de usuario */
// router.post('/registro', async (req, res) => {
//   const { email, nombreUsuario, apellidoUsuario, telefono, contrasena } = req.body;

//   try {
//     // Hacer petición al backend para crear el usuario
//     const response = await axios.post(`${API_BASE_URL}/usuarios`, {
//       correo: email,
//       nombreUsuario,
//       apellidoUsuario,
//       telefono: telefono || null,
//       contrasena
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'akalia-api-key': process.env.API_KEY
//       }
//     });

//     console.log('Usuario registrado exitosamente:', response.data);

//     // Crear cookie con datos del usuario para mantener la sesión
//     const datosUsuarioParaCookie = {
//       idUsuario: response.data.usuario._id,
//       nombreUsuario: response.data.usuario.nombreUsuario,
//       apellidoUsuario: response.data.usuario.apellidoUsuario,
//       correo: response.data.usuario.correo
//     };

//     // Establecer cookie que dura 7 días
//     res.cookie('usuario', JSON.stringify(datosUsuarioParaCookie), {
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
//       httpOnly: false, // Permitir acceso desde JavaScript del frontend
//       secure: false // Para desarrollo local
//     });

//     // Redirigir a la página principal (mismo contenido, solo cambia navbar)
//     res.redirect('/');

//   } catch (error) {
//     console.error('Error al registrar usuario:', error.response?.data || error.message);

//     // Si hay error, mostrar mensaje de error
//     const errorMessage = error.response?.data?.error || 'Error al crear la cuenta';

//     res.render('pages/index', {
//       error: errorMessage,
//       titulo: 'Inicio'
//     });
//   }
// });

// /* Ruta para inicio de sesión */
// router.post('/login', async (req, res) => {
//   const { email, contrasena } = req.body;

//   console.log('Procesando inicio de sesión para:', email);

//   try {
//     // Hacer petición al backend para validar credenciales
//     const response = await axios.post(`${API_BASE_URL}/usuarios/login`, {
//       correo: email,
//       contrasena: contrasena
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'akalia-api-key': process.env.API_KEY
//       }
//     });

//     // Crear cookie con datos del usuario para mantener la sesión
//     const datosUsuarioParaCookie = {
//       idUsuario: response.data.usuario.idUsuario,
//       nombreUsuario: response.data.usuario.nombreUsuario,
//       apellidoUsuario: response.data.usuario.apellidoUsuario,
//       correo: response.data.usuario.correo,
//       rolUsuario: response.data.usuario.rolUsuario
//     };

//     // Establecer cookie que dura 7 días
//     res.cookie('usuario', JSON.stringify(datosUsuarioParaCookie), {
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
//       httpOnly: false, // Permitir acceso desde JavaScript del frontend
//       secure: false // Para desarrollo local
//     });

//     // Responder con éxito para JavaScript del frontend
//     res.status(200).json({
//       mensaje: 'Inicio de sesión exitoso',
//       usuario: datosUsuarioParaCookie
//     });

//   } catch (error) {
//     console.error('Error al iniciar sesión:', error.response?.data || error.message);

//     // Responder con error específico según el tipo
//     if (error.response?.status === 401) {
//       return res.status(401).json({
//         error: 'Credenciales incorrectas'
//       });
//     }

//     res.status(500).json({
//       error: 'Error al iniciar sesión. Inténtalo de nuevo más tarde.'
//     });
//   }
// });

// /* Función middleware para verificar si el usuario está autenticado */
// function verificarUsuarioLogueado(req, res, next) {
//   // Comprobar si existe un usuario autenticado en la sesión
//   if (!req.usuarioAutenticado) {
//     // Si no está logueado, redirigir a la página de inicio con mensaje
//     return res.redirect('/?error=Debes iniciar sesión para acceder a tu perfil');
//   }
//   next();
// }

// /* Ruta para mostrar la página del perfil del usuario autenticado */
// router.get('/mi-perfil', verificarUsuarioLogueado, async (req, res) => {
//   const id = req.usuarioAutenticado.idUsuario;
//   let datos = req.usuarioAutenticado; // fallback por defecto

//   try {
//     // Intentar obtener datos completos de la API
//     const rutas = [`/usuarios/${id}`, `/api/usuarios/${id}`];
//     for (const ruta of rutas) {
//       try {
//         const { data } = await axios.get(`${API_BASE_URL}${ruta}`, {
//           headers: { 'akalia-api-key': process.env.API_KEY }
//         });
//         datos = data;
//         break;
//       } catch (e) {
//         console.log(`Ruta ${ruta} falló, probando siguiente...`);
//       }
//     }
//   } catch (e) {
//     console.error('Error API:', e.message);
//   }

//   // Mapear datos para vista
//   const usuario = {
//     idUsuario: datos._id || datos.idUsuario || id,
//     nombreUsuario: datos.nombreUsuario || 'No disponible',
//     apellidoUsuario: datos.apellidoUsuario || 'No disponible',
//     email: datos.correo || datos.email || 'No disponible',
//     telefono: datos.telefono || 'No registrado',
//     contrasena: '********',
//     fechaRegistro: datos.fechaRegistro || 'No disponible',
//     rolUsuario: datos.rolUsuario || 'Usuario',
//     estadoUsuario: datos.estadoUsuario || 'Activo'
//   };

//   // Formatear fecha si existe
//   if (datos.fechaRegistro) {
//     const fecha = new Date(datos.fechaRegistro);
//     if (!isNaN(fecha.getTime())) {
//       usuario.fechaRegistroFormateada = fecha.toLocaleDateString('es-ES', {
//         year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
//       });
//     }
//   }

//   res.render('pages/usuario-perfil-ver', {
//     usuario,
//     titulo: 'Mi Perfil - Akalia',
//     mensajeExito: req.query.exito || null,
//     errorCarga: datos === req.usuarioAutenticado ? 'Datos básicos de sesión' : null
//   });
// });

// /* Ruta para actualizar el perfil del usuario */
// router.put('/actualizar-perfil-usuario/:id', async (req, res) => {
//   // Obtener id y campos del cuerpo
//   const { id } = req.params;
//   const { nombreUsuario, apellidoUsuario, email, contrasena, telefono } = req.body;

//   // Validación mínima
//   if (!id) return res.status(400).json({ error: 'Falta id de usuario' });

//   // Preparar datos para la API (la API espera 'correo' en vez de 'email')
//   const datosParaApi = {
//     nombreUsuario,
//     apellidoUsuario,
//     correo: email,
//     telefono
//   };

//   // Incluir contraseña solo si el usuario la envió
//   if (contrasena && contrasena.trim()) datosParaApi.contrasena = contrasena.trim();

//   try {
//     // Llamada al backend para actualizar datos
//     await axios.put(`${API_BASE_URL}/usuarios/${id}`, datosParaApi, {
//       headers: { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY }
//     });

//     // Preparar cookie con datos básicos actualizados
//     const cookieUsuario = {
//       idUsuario: id,
//       nombreUsuario: datosParaApi.nombreUsuario,
//       apellidoUsuario: datosParaApi.apellidoUsuario,
//       correo: datosParaApi.correo,
//       rolUsuario: req.usuarioAutenticado?.rolUsuario || 'usuario'
//     };

//     // Guardar cookie por 7 días (en producción usar httpOnly: true y secure: true)
//     res.cookie('usuario', JSON.stringify(cookieUsuario), {
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       httpOnly: false,
//       secure: false
//     });

//     // Responder con éxito
//     return res.status(200).json({ mensaje: 'Perfil actualizado exitosamente', usuario: cookieUsuario });
//   } catch (err) {
//     console.error('Error al actualizar perfil:', err.response?.data || err.message);
//     return res.status(500).json({ error: 'Error al actualizar el perfil', mensaje: 'Inténtalo de nuevo más tarde.' });
//   }
// });

// /* Ruta para validar contraseña antes de eliminar cuenta */
// router.post('/validar-contrasena-usuario/:id', async (req, res) => {
//   // Obtener id y contraseña enviada por el cliente
//   const { id: idUsuario } = req.params;
//   const { contrasenaIngresada } = req.body;

//   // Validación básica de entrada
//   if (!contrasenaIngresada || !contrasenaIngresada.trim()) {
//     return res.status(400).json({ error: 'Debes ingresar tu contraseña actual' });
//   }

//   // Encabezados comunes para las llamadas a la API
//   const encabezados = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY };

//   try {
//     // PASO 1: Obtener datos del usuario (necesitamos el correo)
//     const { data: datosUsuario } = await axios.get(`${API_BASE_URL}/usuarios/${idUsuario}`, { headers: encabezados });

//     // PASO 2: Validar contraseña usando el endpoint de login del backend
//     await axios.post(
//       `${API_BASE_URL}/usuarios/login`,
//       { correo: datosUsuario.correo || datosUsuario.email, contrasena: contrasenaIngresada.trim() },
//       { headers: encabezados }
//     );

//     // Si llegamos aquí la contraseña es correcta
//     return res.status(200).json({ mensaje: 'Contraseña validada correctamente', validacionExitosa: true });

//   } catch (error) {
//     // Contraseña incorrecta (backend responde 401)
//     if (error.response?.status === 401) {
//       return res.status(401).json({ error: 'La contraseña ingresada es incorrecta' });
//     }

//     // Error al obtener usuario (falló GET) o cualquier otro error de servidor
//     console.error('Error al validar contraseña:', error.response?.data || error.message);
//     // Responder con mensaje genérico al cliente
//     return res.status(500).json({
//       error: 'Error del servidor al validar la contraseña',
//       mensaje: 'No se pudo verificar la contraseña. Inténtalo de nuevo más tarde.'
//     });
//   }
// });

// /* Ruta para desactivar la cuenta de un usuario */
// router.put('/desactivar-cuenta-usuario/:id', verificarUsuarioLogueado, async (req, res) => {
//   // Obtener id desde la URL
//   const { id } = req.params;
//   if (!id) return res.status(400).json({ error: 'Falta id de usuario' });

//   // Datos que enviaremos al backend (solo cambiamos el estado)
//   const datosDesactivacion = { estadoUsuario: 'inactivo' };

//   // Encabezados comunes para las llamadas a la API
//   const encabezados = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY };

//   try {
//     // Llamada al backend para marcar la cuenta como inactiva
//     await axios.put(`${API_BASE_URL}/usuarios/${id}`, datosDesactivacion, { headers: encabezados });

//     // Responder éxito (no actualizamos cookie porque la cuenta queda inactiva)
//     return res.status(200).json({ mensaje: 'Cuenta desactivada exitosamente', estadoNuevo: 'inactivo' });
//   } catch (errorDesactivacion) {
//     // Log para depuración (detalle si la API lo devuelve)
//     console.error('Error al desactivar cuenta:', errorDesactivacion.response?.data || errorDesactivacion.message);

//     // Usar el código de error que devolvió la API cuando exista, si no usar 500
//     const codigo = errorDesactivacion.response?.status || 500;
//     const mensaje = codigo === 404 ? 'Usuario no encontrado' : 'No se pudo completar la eliminación de la cuenta. Inténtalo de nuevo más tarde.';

//     return res.status(codigo).json({ error: 'Error al desactivar la cuenta', mensaje });
//   }
// });

// module.exports = router;