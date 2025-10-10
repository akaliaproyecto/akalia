const nodemailer = require('nodemailer')
require('dotenv').config()
const path = require('path')
const transportador = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})
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


