function verificarUsuarioLogueado(req, res, next) {
  if (!req.usuarioAutenticado) {
    return res.redirect('/?error=Debes iniciar sesión para acceder a tu perfil');
  }
  next();
}

module.exports = {
  verificarUsuarioLogueado,
}