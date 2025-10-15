const axios = require('axios');
require('dotenv').config();
const { setCookie, getUpdatedHeaders } = require('../helpers');

const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/**
 * Solicita al backend el SVG del captcha y replica cookies en la respuesta.
 * @param {Object} req - Request de Express (se usan headers y cookies).
 * @param {Object} res - Response de Express para enviar el SVG al cliente.
 */
exports.generarCaptcha = async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/captcha/generar`, {
            responseType: 'text',
            headers: getUpdatedHeaders(req)
        }, {
            withCredentials: true
        });
        setCookie(response, res);
        return res.send(response.data);
    } catch (error) {
        console.error('Error obteniendo captcha: ', error);
        throw new Error('Error al cargar captcha');
    }
};

/**
 * Envía al backend el valor del captcha para validarlo. Replica cookies en la respuesta.
 * @param {Object} req - Request con body { captcha }.
 * @param {Object} res - Response para devolver JSON con resultado de validación.
 */
exports.validarCaptcha = async (req, res) => {
    try {
        console.log('console.log de captcha:', req.headers.cookie)
        const response = await axios.post(`${API_BASE_URL}/captcha/validar`, req.body, {
            headers: getUpdatedHeaders(req)
        });
        setCookie(response, res);
        res.json(response.data); // 
    } catch (error) {
        console.error('Error validando captcha: ', error);
        return { success: false, message: 'Error validando captcha' };
    }
};