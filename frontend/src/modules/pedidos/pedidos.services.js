const axios = require('axios');
const { setCookie, getUpdatedHeaders } = require('../helpers');

require('dotenv').config();

// Base URL de la API (usa variables de entorno o valor por defecto)
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';

/**
 * Listar pedidos de un usuario (ventas)
 * - Renderiza la vista 'usuario-pedidos-listar' con los pedidos obtenidos desde la API
 * @param {import('express').Request} req - req.params.id: ID del usuario
 * @param {import('express').Response} res
 */
/* LISTAR VENTAS: renderiza la vista de "Mis ventas" en el perfil, obtiene los pedidos del usuario autenticado*/
exports.listarPedidosUsuario = async (req, res) => {
	try {
		const idUsuario = req.params.id;

		// Llamada al backend para obtener todos los pedidos
		const respuesta = await axios.get(`${API_BASE_URL}/pedidos/ventas/${idUsuario}`, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
		setCookie(respuesta, res);
		const pedidos = (respuesta && respuesta.status === 200 && Array.isArray(respuesta.data)) ? respuesta.data : [];
		// Render SSR de la vista
		return res.render('pages/usuario-pedidos-listar', {
			usuario: req.usuarioAutenticado || {},
			pedidos,
			apiBaseUrl: API_BASE_URL
		});
	} catch (error) {
		console.error('Error listando pedidos:', error.message || error);
		return res.status(500).render('pages/error', { error: 'Error al obtener pedidos', message: error.message || String(error) });
	}
};

/**
 * Listar compras de un usuario
 * - Renderiza la vista 'usuario-compras-listar' con los pedidos obtenidos desde la API
 * @param {import('express').Request} req - req.params.id: ID del usuario
 * @param {import('express').Response} res
 */
/* LISTAR COMPRAS: renderiza la vista de "Mis compras" en el perfil, obtiene los pedidos del usuario autenticado*/
exports.listarComprasUsuario = async (req, res) => {
	try {
		const idUsuario = req.params.id;

		// Llamada al backend para obtener todos los pedidos
		const respuesta = await axios.get(`${API_BASE_URL}/pedidos/compras/${idUsuario}`, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
		setCookie(respuesta, res);
		const pedidos = (respuesta && respuesta.status === 200 && Array.isArray(respuesta.data)) ? respuesta.data : [];

		// Filtramos los pedidos para mostrar "mis ventas" (idUsuarioComprador === idUsuario)

		// Render SSR de la vista
		return res.render('pages/usuario-compras-listar', {
			usuario: req.usuarioAutenticado || {},
			pedidos,
			apiBaseUrl: API_BASE_URL
		});
	} catch (error) {
		console.error('Error listando pedidos:', error.message || error);
		return res.status(500).render('pages/error', { error: 'Error al obtener pedidos', message: error.message || String(error) });
	}
};

/**
 * Iniciar proceso de pedido para un producto
 * - Obtiene datos del producto desde la API y renderiza la vista de creación de pedido
 * @param {import('express').Request} req - req.params.productoId
 * @param {import('express').Response} res
 */
/* INICIAR PEDIDO: obtiene el producto por id y renderiza la vista de inicio de pedido */
exports.iniciarPedido = async (req, res) => {
	try {
		const idProducto = req.params.productoId;
		if (!idProducto) return res.status(400).render('pages/error', { error: 'ID producto inválido' });

		// Pedir datos del producto al backend
		const respuesta = await axios.get(`${API_BASE_URL}/productos/${idProducto}`, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
		setCookie(respuesta, res);
		const producto = respuesta.data;

		const emprendimiento = producto.idEmprendimiento;
		const idEmprendimiento = emprendimiento._id
		const idUsuarioVendedor = emprendimiento.usuario
		// Asegurarnos de que la plantilla reciba las direcciones del usuario
		let usuario = req.usuarioAutenticado || {};
		const idUsuarioComprador = usuario.idUsuario

		try {
			const tieneDirecciones = Array.isArray(usuario.direcciones) && usuario.direcciones.length > 0;
			if (!tieneDirecciones) {
				// Intentar obtener el usuario completo desde la API 

				const respUsuario = await axios.get(`${API_BASE_URL}/usuarios/${idUsuarioComprador}`, { headers: getUpdatedHeaders(req) }, { withCredentials: true }).catch(() => null);
				setCookie(respUsuario, res);
				if (respUsuario && respUsuario.status === 200 && respUsuario.data) {
					usuario = respUsuario.data.usuario
				}
			}
		} catch (e) {
			console.warn('No se pudieron obtener direcciones del usuario desde la API:', e.message || e);
		}

		// Renderizamos la vista de inicio de pedido con usuario (posiblemente actualizado) y producto
		return res.render('pages/pedidos-crear', {
			emprendimiento,
			producto,
			usuario,
			apiBaseUrl: API_BASE_URL
		});
	} catch (error) {
		console.error('Error iniciar pedido:', error.message || error);
		return res.status(500).render('pages/error', { error: 'Error al iniciar pedido', message: error.message || String(error) });
	}
};

/**
 * Crear pedido (frontend SSR)
 * - Envía datos al backend para crear el pedido y redirige al detalle
 * @param {import('express').Request} req - req.body contiene los datos del pedido
 * @param {import('express').Response} res
 */
/* CREAR PEDIDO: USUARIO INICIA LA COMPRA */
exports.crearPedido = async (req, res) => {
	try {
		const datos = req.body;

		// Preparar datos para enviar al backend
		const pedidoData = {
			idEmprendimiento: datos.idEmprendimiento,
			idUsuarioVendedor: datos.idUsuarioVendedor,
			idUsuarioComprador: datos.idUsuarioComprador,
			direccionEnvio: JSON.parse(datos.direccionEnvio),
			detallePedido: {
				idProducto: datos.idProducto,
				unidades: parseInt(datos.unidades) || 1,
				precioPactado: parseInt(datos.precioPactado) || 0,
			},
			total: parseInt(datos.total) || 0,
		};

		// Enviar pedido al backend
		const respuesta = await axios.post(`${API_BASE_URL}/pedidos`, pedidoData, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
		setCookie(respuesta, res);
		const pedido = respuesta.data;

		console.log('Pedido creado:', pedido);

		// Redirigir a la lista de compras del usuario
		return res.redirect(`/usuario-compras/detalle/${pedido._id}`);
	} catch (error) {
		console.error('Error creando pedido:', error.message || error);
		return res.status(500).render('pages/error', {
			error: 'Error al crear pedido',
			message: error.message || String(error)
		});
	}
};

/**
 * Editar pedido (frontend SSR)
 * - Envía datos modificados al backend y redirige al detalle
 * @param {import('express').Request} req - req.params.id, req.body
 * @param {import('express').Response} res
 */
/* EDITAR PEDIDO: USUARIO VENDEDOR */
exports.editarPedido = async (req, res) => {
	try {
		const datos = req.body;

		// Preparar datos para enviar al backend
		const pedidoData = {
			idEmprendimiento: datos.idEmprendimiento,
			idUsuarioVendedor: datos.idUsuarioVendedor,
			idUsuarioComprador: datos.idUsuarioComprador,
			direccionEnvio: JSON.parse(datos.direccionEnvio),
			estadoPedido: datos.estadoPedido,
			detallePedido: {
				idProducto: datos.idProducto,
				unidades: parseInt(datos.unidades) || 1,
				descripcion: datos.descripcion,
				precioPactado: parseInt(datos.precioPactado) || 0,
			},
			total: parseInt(datos.total) || 0,
		};

		// Enviar pedido al backend
		const respuesta = await axios.put(`${API_BASE_URL}/pedidos/${req.params.id}`, pedidoData, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
		setCookie(respuesta, res);
		const pedido = respuesta.data;

		// Redirigir a la lista de compras del usuario
		return res.redirect(`/usuario-compras/detalle/${pedido._id}`);
	} catch (error) {
		console.error('Error editando pedido:', error.message || error);
		return res.status(500).render('pages/error', {
			error: 'Error al editar pedido',
			message: error.message || String(error)
		});
	}
};

/**
 * Mostrar detalle de una compra
 * - Obtiene el pedido por ID y renderiza la vista correspondiente (comprador o vendedor)
 * @param {import('express').Request} req - req.params.id
 * @param {import('express').Response} res
 */
/* ver detalle compra: obtiene el detalle de la compra con el id */
exports.detalleCompra = async (req, res) => {
	try {
		const idPedido = req.params.id;
		if (!idPedido) return res.status(400).render('pages/error', { error: 'ID pedido inválido' });

		// Pedir datos del pedido al backend
		const respuesta = await axios.get(`${API_BASE_URL}/pedidos/${idPedido}`, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
		setCookie(respuesta, res);
		const pedido = respuesta.data;

		const producto = pedido.detallePedido.idProducto;

		let usuarioComprador
		const idUsuarioComprador = pedido.idUsuarioComprador
		const idUsuarioVendedor = pedido.idUsuarioVendedor
		const estados = ['pendiente', 'aceptado', 'completado']
		const usuarioAutenticado = req.usuarioAutenticado || {};

		// Intentar obtener el usuario completo desde la API 
		const respUsuario = await axios.get(`${API_BASE_URL}/usuarios/${idUsuarioComprador}`, { headers: getUpdatedHeaders(req) }, { withCredentials: true }).catch(() => null);
		setCookie(respUsuario, res);
		if (respUsuario && respUsuario.status === 200 && respUsuario.data) {
			usuarioComprador = respUsuario.data.usuario
		}
		const { refreshToken } = req.cookies;
		console.log(refreshToken)
		if (idUsuarioComprador === usuarioAutenticado.idUsuario) {
			// Renderizamos la vista de inicio de pedido con usuario (posiblemente actualizado) y producto
			return res.render('pages/usuario-compras-detalle', {
				pedido,
				usuarioComprador,
				producto,
				estados,
				usuarioAutenticado,
				refreshToken,
				apiBaseUrl: API_BASE_URL
			});
		} else {
			return res.render('pages/usuario-pedidos-editar', {
				pedido,
				usuarioComprador,
				producto,
				estados,
				refreshToken,
				usuarioAutenticado,
				apiBaseUrl: API_BASE_URL
			});
		}
	} catch (error) {
		console.error('Error iniciar pedido:', error.message || error);
		return res.status(500).render('pages/error', { error: 'Error al mostrar pedido', message: error.message || String(error) });
	}
};

/**
 * Actualizar dirección de un pedido (frontend)
 * - Envía PATCH al backend para actualizar la dirección de envío
 * @param {import('express').Request} req - req.params.id, req.body.direccionEnvio
 * @param {import('express').Response} res
 */
/* Actualizar dirección de un pedido */
exports.actualizarDireccionPedido = async (req, res) => {
	try {
		const idPedido = req.params.id;
		const { direccionEnvio } = req.body;

		if (!idPedido) {
			return res.status(400).render('pages/error', {
				error: 'ID de pedido inválido',
				message: 'No se proporcionó un ID de pedido válido.'
			});
		}

		if (!direccionEnvio) {
			return res.status(400).render('pages/error', {
				error: 'Dirección inválida',
				message: 'No se proporcionó una dirección válida.'
			});
		}

		// Convertir la dirección de string JSON a objeto si es necesario
		let direccionObj;
		try {
			direccionObj = typeof direccionEnvio === 'string' ? JSON.parse(direccionEnvio) : direccionEnvio;
		} catch (e) {
			return res.status(400).render('pages/error', {
				error: 'Formato de dirección inválido',
				message: 'La dirección proporcionada no tiene un formato válido.'
			});
		}

		// Petición PATCH para actualizar la dirección en el backend
		await axios.patch(`${API_BASE_URL}/pedidos/${idPedido}/actualizar`,
			{ direccionEnvio: direccionObj },
			{ headers: getUpdatedHeaders(req) }
			, { withCredentials: true }
		);

		// Redirigir de vuelta al detalle del pedido con mensaje de éxito
		return res.redirect(`/usuario-compras/detalle/${idPedido}?actualizado=true`);

	} catch (error) {
		console.error('Error al actualizar dirección del pedido:', error.message || error);
		return res.status(500).render('pages/error', {
			error: 'Error al actualizar dirección',
			message: 'No se pudo actualizar la dirección del pedido. Verifica los datos o intenta más tarde.'
		});
	}
};

/**
 * Cancelar un pedido (frontend)
 * - Envía PATCH al backend para cancelar el pedido y redirige según referer
 * @param {import('express').Request} req - req.params.id, req.body
 * @param {import('express').Response} res
 */
/* Cancelar un pedido */
exports.cancelarPedido = async (req, res) => {
	try {
		const idPedido = req.params.id;

		const { usuario, pedidoCancelado } = req.body;
		if (!idPedido) {
			return res.status(400).render('pages/error', {
				error: 'ID de pedido inválido',
				message: 'No se proporcionó un ID de pedido válido.'
			});
		}
		// Preparar datos para el backend
		const datosUsuario = typeof usuario === 'string' ? JSON.parse(usuario) : usuario;

		// Petición PATCH para cambiar estado en el servidor a cancelado
		await axios.patch(`${API_BASE_URL}/pedidos/${idPedido}/cancelar`,
			{ pedidoCancelado: pedidoCancelado === 'true' || pedidoCancelado === true },
			{ headers: getUpdatedHeaders(req) }, { withCredentials: true }
		);
		const referer = req.get('referer');
		if (referer) return res.redirect(referer);
		return res.redirect(`/usuario-compras/${datosUsuario._id}`);
		// Redirigir al listado de compras del usuario

	} catch (error) {
		console.error('Error al cancelar pedido:', error.message || error);
		return res.status(500).render('pages/error', {
			error: 'Error al cancelar pedido',
			message: 'No se pudo cancelar el pedido. Verifica los datos o intenta más tarde.'
		});
	}
};
