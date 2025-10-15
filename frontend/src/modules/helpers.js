const cookie = require('cookie');

/**
 * Devuelve headers actualizados para pasar la cookie junto al request hacia el backend.
 * @param {Object} req - Request de Express.
 * @returns {Object} Headers con Content-Type y la cookie si existe.
 */
exports.getUpdatedHeaders = (req) => {
    let headers = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };
    headers.cookie = req.headers.cookie || "";
    return headers
}

/**
 * Toma las cookies que vienen en la respuesta del backend y las replica en la respuesta del frontend.
 * Esto permite que cookies como refreshToken lleguen al navegador cuando el frontend actúa como proxy.
 * @param {Object} response - Respuesta HTTP (axios) recibida del backend.
 * @param {Object} res - Response de Express para setear cookies.
 */
exports.setCookie = (response, res) => {
    if (response.headers["set-cookie"]) {
        const cookies = response.headers['set-cookie'].map((c) => cookie.parse(c));
        cookies.forEach((c) => {
            res.cookie(Object.keys(c)[0], Object.values(c)[0], {
                httpOnly: false,
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ahora front y back están bajo el mismo host lógico
                secure: process.env.NODE_ENV === 'production'
            });
        });
    }
}