// Helpers globales
function get(id) {
  return document.getElementById(id);
}

// Configurar modal de confirmación
function abrirModalEliminar(modalId, nombreId, { usuario, id, nombre }) {

  const modal = get(modalId);
  if (!modal) return;
  
  modal.dataset.emprId = id || '';
  modal.dataset.userId = usuario || '';
  
  const spanNombre = get(nombreId);
  if (spanNombre) spanNombre.textContent = nombre || '';

  bootstrap.Modal.getOrCreateInstance(modal).show();
}

// Confirmar cambio de estado (genérico para eliminar o activar)
function configurarBotonConfirmacion({
  btnId, modalId, mensajeId, estado
}) {
  const btn = get(btnId);
  if (!btn) return;

  // Asegurar que el botón tenga solo un listener
  btn.replaceWith(btn.cloneNode(true));
  const newBtn = get(btnId);

  newBtn.addEventListener('click', async () => {
    const modal = get(modalId);
    if (!modal) return;

    const emprId = modal.dataset.emprId;
    const userId = modal.dataset.userId;

    newBtn.disabled = true;

    try {
      await fetch(`/emprendimiento/eliminar/${emprId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEmprendimiento: emprId,
          usuario: userId,
          emprendimientoEliminado: estado
        })
      });

      const mensaje = get(mensajeId);
      if (mensaje) {
        mensaje.className = 'alert alert-success';
        mensaje.textContent = `Emprendimiento ${estado ? 'eliminado' : 'activado'} correctamente`;
        mensaje.classList.remove('d-none');
      }

      setTimeout(() => {
        bootstrap.Modal.getInstance(modal)?.hide();
        window.location.href = userId
          ? `/usuario-emprendimientos/${userId}`
          : window.location.href;
      }, 800);

    } catch (err) {
      console.error(`Error al ${estado ? 'eliminar' : 'activar'}:`, err);
      alert(`No se pudo ${estado ? 'eliminar' : 'activar'} el emprendimiento.`);
    } finally {
      newBtn.disabled = false;
    }
  });
}

// API global para abrir modal desde íconos
window.eliminarEmprendimiento = (usuario, id, nombre) => {
  abrirModalEliminar('modalEliminarEmprendimiento', 'nombreEmprendimientoBorrando', {
    usuario, id, nombre
  });
};

// Inicializar listeners cuando el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
  configurarBotonConfirmacion({
    btnId: 'btnConfirmEliminar',
    modalId: 'modalEliminarEmprendimiento',
    mensajeId: 'mensajeEstadoEliminar',
    estado: true // true = eliminar
  });
});

  /* ------------------------- Modal Crear Emprendimiento ------------------------- */
  async function crearEmprendimiento(idUsuario) {
  try {
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalCrearEmprendimiento'));
    modal.show();
  } catch (err) {
    console.error("Error cargando modal:", err);
  }
}

 /* ------------------------- Modal EDITAR Emprendimiento ------------------------- */
async function editEmprendimiento(idUsuario, idEmprendimiento) {
  try {
    const usuario = idUsuario;
    
    const response = await fetch(`/emprendimiento-detalle/${encodeURIComponent(idEmprendimiento)}`, { headers: { 'Accept': 'application/json' } });
    const data = await response.json();
    
    document.getElementById('me-usuario-id').value = idUsuario;
    document.getElementById('me-empr-id').value = idEmprendimiento;
    document.getElementById('me-nombre').value = data.emprendimiento.nombreEmprendimiento || '';
    document.getElementById('me-descripcion').value = data.emprendimiento.descripcionEmprendimiento || '';
    document.getElementById('me-ubic-ciudad').value = data.emprendimiento.ubicacionEmprendimiento?.ciudad || '';
    document.getElementById('me-ubic-departamento').value = data.emprendimiento.ubicacionEmprendimiento?.departamento || '';

    // Estado actual
    const selectActivo = document.getElementById('me-activo');
    if (typeof data.emprendimiento.emprendimientoActivo === 'boolean') {
      selectActivo.value = data.emprendimiento.emprendimientoActivo ? "true" : "false";
    } else {
      selectActivo.value = "";
    }

    // Logo actual
    const logoPreview = document.getElementById('me-logo-preview');
    logoPreview.src = data.emprendimiento.logo || '';
    logoPreview.style.display = data.emprendimiento.logo ? 'block' : 'none';

    // Action del form
    const form = document.getElementById('form-editar-emprendimiento-modal');
    form.action = `http://localhost:3000/emprendimiento-editar/${idEmprendimiento}`;
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarEmprendimiento'));
    modal.show();

  } catch (err) {
    console.error("Error cargando datos:", err);
  }
}
