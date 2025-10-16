/**
 * Middleware que exige que la petición esté autenticada
 * - Comprueba que exista req.session.userId y devuelve 401 si no está presente.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
exports.requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado',
      mensaje: 'Debe estar autenticado, inicie sesión.'
    });
  }
  next();
};