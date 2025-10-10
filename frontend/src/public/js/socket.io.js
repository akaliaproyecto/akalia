// Verificar que tenemos todos los datos necesarios
if (!window.CHAT_DATA || !window.CHAT_DATA.pedidoId || !window.CHAT_DATA.usuarioId) {
  console.error('❌ Datos del chat no disponibles');
} else if (typeof io === 'undefined') {
  console.error('❌ Socket.IO no está cargado');
} else {
  
  const { pedidoId, usuarioId, apiBaseUrl, mensajes, token } = window.CHAT_DATA;
  console.log(apiBaseUrl)
  console.log('🚀 Inicializando chat para pedido:', pedidoId, 'Usuario:', usuarioId);

  // Conectar al socket
  const socket = io(apiBaseUrl, { 
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true
     });
  // Manejar conexión
  socket.on('connect', () => {
    // Unirse a la sala del pedido
    socket.emit('joinPedido', { pedidoId });
  });

  // Manejar errores de conexión
  socket.on('connect_error', (error) => {
    console.error('Error de conexión:', error);
    console.error('Detalles:', {
      message: error.message,
      type: error.type,
      transport: socket.io.engine?.transport?.name
    });
  });

  // Recibir mensajes previos
  socket.on('previousMessages', (mensajes) => {
    mensajes.forEach(msg => {
        renderMessage(msg);
    });
    console.log('📨 Mensajes previos recibidos:', mensajes.length);
  });



  // Nuevo mensaje en tiempo real
  socket.on('newMessage', (msg) => {
    console.log('📨 Nuevo mensaje recibido:', msg);
    renderMessage(msg);
  });

  // Manejar errores del servidor
  socket.on('error', (error) => {
    console.error('❌ Error del servidor:', error);
    alert('Error: ' + error);
  });

  //  Función para renderizar mensajes
  function renderMessage(msg) {
    const container = document.querySelector('.chat-messages');
    if (!container) {
      console.error('❌ Contenedor de mensajes no encontrado');
      return;
    }

    const esUsuarioActual = msg.idUsuarioRemitente?._id === usuarioId || 
                           msg.idUsuarioRemitente?.toString() === usuarioId;

    // Obtener iniciales
    let iniciales = "US";
    if (msg.idUsuarioRemitente?.nombreUsuario) {
      const nombres = msg.idUsuarioRemitente.nombreUsuario.split(" ");
      iniciales = nombres.map(n => n[0]).join("").substring(0, 2).toUpperCase();
    } else if (esUsuarioActual) {
      iniciales = "YO";
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message mb-3';
    messageDiv.innerHTML = `
      <div class="d-flex align-items-start ${esUsuarioActual ? 'flex-row-reverse' : ''}">
        <div class="avatar ${esUsuarioActual ? 'ms-2' : 'me-2'}">
          <div class="rounded-circle ${esUsuarioActual ? 'bg-verde-light' : 'bg-terracota-light'} d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
            <span class="fw-bold small ${esUsuarioActual ? 'text-verde' : 'text-terracota'}">${iniciales}</span>
          </div>
        </div>
        <div class="message-content ${esUsuarioActual ? 'text-end' : ''}">
          <div class="${esUsuarioActual ? 'bg-verde-light' : 'bg-light'} p-2 rounded">
            <p class="mb-1 small">${msg.contenidoMensaje}</p>
          </div>
          <small class="text-muted">
            ${ (esUsuarioActual ? 'Tú' : msg.idUsuarioRemitente?.nombreUsuario)} - 
            ${new Date(msg.fechaEnvio).toLocaleString()}
          </small>
        </div>
      </div>
    `;

    container.appendChild(messageDiv);

    // Scroll automático
    const chatBox = container.closest('.chat-container');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  //  Enviar mensaje
  const sendMessageForm = document.getElementById('sendMessageForm');
  const messageInput = document.getElementById('messageInput');

  if (sendMessageForm && messageInput) {
    sendMessageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const contenido = messageInput.value.trim();
      if (!contenido) {
        console.log('⚠️ Mensaje vacío');
        return;
      }

      console.log('📤 Enviando mensaje:', contenido);
      socket.emit('sendMessage', { pedidoId, contenido });
      messageInput.value = '';
    });

    // Indicador de escritura
    const typingIndicator = document.getElementById('typingIndicator');
    let typingTimeout;

    socket.on('typing', ({ userId, typing }) => {
      if (typingIndicator && typing && userId !== usuarioId) {
        typingIndicator.style.display = 'block';
      } else if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
    });

    // Emitir typing
    messageInput.addEventListener('input', () => {
      socket.emit('typing', { pedidoId, typing: true });
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit('typing', { pedidoId, typing: false });
      }, 800);
    });

  } else {
    console.error('❌ Formulario o input de mensajes no encontrados');
  }
}