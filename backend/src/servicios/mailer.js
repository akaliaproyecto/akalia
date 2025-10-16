const nodemailer = require('nodemailer')
require('dotenv').config()
const path = require('path')

/**
 * Transportador de correos usando nodemailer y Gmail (configuración desde .env)
 * NOTA: en producción es recomendable usar un servicio de envío dedicado.
 */
const transportador = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

/**
 * Enviar un correo electrónico usando la configuración definida
 * @param {Object} info - Objeto con opciones del correo (to, subject, text, html, etc.)
 */
exports.configEmail = (info)=>{
    const options ={
        from:process.env.EMAIL_FROM,
        ...info
    }

transportador.sendMail(options,(error,options)=>{
    if(error){
        console.log('ERROR: ',error.message)
    }else{
        console.log('Envio exitoso: ',options.response)
    }
})
}


