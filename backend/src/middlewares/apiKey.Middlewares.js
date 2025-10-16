/**
 * Middleware para validar la API Key en las peticiones
 * - Busca la cabecera 'akalia-api-key' y la compara con la API_KEY del entorno.
 * - Responde 401 si la API Key falta o es inválida.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
exports.validateApiKey = (req, res, next) => {
  const apiKey = req.headers['akalia-api-key'];
  const validApiKey = process.env.API_KEY || 'akalia-api-key-2025';

  if (!apiKey) {
    return res.status(401).json({
      error: 'API Key requerida',
      mensaje: 'Debe proporcionar una API Key en el header akalia-api-key'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'API Key inválida',
      mensaje: 'La API Key proporcionada no es válida'
    });
  }
  next();
};