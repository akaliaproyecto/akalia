

const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Firmar un access token JWT
 * @param {Object} payload - Información a incluir en el token
 * @returns {string} token JWT
 */
function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

/**
 * Firmar un refresh token JWT
 * @param {Object} payload - Información a incluir en el token
 * @returns {string} token JWT de larga duración
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verificar un access token
 * @param {string} token
 * @returns {Object} payload decodificado
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

/**
 * Verificar un refresh token
 * @param {string} token
 * @returns {Object} payload decodificado
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };