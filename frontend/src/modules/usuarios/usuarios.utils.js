/**
 * Middleware para verificar que exista un usuario autenticado en la request.
 * - Redirige a la página principal con mensaje si no hay sesión.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
function verificarUsuarioLogueado(req, res, next) {
  if (!req.usuarioAutenticado) {
    return res.redirect('/?error=Debes iniciar sesión para acceder a tu perfil');
  }
  next();
}

module.exports = {
  verificarUsuarioLogueado,
}