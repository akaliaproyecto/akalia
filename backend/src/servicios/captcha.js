const svgCaptcha = require('svg-captcha')

/**
 * Generar un captcha SVG
 * - Crea un captcha visual (SVG) y devuelve el SVG y el texto
 * @returns {{data: string, text: string}} Objeto con el SVG y el texto del captcha
 */
function generarCaptcha() {
    const captcha = svgCaptcha.create({
        size: 5,
        noise: 2,
        color: true,
        background: '#fffefc',
    });
    return {
        data: captcha.data, // SVG como string
        text: captcha.text  // Texto del captcha
    };
}

/**
 * Validar que el texto ingresado coincida con el captcha guardado en sesión
 * @param {string} inputCaptcha - Texto ingresado por el usuario
 * @param {string} sessionCaptcha - Texto almacenado en sesión
 * @returns {boolean} true si coinciden
 */
function validarCaptcha(inputCaptcha, sessionCaptcha) {
    if (!inputCaptcha || !sessionCaptcha) {
        return false;
    }
    return inputCaptcha === sessionCaptcha;
}

module.exports = {
    generarCaptcha,
    validarCaptcha
};