const svgCaptcha = require('svg-captcha')


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

function validarCaptcha(inputCaptcha, sessionCaptcha) {
    if (!inputCaptcha || !sessionCaptcha) {
        return false;
    }
    return inputCaptcha.toLowerCase() === sessionCaptcha.toLowerCase();
}

module.exports = {
    generarCaptcha,
    validarCaptcha
};