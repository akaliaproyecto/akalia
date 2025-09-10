document.addEventListener('DOMContentLoaded', () => {

  /* Este conjunto de funciones auxiliares (helpers) simplifica tareas comunes en la aplicación, evitando código repetitivo y facilitando la interacción con el DOM, modales, y la API. */
  /* ------------------------- Helpers ------------------------- */
  //get(id) - Devuelve el elemento del DOM que tiene el id especificado
  const get = (id) => document.getElementById(id);

  //crearModal(el) - Crea y devuelve un modal de Bootstrap si el elemento existe, si no, devuelve null
  const crearModal = (el) => {
    if (el) {
      return new bootstrap.Modal(el);
    } else {
      return null;
    }
  };

  //apiBase() - Devuelve la URL base de la API, usando una variable global ... window es un objeto global que representa la ventana del navegador donde se ejecuta el código.
  const apiBase = () => window.API_BASE_URL

  // Función genérica para hacer fetch (solicitud HTTP a 'url') y devolver JSON
  async function fetchJSON(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    if (!respuesta.ok) {
      const mensaje = await respuesta.text().catch(() => 'Error');
      throw new Error(mensaje);
    }
    return respuesta.json();
  }

  // Función que asocia un botón a la acción de eliminacion logica
  function confirmarCambioEstado(btnId, modalId, mensajeId, estado) {
    // Obtiene el botón por su id
    const btn = get(btnId);
    if (!btn) return;
    // Evento click al botón
    btn.addEventListener('click', async function () {
  // ...existing code...
  const modal = get(modalId);
  const emprId = modal.dataset.emprId;
  try {
    // Enviar POST al SSR (no PATCH directo al backend)
    await fetch(`/emprendimiento/eliminar/${emprId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idEmprendimiento: emprId,
        usuario: modal.dataset.userId, // si necesitas el usuario
        emprendimientoEliminado: estado
      })
    });
        // Mostrar mensaje de confirmación
        const mensaje = get(mensajeId);
        if (mensaje) {
          mensaje.className = 'alert alert-success';
          mensaje.textContent = `Emprendimiento eliminado correctamente`;
          mensaje.classList.remove('d-none');
        }

        // Cerrar modal después de 800 ms
          setTimeout(() => {
            bootstrap.Modal.getInstance(modal)?.hide();
            // Redirigir a la página de listado de emprendimientos después de cerrar el modal
            const userId = modal.dataset.userId;
            if (userId) {
              window.location.href = `/usuario-emprendimientos/${userId}`;
            } else {
              window.location.reload();
            }
          }, 800);

      } catch (err) {
        // Captura errores en la petición
        console.error(`Error al ${estado ? 'activar' : 'inactivar'}:`, err);
        console.error(`No fue posible ${estado ? 'activar' : 'inactivar'}: ${err.message || err}`);
      } finally {
        // Reactivar botón
        btn.disabled = false;
      }
    });
  }


  /* ELIMINACION LOGICA */
  const abrirModalEliminar = (modalId, nombreId, idUsuario, idEmpr, nombreEmpr) => {
    // Busca el modal en el DOM
    const modal = get(modalId);
    console.log(idEmpr)
    // Se guardan en el dataset del modal los datos necesarios para la acción (id del emprendimiento y del usuario)
    modal.dataset.emprId = idEmpr || '';
    modal.dataset.userId = idUsuario || '';

    // Se actualiza el texto del span para mostrar el nombre del emprendimiento en el modal
    const spanNombre = get(nombreId);
    if (spanNombre) spanNombre.textContent = nombreEmpr || '';

    // Se crea y abre el modal (Bootstrap Modal)
    crearModal(modal)?.show();
  };

  // Abrir modales de confirmación
  window.eliminarEmprendimiento = (idUsuario, idEmpr, nombreEmpr) => abrirModalEliminar('modalEliminarEmprendimiento', 'modalInactivarNombre', idUsuario, idEmpr, nombreEmpr);

  // Configurar botones
  confirmarCambioEstado('btnConfirmEliminar', 'modalEliminarEmprendimiento', 'mensajeEstadoEliminar', false);


  
});

 /* ------------------------- Pagina mostrar Emprendimiento ------------------------- */
 function showEmprendimientoDetail(idEmprendimiento) {
  window.location.href = `/emprendimiento-detalle/${idEmprendimiento}`;
}

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
