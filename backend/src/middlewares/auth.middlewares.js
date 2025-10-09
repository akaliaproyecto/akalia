exports.requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado',
      mensaje: 'Debe estar autenticado, inicie sesión.'
    });
  }
  next();
};