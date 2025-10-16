const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const Pedido = require('../pedidos/pedidos.model');

/**
 * Módulo de sockets para el chat de pedidos
 * - Maneja la conexión de sockets, unión a salas por pedido, envío y recepción de mensajes
 * - Eventos principales emitidos/escuchados: 'joinPedido', 'previousMessages', 'sendMessage', 'newMessage', 'typing', 'error'
 * @param {import('socket.io').Server} io - Instancia de Socket.IO
 */
module.exports = function (io) {

    // Evento de conexión
    io.on('connection', (socket) => {

        /**
         * Unirse a la sala de chat de un pedido
         * - Entrada: { pedidoId }
         * - Valida que el ID sea un ObjectId válido y emite 'previousMessages' con los mensajes guardados
         * @event socket.on('joinPedido')
         * @param {{pedidoId: string}} data
         */
        // Unirse al chat del pedido
        socket.on('joinPedido', async ({ pedidoId }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(pedidoId))
                    return socket.emit('error', 'pedidoId no válido');

                // Trae los campos necesarios y los mensajes
                const pedido = await Pedido.findById(pedidoId)
                    .select('idUsuarioComprador idUsuarioVendedor mensajes')
                    .populate('mensajes.idUsuarioRemitente');

                if (!pedido) return socket.emit('error', 'Pedido no encontrado');

                const room = `pedido_${pedidoId}`;
                socket.join(room);

                // Enviar mensajes previos
                socket.emit('previousMessages', pedido.mensajes || []);
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error al unirse al chat');
            }
        });

        /**
         * Enviar un mensaje al chat de un pedido
         * - Entrada: { pedidoId, contenido }
         * - Sanitiza el contenido, guarda el mensaje en la colección Pedido y emite 'newMessage' a la sala
         * @event socket.on('sendMessage')
         * @param {{pedidoId: string, contenido: string}} data
         */
        // Enviar mensaje
        socket.on('sendMessage', async ({ pedidoId, contenido }) => {
            try {
                // validaciones básicas
                if (!pedidoId || !contenido) return socket.emit('error', 'Datos incompletos');
                if (!mongoose.Types.ObjectId.isValid(pedidoId)) return socket.emit('error', 'pedidoId no válido');

                const texto = String(contenido).trim();
                if (texto.length === 0) return socket.emit('error', 'Mensae vacío');
                if (texto.length > 1000) return socket.emit('error', 'Mensaje demasiado extenso.');

                // Sanitizar para evitar XSS
                const clean = sanitizeHtml(texto, { allowedTags: [], allowedAttributes: {} }).trim();
                if (clean.length === 0) return socket.emit('error', 'Mensaje inválido después de sanitizar');

                if (!mongoose.Types.ObjectId.isValid(socket.user.id)) {
                    return socket.emit('error', 'ID de usuario no válido');
                }

                // Crear el objeto mensaje
                /**
                 * @typedef {Object} MensajeChat
                 * @property {import('mongoose').Types.ObjectId} idUsuarioRemitente - Referencia al remitente
                 * @property {string} contenidoMensaje - Texto del mensaje (sanitizado)
                 * @property {Date} fechaEnvio - Fecha de envío
                 */
                /** @type {MensajeChat} */
                const mensaje = {
                    idUsuarioRemitente: new mongoose.Types.ObjectId(socket.user.id),
                    contenidoMensaje: clean,
                    fechaEnvio: new Date()
                };

                // Hacer push al array mensajes y devolver el doc actualizado
                const updatedPedido = await Pedido.findByIdAndUpdate(
                    pedidoId,
                    { $push: { mensajes: mensaje } },
                    { new: true }
                ).populate('mensajes.idUsuarioRemitente');

                if (!updatedPedido) return socket.emit('error', 'Pedido no encontrado al guardar mensaje');

                // Tomar el último mensaje que se agregó
                const lastMsg = updatedPedido.mensajes[updatedPedido.mensajes.length - 1];

                // Emitir el nuevo mensaje en el chat
                io.to(`pedido_${pedidoId}`).emit('newMessage', lastMsg);
            } catch (err) {
                console.error('Error en sendMessage:', err);
                socket.emit('error', 'Error al enviar mensaje');
            }
        });

        /**
         * Indicador de escritura (typing)
         * - Reenvía a la sala que un usuario está escribiendo
         * @event socket.on('typing')
         * @param {{pedidoId: string, typing: boolean}} data
         */
        // Indicador de escritura (typing)
        socket.on('typing', ({ pedidoId, typing }) => {
            socket.to(`pedido_${pedidoId}`).emit('typing', { userId: socket.user.id, typing });
        });
    });
}