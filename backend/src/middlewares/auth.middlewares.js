exports.requireAuth = (req, res, next) => {
  // Verificar si hay sesión y usuario
  if (!req.session || !req.session.usuario) {
    console.log('No hay sesión de usuario');
    return res.status(401).json({
      error: 'Usuario no autenticado',
      mensaje: 'Debe estar autenticado, inicie sesión.'
    });
  }
    next();
};

// Middleware para verificar que el usuario es administrador
exports.requireAdmin = (req, res, next) => {
  
  if (!req.session || !req.session.usuario) {
    console.log('No hay sesión o usuario');
    return res.status(401).json({ error: 'No autorizado - Sesión no válida' });
  }

  const usuario = req.session.usuario;
  // Intentar obtener el rol de diferentes formas posibles
  const rol = usuario.rolUsuario || usuario.rol;
  
  if (rol !== 'admin' && rol !== 'administrador') {
    console.log('Acceso denegado - Rol insuficiente:', rol);
    return res.status(403).json({ error: 'Acceso denegado - Se requieren permisos de administrador' });
  }

  console.log(' Permisos de administrador verificados');
  next();
};