const { generarCaptcha, validarCaptcha } = require('../servicios/captcha');

exports.generarCaptcha = (req, res) => {
    try {
        const captcha = generarCaptcha();

        // Guardar el captcha en la sesión como objeto con expiración
        req.session.captcha = captcha.text
        console.log("Generar")
        console.log(req.sessionID)
        console.log(req.session)
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

exports.validarCaptcha = (req, res) => {
    try {
        const { captcha } = req.body;
        const sessionCaptcha = req.session.captcha;
        console.log("Validar")
        console.log(req.sessionID)
        console.log(req.session)

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