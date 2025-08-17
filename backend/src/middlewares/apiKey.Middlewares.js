exports.validateApiKey = (res, req, next) => {
    const apiKey = req.headers['akalia-api-key'];
    const validApiKey = process.env.API_KEY || 'akalia-api-key-2025';

    if(!apiKey) {
        return res.status(401).json({
            error:'API Key requerida',
            mensaje: 'Debe proporcionar una API Key en el header akalia-api-key'
        });
    }

    if(apiKey !== validApiKey) {
        return res.status(401).json({
            error:'API Key inválida',
            mensaje:'La API Key proporcionada no es válida'
        });
    }
    next();
};