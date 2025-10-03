const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../usuarios/usuarios.model.js');
const bcrypt = require('bcrypt');
const Log = require('../middlewares/logs.js')
const session = require('express-session')

/* Iniciar sesión */
exports.iniciarSesion = async (req, res) => {
  // Aceptar 'correo' o 'email' en el cuerpo
  const correoUsuario = (req.body.correo || req.body.email || '').toLowerCase();
  const contrasena = req.body.contrasena;

  // Validar que lleguen los datos requeridos
  if (!correoUsuario || !contrasena) {
    return res.status(400).json({
      error: 'Correo y contraseña son requeridos'
    });
  }

  try {
    // Buscar usuario activo por correo en la base de datos
    const usuarioEncontrado = await User.findOne({
      correo: correoUsuario,
      estadoUsuario: 'activo'
    });
    console.log(usuarioEncontrado)
    if (!usuarioEncontrado) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    
    if (!usuarioEncontrado.contrasena) {
      return res.status(401).json({ error: 'Error en la cuenta del usuario' });
    }
    
    const contrasenaValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);
    
    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Guarda en la sesión
    req.session.userId = usuarioEncontrado._id.toString();
    req.session.usuario = {
      idUsuario: usuarioEncontrado._id,
      nombreUsuario: usuarioEncontrado.nombreUsuario,
      apellidoUsuario: usuarioEncontrado.apellidoUsuario,
      correo: usuarioEncontrado.correo,
      rolUsuario: usuarioEncontrado.rolUsuario
    };
    console.log('Usuario logueado: ', req.session.usuario)
    const datosUsuarioParaSesion = {
      idUsuario: usuarioEncontrado._id,
      nombreUsuario: usuarioEncontrado.nombreUsuario,
      apellidoUsuario: usuarioEncontrado.apellidoUsuario,
      correo: usuarioEncontrado.correo,
      telefono: usuarioEncontrado.telefono,
      rolUsuario: usuarioEncontrado.rolUsuario
    };

    // Registrar log de forma segura
    try {
      Log.generateLog('usuario.log', `Un usuario inició sesión: ${correoUsuario}, fecha: ${new Date()}`);
    } catch (logErr) {
      console.error('Error generando log de login:', logErr);
    }

    return res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario: datosUsuarioParaSesion});

  } catch (error) {
    console.error('Error en función iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
};


// Función para verificar sesión
exports.verificarSesion = async (req, res) => {
  console.log(' Verificando sesión:', {
  
    userId: req.session?.userId,
    hasSession: !!req.session
  });

  if (!req.session?.userId) {
    return res.status(401).json({ error: 'No hay sesión activa' });
  }

  try {
    const usuario = await User.findById(req.session.userId);
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      usuario: {
        idUsuario: usuario._id,
        _id: usuario._id,
        nombreUsuario: usuario.nombreUsuario,
        apellidoUsuario: usuario.apellidoUsuario,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rolUsuario: usuario.rolUsuario
      }
    });
  } catch (error) {
    console.error('❌ Error verificando sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.mfaVerify = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token
    });

    if (!isValid) return res.status(401).json({ error: 'Invalid token' });

    req.session.mfaPassed = true;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
      console.log('Se bborro con exito?')

  try {
   if (!req.session) {
     // nada que destruir
     res.clearCookie('connect.sid', { path: '/' });
     return res.json({ ok: true });
   }
    console.log('Se bborro con exito?')

   req.session.destroy((err) => {
     if (err) {
       console.error('Error destruyendo sesión:', err);
       // intentar limpiar cookie de todas formas
       res.clearCookie('connect.sid', { path: '/' });
       return res.status(500).json({ error: 'Error cerrando sesión' });
     }
    console.log('Se bborro con exito?2')

     // limpiar cookie con el mismo nombre que la sesión
     res.clearCookie('connect.sid', { path: '/' });
     return res.json({ ok: true });
   });
  } catch (err) {
   console.error('Excepción en logout:', err);
   return res.status(500).json({ error: 'Error interno al cerrar sesión' });
 }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select('email twoFAEnabled');
    res.json({ user, mfaPassed: !!req.session.mfaPassed });
  } catch (err) {
    next(err);
  }
}

exports.twoFASetup = async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Akalia (${req.session.userId})`
    });

    // Guarda provisionalmente (o espera a verify-setup para persistir)
    await User.findByIdAndUpdate(req.session.userId, { totpSecret: secret.base32 });

    const qrDataURL = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qr: qrDataURL });
  } catch (err) {
    next(err);
  }
};

exports.twoFAVerifySetup = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.session.userId);
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret, encoding: 'base32', token, window: 1
    });
    if (!verified) return res.status(400).json({ ok: false, message: 'Código inválido' });

    user.twoFAEnabled = true;
    await user.validate();
    res.json({ ok: true });
  } catch (err) { next(err); }
};