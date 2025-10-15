/**
 * @file Controlador de autenticación
 * @description Maneja la lógica de inicio de sesión, 2FA, recuperación y verificación de sesión.
 * Los comentarios aquí están redactados en español y pensados para estudiantes.
 */
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../usuarios/usuarios.model.js');
const bcrypt = require('bcrypt');
const Log = require('../middlewares/logs.js')

const cookie = require('cookie');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../servicios/jwt.utils.js');
const jwt = require('jsonwebtoken');
const { configEmail } = require('../servicios/mailer');

/* Iniciar sesión */
/**
 * Inicia sesión un usuario con correo y contraseña.
 * @summary Valida credenciales, genera tokens y crea la sesión en el servidor.
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} req.body - Datos enviados en el cuerpo (correo, contrasena, captcha opcional).
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Object} Respuesta JSON con mensaje, usuario y accessToken en caso de éxito.
 */
exports.iniciarSesion = async (req, res) => {
  // Aceptar 'correo' o 'email' en el cuerpo
  const correoUsuario = (req.body.correo).toLowerCase();
  const contrasena = req.body.contrasena;
  console.log(req.body)
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
    // Token
    const payload = { id: usuarioEncontrado._id, email: correoUsuario };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // necesario si front y back en dominios distintos
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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

    // Registrar log
    Log.generateLog('usuario.log', `Un usuario inició sesión: ${correoUsuario}, fecha: ${new Date()}`);

    return res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario: datosUsuarioParaSesion, accessToken });

  } catch (error) {
    console.error('Error en función iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
};


// Función para verificar sesión
/**
 * Verifica si existe una sesión activa en el servidor.
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Object} 200 si está activa, 401 si no hay sesión.
 */
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
    console.error('Error verificando sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Verifica código de 2FA (MFA) enviado por el usuario.
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Siguiente middleware.
 * @returns {Object} Respuesta JSON indicando si el código es válido.
 */
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

/**
 * Cierra la sesión del usuario y elimina cookies relacionadas.
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @returns {Object} Respuesta JSON confirmando cierre de sesión.
 */
exports.logout = async (req, res) => {
  try {
    if (!req.session || req.session) {
      // nada que destruir
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
      });
      return res.json({ ok: true });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destruyendo sesión:', err);
        // intentar limpiar cookie de todas formas
        res.clearCookie('connect.sid', { path: '/' });
        return res.status(500).json({ error: 'Error cerrando sesión' });
      }
      // limpiar cookie con el mismo nombre que la sesión
      res.clearCookie('connect.sid', { path: '/' });
      return res.json({ ok: true });
    });
  } catch (err) {
    console.error('Excepción en logout:', err);
    return res.status(500).json({ error: 'Error interno al cerrar sesión' });
  }
};

/**
 * Devuelve información del usuario actualmente autenticado.
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Siguiente middleware.
 * @returns {Object} Datos básicos del usuario en sesión.
 */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select('email twoFAEnabled');
    res.json({ user, mfaPassed: !!req.session.mfaPassed });
  } catch (err) {
    next(err);
  }
}

/**
 * Inicia el proceso de configuración de 2FA para el usuario.
 * Genera un secreto y un QR para que el usuario lo registre en su app autenticadora.
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Siguiente middleware.
 */
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

/**
 * Verifica el código de 2FA durante la configuración y guarda el secreto si es válido.
 * @param {Object} req - Objeto de petición Express.
 * @param {Object} res - Objeto de respuesta Express.
 * @param {Function} next - Siguiente middleware.
 */
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

// --- Recuperación de contraseña (forgot / reset)
/**
 * Inicia el flujo de recuperación de contraseña (forgot).
 * Envía un correo con token si el email existe.
 * @param {Object} req - Objeto de petición Express con { email } en el body.
 * @param {Object} res - Objeto de respuesta Express.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  try {
    const user = await User.findOne({ correo: email.toLowerCase() });
    if (!user) return res.status(200).json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperación' });

    const secret = process.env.JWT_RESET_SECRET || process.env.SESSION_SECRET || 'secret_reset_key';
    const token = jwt.sign({ userId: user._id.toString() }, secret, { expiresIn: 300 });

    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://akalia-app.onrender.com';
    const resetLink = `${frontendUrl.replace(/\/$/, '')}/usuario-reset-password?token=${encodeURIComponent(token)}&id=${user._id}`;

    
    const infoCorreo = {
      to: user.correo, 
      subject:'AKALIA | Recuperar contraseñ', 
       html: `<p>Hola ${user.nombreUsuario || ''},</p>
             <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente enlace para crear una nueva contraseña (válido 1 hora):</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>Si no solicitaste esto, ignora este correo.</p>`
    }
    
    configEmail( infoCorreo )
    
    return res.status(200).json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperación' });
  } catch (error) {
    console.error('Error forgotPassword:', error);
    return res.status(500).json({ error: 'Error interno al procesar recuperación' });
  }
};

/**
 * Restablece la contraseña usando token y id del usuario.
 * @param {Object} req - Objeto de petición Express con { token, id, password } en el body.
 * @param {Object} res - Objeto de respuesta Express.
 */
exports.resetPassword = async (req, res) => {
  const { token, id, password } = req.body;
  if (!token || !id || !password) return res.status(400).json({ error: 'Datos incompletos' });

  try {
    const secret = process.env.JWT_RESET_SECRET || process.env.SESSION_SECRET || 'secret_reset_key';
    const decoded = jwt.verify(token, secret);
    if (!decoded || decoded.userId !== id) return res.status(401).json({ error: 'Token inválido' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const saltRounds = 10;
    user.contrasena = await bcrypt.hash(password, saltRounds);
    await user.save();

    return res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error resetPassword:', error);
    return res.status(500).json({ error: 'Error interno al resetear contraseña' });
  }
};