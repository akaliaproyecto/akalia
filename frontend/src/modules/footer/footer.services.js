const axios = require('axios');
require('dotenv').config();

// Cabeceras y URL base para llamadas al backend
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Cargar condiciones de uso */
exports.condicionesUso = async (req, res) => {
	res.render('pages/footer-condiciones-uso');
};

/* Cargar política de privacidad */
exports.politicasPrivacidad = async (req, res) => {
  res.render('pages/footer-politicas-privacidad');
};

/* Cargar política de cookies */
exports.politicasCookies = async (req, res) => {
  res.render('pages/footer-politicas-cookies');
};

/* Cargar preguntas frecuentes */
exports.preguntasFrecuentes = async (req, res) => {
  res.render('pages/footer-preguntas-frecuentes');
};

/* Cargar contacto */
exports.contacto = async (req, res) => {
  res.render('pages/footer-contactanos');
};