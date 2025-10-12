// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

const nuevaOrden = async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body);
  try {
    const item  = req.body.item;

    if (!item) {
      return res.status(400).json({ error: 'No se recibieron productos.' });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        item,
        back_urls: {
          success: "https://akalia-app.onrender.com/",
          failure: "https://akalia-app.onrender.com/",
          pending: "https://akalia-app.onrender.com/",
        },
        auto_return: "approved",
      },
    });

    // Devolver la URL al frontend
    return res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error al crear la preferencia.' });
  }
};

module.exports = nuevaOrden;

