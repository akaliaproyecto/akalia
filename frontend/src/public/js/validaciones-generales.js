/* Validaciones de formularios - Contacto y otros formularios generales */
document.addEventListener('DOMContentLoaded', () => {
  
  // ===============================
  // FUNCIONES UTILITARIAS COMUNES
  // ===============================
  
  // Funciones de validación compartidas
  function mostrarError(campo, elementoError, mensaje) {
    campo.classList.add('is-invalid');
    campo.classList.remove('is-valid');
    if (elementoError) {
      elementoError.textContent = mensaje;
      elementoError.style.display = 'block';
    }
  }

  function mostrarExito(campo, elementoError) {
    campo.classList.add('is-valid');
    campo.classList.remove('is-invalid');
    if (elementoError) {
      elementoError.textContent = '';
      elementoError.style.display = 'none';
    }
  }

  // Validación de formato de email (reutilizable)
  function validarFormatoEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }

  // ===============================
  // VALIDACIONES DEL FORMULARIO DE CONTACTO
  // ===============================
  const formularioContacto = document.querySelector('form'); // El formulario en contactanos.ejs
  
  if (formularioContacto && window.location.pathname.includes('contactanos')) {
    // Agregar ID al formulario si no lo tiene
    if (!formularioContacto.id) {
      formularioContacto.id = 'form-contacto';
    }
    
    // Elementos del formulario
    const campoMensaje = document.getElementById('mensaje');
    const campoCorreo = document.getElementById('correo');
    
    // Elementos de error (crear si no existen)
    let errorMensaje = document.getElementById('mensajeError');
    let errorCorreo = document.getElementById('correoError');
    
    // Crear elementos de error si no existen
    if (!errorMensaje && campoMensaje) {
      errorMensaje = document.createElement('div');
      errorMensaje.id = 'mensajeError';
      errorMensaje.className = 'invalid-feedback';
      campoMensaje.parentNode.appendChild(errorMensaje);
    }
    
    if (!errorCorreo && campoCorreo) {
      errorCorreo = document.createElement('div');
      errorCorreo.id = 'correoError';
      errorCorreo.className = 'invalid-feedback';
      campoCorreo.parentNode.appendChild(errorCorreo);
    }
    
    // Funciones de validación
    function validarMensajeContacto() {
      const mensaje = campoMensaje.value.trim();
      
      if (!mensaje) {
        mostrarError(campoMensaje, errorMensaje, 'El mensaje es obligatorio');
        return false;
      }
      
      if (mensaje.length < 10) {
        mostrarError(campoMensaje, errorMensaje, 'El mensaje debe tener al menos 10 caracteres');
        return false;
      }
      
      if (mensaje.length > 1000) {
        mostrarError(campoMensaje, errorMensaje, 'El mensaje no puede superar los 1000 caracteres');
        return false;
      }
      
      mostrarExito(campoMensaje, errorMensaje);
      return true;
    }
    
    function validarCorreoContacto() {
      const correo = campoCorreo.value.trim();
      
      if (!correo) {
        mostrarError(campoCorreo, errorCorreo, 'El correo electrónico es obligatorio');
        return false;
      }
      
      if (!validarFormatoEmail(correo)) {
        mostrarError(campoCorreo, errorCorreo, 'Por favor, ingresa un correo electrónico válido');
        return false;
      }
      
      mostrarExito(campoCorreo, errorCorreo);
      return true;
    }
    
    // Event listeners para validación en tiempo real
    if (campoMensaje) {
      campoMensaje.addEventListener('blur', validarMensajeContacto);
      campoMensaje.addEventListener('input', () => {
        const mensaje = campoMensaje.value.trim();
        if (mensaje.length > 1000) {
          validarMensajeContacto();
        }
      });
    }
    
    if (campoCorreo) {
      campoCorreo.addEventListener('blur', validarCorreoContacto);
    }
    
    // Validación al enviar el formulario
    formularioContacto.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      
      // Ejecutar todas las validaciones
      const validaciones = [];
      
      if (campoMensaje) validaciones.push(validarMensajeContacto());
      if (campoCorreo) validaciones.push(validarCorreoContacto());
      
      // Verificar si todas las validaciones pasaron
      const todasValidas = validaciones.every(valida => valida === true);
      
      if (!todasValidas) {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        } else {
          alert('Por favor, corrige los errores en el formulario');
        }
        return;
      }
      
      // Si todas las validaciones pasaron
      if (typeof mostrarToast === 'function') {
        mostrarToast('Enviando mensaje...', 'info');
      }
      
      // Aquí se enviaría el formulario o se haría la petición AJAX
      // Por ahora simularemos el envío
      setTimeout(() => {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Mensaje enviado correctamente. Te responderemos pronto.', 'success');
        } else {
          alert('Mensaje enviado correctamente. Te responderemos pronto.');
        }
        
        // Limpiar formulario
        formularioContacto.reset();
        // Remover clases de validación
        document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
          el.classList.remove('is-valid', 'is-invalid');
        });
      }, 1000);
    });
  }

  // ===============================
  // VALIDACIONES PARA MENSAJES EN PEDIDOS
  // ===============================
  const formularioMensajePedido = document.getElementById('form-mensaje-pedido');
  
  if (formularioMensajePedido) {
    const campoMensajePedido = document.getElementById('contenidoMensaje');
    let errorMensajePedido = document.getElementById('contenidoMensajeError');
    
    if (!errorMensajePedido && campoMensajePedido) {
      errorMensajePedido = document.createElement('div');
      errorMensajePedido.id = 'contenidoMensajeError';
      errorMensajePedido.className = 'invalid-feedback';
      campoMensajePedido.parentNode.appendChild(errorMensajePedido);
    }
    
    function validarMensajePedido() {
      const mensaje = campoMensajePedido.value.trim();
      
      if (!mensaje) {
        mostrarError(campoMensajePedido, errorMensajePedido, 'El mensaje no puede estar vacío');
        return false;
      }
      
      if (mensaje.length > 1000) {
        mostrarError(campoMensajePedido, errorMensajePedido, 'El mensaje no puede tener más de 1000 caracteres');
        return false;
      }
      
      mostrarExito(campoMensajePedido, errorMensajePedido);
      return true;
    }
    
    if (campoMensajePedido) {
      campoMensajePedido.addEventListener('blur', validarMensajePedido);
      campoMensajePedido.addEventListener('input', () => {
        const mensaje = campoMensajePedido.value.trim();
        if (mensaje.length > 1000) {
          validarMensajePedido();
        }
      });
    }
    
    formularioMensajePedido.addEventListener('submit', (evento) => {
      evento.preventDefault();
      
      if (!validarMensajePedido()) {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Por favor, corrige los errores en el mensaje', 'error');
        }
        return;
      }
      
      if (typeof mostrarToast === 'function') {
        mostrarToast('Enviando mensaje...', 'info');
      }
      
      formularioMensajePedido.submit();
    });
  }

  // ===============================
  // VALIDACIONES PARA REPORTES
  // ===============================
  const formularioReporte = document.getElementById('form-reporte');
  
  if (formularioReporte) {
    const campoMotivoReporte = document.getElementById('motivoReporte');
    const campoDescripcionReporte = document.getElementById('descripcionReporte');
    
    let errorMotivoReporte = document.getElementById('motivoReporteError');
    let errorDescripcionReporte = document.getElementById('descripcionReporteError');
    
    // Crear elementos de error si no existen
    if (!errorMotivoReporte && campoMotivoReporte) {
      errorMotivoReporte = document.createElement('div');
      errorMotivoReporte.id = 'motivoReporteError';
      errorMotivoReporte.className = 'invalid-feedback';
      campoMotivoReporte.parentNode.appendChild(errorMotivoReporte);
    }
    
    if (!errorDescripcionReporte && campoDescripcionReporte) {
      errorDescripcionReporte = document.createElement('div');
      errorDescripcionReporte.id = 'descripcionReporteError';
      errorDescripcionReporte.className = 'invalid-feedback';
      campoDescripcionReporte.parentNode.appendChild(errorDescripcionReporte);
    }
    
    function validarMotivoReporte() {
      const motivo = campoMotivoReporte.value.trim();
      
      if (!motivo) {
        mostrarError(campoMotivoReporte, errorMotivoReporte, 'Debe seleccionar un motivo de reporte');
        return false;
      }
      
      const motivosValidos = [
        'producto_no_recibido',
        'producto_danado', 
        'producto_no_corresponde',
        'incumplimiento_plazos',
        'trato_inadecuado',
        'actividad_fraudulenta',
        'spam_publicidad'
      ];
      
      if (!motivosValidos.includes(motivo)) {
        mostrarError(campoMotivoReporte, errorMotivoReporte, 'Motivo de reporte no válido');
        return false;
      }
      
      mostrarExito(campoMotivoReporte, errorMotivoReporte);
      return true;
    }
    
    function validarDescripcionReporte() {
      const descripcion = campoDescripcionReporte.value.trim();
      
      if (!descripcion) {
        mostrarError(campoDescripcionReporte, errorDescripcionReporte, 'La descripción del reporte es obligatoria');
        return false;
      }
      
      if (descripcion.length < 20) {
        mostrarError(campoDescripcionReporte, errorDescripcionReporte, 'La descripción debe tener al menos 20 caracteres');
        return false;
      }
      
      if (descripcion.length > 500) {
        mostrarError(campoDescripcionReporte, errorDescripcionReporte, 'La descripción no puede superar los 500 caracteres');
        return false;
      }
      
      mostrarExito(campoDescripcionReporte, errorDescripcionReporte);
      return true;
    }
    
    // Event listeners
    if (campoMotivoReporte) {
      campoMotivoReporte.addEventListener('change', validarMotivoReporte);
    }
    
    if (campoDescripcionReporte) {
      campoDescripcionReporte.addEventListener('blur', validarDescripcionReporte);
      campoDescripcionReporte.addEventListener('input', () => {
        const descripcion = campoDescripcionReporte.value.trim();
        if (descripcion.length > 500 || descripcion.length < 20) {
          validarDescripcionReporte();
        }
      });
    }
    
    formularioReporte.addEventListener('submit', (evento) => {
      evento.preventDefault();
      
      const validaciones = [];
      
      if (campoMotivoReporte) validaciones.push(validarMotivoReporte());
      if (campoDescripcionReporte) validaciones.push(validarDescripcionReporte());
      
      const todasValidas = validaciones.every(valida => valida === true);
      
      if (!todasValidas) {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        }
        return;
      }
      
      if (typeof mostrarToast === 'function') {
        mostrarToast('Enviando reporte...', 'info');
      }
      
      formularioReporte.submit();
    });
  }
});
