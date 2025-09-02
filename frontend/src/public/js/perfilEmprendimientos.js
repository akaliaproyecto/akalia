document.addEventListener('DOMContentLoaded', function () {
  // Seleccionar elementos
  const modalEl = document.getElementById('modalCrearEmprendimiento');
  // Si no existe el modal (página diferente), salir
  if (!modalEl) return;

  // Inicializar instancia Bootstrap Modal
  const bsModal = new bootstrap.Modal(modalEl);

  // Abrir modal cuando se hace click en cualquier elemento con .open-create-modal
  document.querySelectorAll('.open-create-modal').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const userId = this.dataset.user || '';
      // Poner id de usuario en el campo hidden del modal
      const inputUsuario = document.getElementById('modal-usuario-id');
      if (inputUsuario) inputUsuario.value = userId;
      // Limpiar el formulario (básico)
      const form = document.getElementById('form-crear-emprendimiento');
      if (form) form.reset();
      // Mostrar modal
      bsModal.show();
    });
  });

  // Enviar formulario con fetch usando FormData
  const formCrear = document.getElementById('form-crear-emprendimiento');
  formCrear.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitBtn = formCrear.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Construir FormData (incluye archivo si el usuario lo selecciona)
    const formData = new FormData(formCrear);

    // ---------------------------------------------------
    // Usamos la URL de la API inyectada en la plantilla (window.API_BASE_URL)
    // Esta es una solución simple para que el frontend llame al backend correcto.
    // ---------------------------------------------------
    const apiBase = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
    const urlApi = `${apiBase.replace(/\/$/, '')}/emprendimientos`;

    // Header con API key (no ponemos Content-Type para FormData)
    const headers = {
      'akalia-api-key': window.API_KEY || ''
    };

    fetch(urlApi, {
      method: 'POST',
      headers, // sólo header con la API key
      body: formData
    })
      .then(async res => {
        if (!res.ok) {
          // Intentamos leer texto del servidor para mostrar información de error
          let texto = '';
          try { texto = await res.text(); } catch (e) { texto = 'Error desconocido'; }
          throw new Error(texto || 'Error al crear emprendimiento');
        }
        return res.json();
      })
      .then(data => {
        // Éxito: cerrar modal y recargar para mostrar nuevos datos
        bsModal.hide();
        setTimeout(() => location.reload(), 300);
      })
      .catch(err => {
        // Mensaje simple para el estudiante
        alert('Error al guardar: ' + (err.message || err));
        if (submitBtn) submitBtn.disabled = false;
      });
  });
});
