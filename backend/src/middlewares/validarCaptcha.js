const CaptchaServicio = require('../servicios/captcha')

exports.validarCaptcha = (req,res, next) => {

    try{
        const { captcha } = req.body;
        const sessionCaptcha = req.session.captcha;
        console.log('este es el middleware',sessionCaptcha)
        //Se valida que existe el captcha en la sesión y en la request
        if(!captcha) {
            return res.status(400).json({
                success: false,
                message: 'CAPTCHA es requerido'
            });
        }

        if(!sessionCaptcha) {
            return res.status(400).json({
                success: false,
                message: 'CAPTCHA expirado, genera uno nuevo.'
            });
        }

        //Validar captcha
        const isValid = CaptchaServicio.validarCaptcha(captcha, sessionCaptcha);

        if(!isValid) {
            //Se elimina el captcha de la sesión para forzar regeneración
            delete req.session.captcha;

            return res.status(400).json({
                success: false,
                message: 'CAPTCHA incorrecto'
            });
        }

        //CAPTCHA válido, limpiar de la sesión
        delete req.session.captcha;
        next();

    } catch (error) {
        console.error('Error validando CAPTCHA:', error);
        res.status(500).json({
            success:false,
            message: 'Error interno del servidor'
        });
    }
}
