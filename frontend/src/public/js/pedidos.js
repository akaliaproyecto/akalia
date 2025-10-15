function calcularTotal() {
  const unidades = parseInt(document.getElementById('unidades').value) || 0;
  const precioPactado = parseInt(document.getElementById('precioPactado').value) || 0;
  const total = unidades * precioPactado;

  // Actualizar el campo hidden para el formulario
  document.getElementById('total').value = total;
  // Actualizar el texto visible para el usuario
  document.getElementById('totalVisible').textContent = '$' + total.toLocaleString();
}

// Calcular total al cargar la página
document.addEventListener('DOMContentLoaded', function () {
  calcularTotal();
  
  // Verificar si hay un mensaje de error en la URL (pedido existente)
  const urlParams = new URLSearchParams(window.location.search);
  const errorMsg = urlParams.get('error');
  
  if (errorMsg && typeof mostrarToast === 'function') {
    mostrarToast(decodeURIComponent(errorMsg), 'error');
    
    // Limpiar el parámetro de la URL sin recargar la página
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
});

// Save order function
function saveOrder() {
  alert('Cambios guardados exitosamente');
}

// Cancel order function
function cancelOrder() {
  if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
    document.getElementById('orderStatus').value = 'cancelado';
    alert('Pedido cancelado');
  }
}

// Función para actualizar la dirección del pedido
function actualizarDireccion(pedidoId) {
  const selectDireccion = document.getElementById('direccionEnvio');
  const botonActualizar = event.target;
  // Mostrar loading en el botón
  const textoOriginal = botonActualizar.innerHTML;
  botonActualizar.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Actualizando...';
  botonActualizar.disabled = true;

  // Obtener formulario para enviar la actualización
  const form = document.getElementById('actualizar-direccion-form');

  // Agregar token CSRF si existe
  const csrfToken = document.querySelector('meta[name="csrf-token"]');
  if (csrfToken) {
    const inputCsrf = document.createElement('input');
    inputCsrf.type = 'hidden';
    inputCsrf.name = '_token';
    inputCsrf.value = csrfToken.getAttribute('content');
    form.appendChild(inputCsrf);
  }
  
  // Enviar formulario
  document.body.appendChild(form);
  form.submit();
}

function abrirModalCancelarPedido(pedidoId, usuarioId, rol) {
  const advertencias = document.getElementById("advertencias");
  console.log('ayudapls',usuarioId)
  if(rol === "vendedor") {
    advertencias.innerHTML = `
      <li>No podrás continuar con la venta</li>
      <li>El comprador será notificado de la cancelación</li>
    `;
  } else if (rol === "comprador"){
    advertencias.innerHTML = `
      <li>No podrás continuar con la compra</li>
      <li>El vendedor será notificado de la cancelación</li>
      <li>Deberás crear un nuevo pedido si cambias de opinión</li>
    `;
  }
  // Configurar el botón de confirmación
  const btnConfirmar = document.getElementById('btnConfirmarCancelacion');
  btnConfirmar.onclick = function () {
    cancelarPedidoConfirmado(pedidoId, usuarioId);
  };

  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById('modalCancelarPedido'));
  modal.show();
}

function cancelarPedidoConfirmado(pedidoId,usuarioId) {
  // Mostrar loading en el botón
  const btnConfirmar = document.getElementById('btnConfirmarCancelacion');
  const textoOriginal = btnConfirmar.innerHTML;
  btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Cancelando...';
  btnConfirmar.disabled = true;

  const form = document.getElementById('cacelar-pedido-form')
  // Agregar datos del usuario (como string JSON para el backend)
  const inputUsuario = document.createElement('input');
  inputUsuario.type = 'hidden';
  inputUsuario.name = 'usuario';
  inputUsuario.value = JSON.stringify({ _id: usuarioId });
    console.log('ayudapls',usuarioId)

  form.appendChild(inputUsuario);

  // Agregar flag de cancelación
  const inputCancelado = document.createElement('input');
  inputCancelado.type = 'hidden';
  inputCancelado.name = 'pedidoCancelado';
  inputCancelado.value = 'true';
  form.appendChild(inputCancelado);

  // Agregar token CSRF si existe
  const csrfToken = document.querySelector('meta[name="csrf-token"]');
  if (csrfToken) {
    const inputCsrf = document.createElement('input');
    inputCsrf.type = 'hidden';
    inputCsrf.name = '_token';
    inputCsrf.value = csrfToken.getAttribute('content');
    form.appendChild(inputCsrf);
  }

  // Enviar formulario
  document.body.appendChild(form);
  form.submit();
}
