// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// require('dotenv').config();

// // URL del backend
// const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
// const HEADERS = { 'akalia-api-key': process.env.API_KEY };

// /*****************************************
//  *          RUTA REGISTRO USUARIO        *
//  *****************************************/
// router.post("/registro", async (req, res) => {
//   const { nombreUsuario, apellidoUsuario, email, contrasena, telefono } = req.body;

//   console.log("Datos recibidos en /registro:", req.body);

//   try {
//     // Preparar los datos para enviar al backend
//     const datosUsuario = {
//       nombreUsuario,
//       apellidoUsuario,
//       correo: email, // Mapear email a correo
//       contrasena,
//       telefono: telefono || null,
//     };

//     // Petición POST al backend
//     const response = await axios.post(`${API_BASE_URL}/usuarios`, datosUsuario, { headers: HEADERS });

//     console.log("Usuario registrado correctamente:", response.data);

//     // Redirigir a la página de inicio después del registro
//     res.redirect("/?mensaje=Usuario registrado exitosamente");

//   } catch (error) {
//     console.error("Error al registrar usuario:", error.response?.data || error);

//     let mensajeError = "No se pudo crear la cuenta. Intenta de nuevo.";
    
//     if (error.response?.data?.error) {
//       mensajeError = error.response.data.error;
//     }

//     res.status(500).render("pages/index", {
//       title: "Crear cuenta",
//       error: mensajeError,
//     });
//   }
// });

// /*****************************************
//  *             RUTA GET LOGIN            *
//  *****************************************/
// router.get("/login", (req, res) => {
//   res.render("pages/login", { title: "Iniciar Sesión" });
// });

// /*****************************************
//  *            RUTA POST LOGIN            *
//  *****************************************/
// router.post("/login", async (req, res) => {
//   const { correo, contrasena } = req.body;

//   try {
//     const response = await axios.post(`${API_BASE_URL}/login`, { correo, contrasena }, { headers: HEADERS });

//     const usuario = response.data;

//     if (!usuario) {
//       return res.status(401).render("pages/index", {
//         title: "Iniciar Sesión",
//         error: "Usuario no encontrado",
//       });
//     }

//     return res.status(200).json(usuario);

//   } catch (error) {
//     console.error("Error al iniciar sesión:", error.toJSON?.() || error);

//     return res.status(401).render("pages/index", {
//       title: "Iniciar Sesión",
//       error: "Credenciales incorrectas o error del servidor",
//     });
//   }
// });

// module.exports = router;