// SDK de Mercado Pago
// Controlador de Mercado Pago (CommonJS)
// Usamos la librería oficial en modo CommonJS para compatibilidad con el resto del proyecto
const { MercadoPagoConfig, Preference} = require('mercadopago');
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

const nuevaOrden = async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);
  try {
    // Aceptar dos formas de payload desde el frontend:
    // 1) { item: { title, quantity, unit_price } }
    // 2) directamente el item en body: { title, quantity, unit_price }
    const recibido = req.body.item;

    if (!recibido) {
      return res.status(400).json({ error: 'No se recibieron productos.' });
    }

    // Asegurar un arreglo 'items' como espera la API
    const itemsArray = Array.isArray(recibido) ? recibido : [recibido];

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: itemsArray,
        back_urls: {
          success: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/success` : 'https://akalia-app.onrender.com/success',
          failure: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/failure` : 'https://akalia-app.onrender.com/failure',
          pending: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/pending` : 'https://akalia-app.onrender.com/pending'
        },
        auto_return: 'approved'
      }
    });

    // Devolver la URL al frontend (soportar result.body.init_point o result.init_point)
    const initPoint = result && result.body && result.body.init_point ? result.body.init_point : (result && result.init_point ? result.init_point : null);
    if (!initPoint) {
      console.error('No se obtuvo init_point de la preferencia:', result);
      return res.status(500).json({ error: 'No se pudo obtener init_point de MercadoPago.' });
    }

    return res.json({ init_point: initPoint });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error al crear la preferencia.' });
  }
};

module.exports = nuevaOrden;

