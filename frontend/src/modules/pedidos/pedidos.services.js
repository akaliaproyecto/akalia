const axios = require('axios');
require('dotenv').config();

// Base URL de la API (usa variables de entorno o valor por defecto)
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* LISTAR VENTAS: renderiza la vista de "Mis ventas" en el perfil, obtiene los pedidos del usuario autenticado*/
exports.listarPedidosUsuario = async (req, res) => {
	try {
		const idUsuario = req.params.id;

		// Llamada al backend para obtener todos los pedidos
		const respuesta = await axios.get(`${API_BASE_URL}/pedidos/ventas/${idUsuario}`, { headers: HEADERS, });
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

/* LISTAR COMPRAS: renderiza la vista de "Mis compras" en el perfil, obtiene los pedidos del usuario autenticado*/
exports.listarComprasUsuario = async (req, res) => {
	try {
		const idUsuario = req.params.id;

		// Llamada al backend para obtener todos los pedidos
		const respuesta = await axios.get(`${API_BASE_URL}/pedidos/compras/${idUsuario}`, { headers: HEADERS, });
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

/* INICIAR PEDIDO: obtiene el producto por id y renderiza la vista de inicio de pedido */
exports.iniciarPedido = async (req, res) => {
	try {
		const idProducto = req.params.productoId;
		if (!idProducto) return res.status(400).render('pages/error', { error: 'ID producto inválido' });

		// Pedir datos del producto al backend
		const respuesta = await axios.get(`${API_BASE_URL}/productos/${idProducto}`, { headers: HEADERS });
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

				const respUsuario = await axios.get(`${API_BASE_URL}/usuarios/${idUsuarioComprador}`, { headers: HEADERS }).catch(() => null);
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

/* CREAR PEDIDO: USUARIO INICIA LA COMPRA */
exports.crearPedido = async (req, res) => {
	try {
		const datos = req.body;
		console.log('Datos recibidos del formulario:', datos);

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
		console.log('Datos a enviar al backend:', pedidoData)

		// Enviar pedido al backend
		const respuesta = await axios.post(`${API_BASE_URL}/pedidos`, pedidoData, { headers: HEADERS });
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

/* EDITAR PEDIDO: USUARIO VENDEDOR */
exports.editarPedido = async (req, res) => {
	try {
		const datos = req.body;
		console.log('Datos recibidos del formulario:', datos);

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
		console.log('Datos a enviar al backend:', pedidoData.direccionEnvio)

		// Enviar pedido al backend
		const respuesta = await axios.put(`${API_BASE_URL}/pedidos/${req.params.id}`, pedidoData, { headers: HEADERS });
		const pedido = respuesta.data;

		console.log('Pedido editado:', pedido);

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

/* ver detalle compra: obtiene el detalle de la compra con el id */
exports.detalleCompra = async (req, res) => {
	try {
		const idPedido = req.params.id;
		if (!idPedido) return res.status(400).render('pages/error', { error: 'ID pedido inválido' });

		// Pedir datos del pedido al backend
		const respuesta = await axios.get(`${API_BASE_URL}/pedidos/${idPedido}`, { headers: HEADERS });
		const pedido = respuesta.data;

		const producto = pedido.detallePedido.idProducto;

		let usuarioComprador
		const idUsuarioComprador = pedido.idUsuarioComprador
		const idUsuarioVendedor = pedido.idUsuarioVendedor
		const estados = ['pendiente', 'aceptado', 'completado']
		const usuarioAutenticado = req.usuarioAutenticado || {};

		// Intentar obtener el usuario completo desde la API 
		const respUsuario = await axios.get(`${API_BASE_URL}/usuarios/${idUsuarioComprador}`, { headers: HEADERS }).catch(() => null);
		if (respUsuario && respUsuario.status === 200 && respUsuario.data) {
			usuarioComprador = respUsuario.data.usuario
		}

		if (idUsuarioComprador === usuarioAutenticado.idUsuario) {
			// Renderizamos la vista de inicio de pedido con usuario (posiblemente actualizado) y producto
			return res.render('pages/usuario-compras-detalle', {
				pedido,
				usuarioComprador,
				producto,
				estados,
				usuarioAutenticado,
				apiBaseUrl: API_BASE_URL
			});
		} else {
			return res.render('pages/usuario-pedidos-editar', {
				pedido,
				usuarioComprador,
				producto,
				estados,
				usuarioAutenticado,
				apiBaseUrl: API_BASE_URL
			});
		}
	} catch (error) {
		console.error('Error iniciar pedido:', error.message || error);
		return res.status(500).render('pages/error', { error: 'Error al iniciar pedido', message: error.message || String(error) });
	}
};

/* Actualizar dirección de un pedido */
exports.actualizarDireccionPedido = async (req, res) => {
	try {
		const idPedido = req.params.id;
		const { direccionEnvio } = req.body;
		
		console.log('Actualizando dirección del pedido:', { idPedido, direccionEnvio });
		
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
			{ headers: HEADERS }
		);

		console.log('Dirección actualizada exitosamente');

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
			{ headers: HEADERS }
		);
		console.log('Pedido cancelado exitosamente');

		// Redirigir al listado de compras del usuario
		return res.redirect(`/usuario-compras/${datosUsuario._id}`);

	} catch (error) {
		console.error('Error al cancelar pedido:', error.message || error);
		return res.status(500).render('pages/error', {
			error: 'Error al cancelar pedido',
			message: 'No se pudo cancelar el pedido. Verifica los datos o intenta más tarde.'
		});
	}
};
