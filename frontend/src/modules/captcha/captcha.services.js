const axios = require('axios');
require('dotenv').config();
const { setCookie, getUpdatedHeaders } = require('../helpers');

const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Generar el captcha */
exports.generarCaptcha = async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/captcha/generar`, { 
            responseType: 'text', 
            headers: getUpdatedHeaders(req) 
        }, { 
            withCredentials: true 
        });
        setCookie(response,res);
        return res.send(response.data);
    } catch (error) {
        console.error('Error obteniendo captcha: ', error);
        throw new Error('Error al cargar captcha');
    }
};

exports.validarCaptcha = async (req, res) => {
    try {
        console.log('console.log de captcha:',req.headers.cookie)
        // HEADERS.cookie = req.headers.cookie || ""
        const response = await axios.post(`${API_BASE_URL}/captcha/validar`, req.body, {
            headers: getUpdatedHeaders(req)
        });
        setCookie(response,res);
        res.json(response.data); // 
    } catch (error) {
        console.error('Error validando captcha: ', error);
        return { success: false, message: 'Error validando captcha' };
    }
};