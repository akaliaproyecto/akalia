/**
 * @file Controlador CAPTCHA (backend)
 * @description Genera y valida captchas usando la sesión para almacenar el texto.
 * Comentarios en español y simples para estudiantes.
 */
const { generarCaptcha, validarCaptcha } = require('../servicios/captcha');

/**
 * Genera un CAPTCHA y lo devuelve como SVG.
 * Guarda el texto del captcha en la sesión para validarlo después.
 * @param {Object} req - Objeto request de Express.
 * @param {Object} res - Objeto response de Express.
 * @returns {void}
 */
exports.generarCaptcha = (req, res) => {
    try {
        const captcha = generarCaptcha();

        // Guardar el captcha en la sesión como objeto con expiración
        req.session.captcha = captcha.text
        //Configurar headers para SVG
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        //Enviar el SVG
        res.send(captcha.data);
        
    } catch (error) {
        console.error('Error generando CAPTCHA: ', error);
        res.status(500).json({
            success: false,
            message: 'Error generando CAPTCHA'
        });
    }
};

/**
 * Valida el CAPTCHA enviado por el usuario comparándolo con el guardado en sesión.
 * Si es inválido, genera un nuevo captcha y lo devuelve para reintentar.
 * @param {Object} req - Objeto request de Express (body: { captcha }).
 * @param {Object} res - Objeto response de Express.
 * @returns {void}
 */
exports.validarCaptcha = (req, res) => {
    try {
        const { captcha } = req.body;
        const sessionCaptcha = req.session.captcha;

        if(!captcha || !sessionCaptcha ) {
            return res.status(400).json({
                success: false,
                message: 'CAPTCHA requerido o expirado'
            });
        }

        const isValid = validarCaptcha(captcha, sessionCaptcha);

        if (isValid) {
            res.json({
                success: true,
                valid: isValid,
                message: isValid ? 'CAPTCHA válido' : 'CAPTCHA incorrecto'
            });
        } else {
            const nuevoCaptcha = generarCaptcha();
            req.session.captcha = nuevoCaptcha.text
            return res.json({
                success: false,
                message: 'Captcha inválido, intente nuevamente.',
                newCaptcha: nuevoCaptcha
            })
        }

    } catch (error) {
        console.error('Error validando CAPTCHAaaaaA: ', error);
        res.status(500).json({
            success: false,
            message: 'Error validando CAPTCHA'
        });
    }
};