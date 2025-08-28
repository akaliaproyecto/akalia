const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

exports.login = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ correo: email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    req.session.userId = user._id;
    req.session.mfaPassed = !user.twoFAEnabled; //  si no tiene 2FA, ya pasó
    res.json({ ok: true, reqire2FA: user.twoFAEnabled });
  } catch (err) {
    next(err);
  }
}

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


exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
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