const axios = require('axios');
require('dotenv').config();
const cookie = require('cookie');

const API_BASE_URL = process.env.URL_BASE || 'http://localhost:4000';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Generar el captcha */
exports.generarCaptcha = async (req, res) => {
    try {
        HEADERS.cookie = req.headers.cookie || "";
        const response = await axios.get(`${API_BASE_URL}/captcha/generar`,
            {
                responseType: 'text',
                headers: HEADERS,
                withCredentials: true,
                credentials: "include"
            });
        //Si el backend manda Set-Cookie, la guarda en el navegador
        if (response.headers["set-cookie"]) {
            const cookies = response.headers['set-cookie'].map((c) => cookie.parse(c));
            cookies.forEach((c) => {
                res.cookie(Object.keys(c)[0], Object.values(c)[0], {
                    httpOnly: true,
                    sameSite: 'Strict', // ahora front y back están bajo el mismo host lógico
                });
            });
        }
        return res.send(response.data);
    } catch (error) {
        console.error('Error obteniendo captcha: ', error);
        throw new Error('Error al cargar captcha');
    }
};

exports.validarCaptcha = async (req, res) => {
    try {
        console.log(req.headers)
        HEADERS.cookie = req.headers.cookie || ""
        const response = await axios.post(`${API_BASE_URL}/captcha/validar`, req.body, {
            headers: HEADERS, withCredentials: true, credentials: "include"
        });
        console.log(req.sessionID)
        if (response.headers["set-cookie"]) {
            const cookies = response.headers['set-cookie'].map((c) => cookie.parse(c));
            cookies.forEach((c) => {
                res.cookie(Object.keys(c)[0], Object.values(c)[0], {
                    httpOnly: true,
                    sameSite: 'Strict',
                });
            });
        }
        res.json(response.data); // 
    } catch (error) {
        console.error('Error validando captcha: ', error);
        return { success: false, message: 'Error validando captcha' };
    }
};