const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const Pedido = require('../pedidos/pedidos.model');

module.exports = function (io) {

    // Evento de conexión
    io.on('connection', (socket) => {

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

        // Indicador de escritura (typing)
        socket.on('typing', ({ pedidoId, typing }) => {
            socket.to(`pedido_${pedidoId}`).emit('typing', { userId: socket.user.id, typing });
        });
    });
}