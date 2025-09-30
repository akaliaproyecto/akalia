const axios = require('axios');
require('dotenv').config();

// Base URL de la API (usa variables de entorno o valor por defecto)
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/*
	listarPedidosUsuario: renderiza la vista de "Mis ventas" en el perfil, obtiene los pedidos del usuario autenticado*/
exports.listarPedidosUsuario = async (req, res) => {
	try {
        const idUsuario= req.params.id;

			// Llamada al backend para obtener todos los pedidos
			const respuesta = await axios.get(`${API_BASE_URL}/pedidos`, { headers: HEADERS });
			const todosPedidos = (respuesta && respuesta.status === 200 && Array.isArray(respuesta.data)) ? respuesta.data : [];

			// Filtramos los pedidos para mostrar "mis ventas" (idUsuarioVendedor === idUsuario)
			const obtenerIdComoString = v => {
				if (!v && v !== 0) return '';
				try {
					// si es objeto con _id
					if (typeof v === 'object' && v._id) return String(v._id);
					return String(v);
				} catch (e) {
					return String(v);
				}
			};

			const listaPedidos = todosPedidos.filter(p => obtenerIdComoString(p.idUsuarioVendedor) === String(idUsuario));

		// Render SSR de la vista
		return res.render('pages/usuario-pedidos-listar', {
			usuario: req.usuarioAutenticado || {},
			pedidos: listaPedidos,
			apiBaseUrl: API_BASE_URL
		});
	} catch (error) {
		console.error('Error listando pedidos:', error.message || error);
		return res.status(500).render('pages/error', { error: 'Error al obtener pedidos', message: error.message || String(error) });
	}
};

/* iniciarPedido: obtiene el producto por id y renderiza la vista de inicio de pedido */
exports.iniciarPedido = async (req, res) => {
	try {
		const idProducto = req.params.productoId;
		if (!idProducto) return res.status(400).render('pages/error', { error: 'ID producto inválido' });

		// Pedir datos del producto al backend
		const respuesta = await axios.get(`${API_BASE_URL}/productos/${idProducto}`, { headers: HEADERS });

		const producto = respuesta.data;

		// Asegurarnos de que la plantilla reciba las direcciones del usuario
		let usuario = req.usuarioAutenticado || {};
		try {
			const tieneDirecciones = Array.isArray(usuario.direcciones) && usuario.direcciones.length > 0;
			if (!tieneDirecciones) {
				// Intentar obtener el usuario completo desde la API 
				const idUsuario = usuario.idUsuario 
				if (idUsuario) {
					const respUsuario = await axios.get(`${API_BASE_URL}/usuarios/${idUsuario}`, { headers: HEADERS }).catch(() => null);
					if (respUsuario && respUsuario.status === 200 && respUsuario.data) {
						usuario = respUsuario.data.usuario 
						
					}
				}
			}
		} catch (e) {
			console.warn('No se pudieron obtener direcciones del usuario desde la API:', e.message || e);
		}

		// Renderizamos la vista de inicio de pedido con usuario (posiblemente actualizado) y producto
		return res.render('pages/pedidos-iniciar', {
			usuario: usuario,
			producto,
			apiBaseUrl: API_BASE_URL
		});
	} catch (error) {
		console.error('Error iniciar pedido:', error.message || error);
		return res.status(500).render('pages/error', { error: 'Error al iniciar pedido', message: error.message || String(error) });
	}
};
