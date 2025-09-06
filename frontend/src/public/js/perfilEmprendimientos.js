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

  // Construir ubicación legible: "Ciudad, Departamento"
  function construirUbicacion(empr) {
    if (empr && empr.ubicacionEmprendimiento) {
      return empr.ubicacionEmprendimiento.ciudad + ', ' + empr.ubicacionEmprendimiento.departamento;
    } else {
      return '';
    }
  }


  /* ------------------------- Modal Crear Emprendimiento ------------------------- */
  // Se obtiene el id del modal "Crear Emprendimiento" desde el EJS y se crea una instancia de ese modal para poder abrirlo y cerrarlo
  const modalCrearEl = get('modalCrearEmprendimiento');
  const instanciaModalCrear = crearModal(modalCrearEl);

  // Se agrega un evento al "body" para detectar cuando se hace clic en la página.
  document.body.addEventListener('click', (ev) => {
    // Busca si el clic fue en un botón con la clase "open-create-modal"
    const boton = ev.target.closest('.open-create-modal');
    if (!boton) return;

    // Obtiene el input oculto dentro del modal que guardará el id del usuario
    const inputUsuario = get('modal-usuario-id');

    if (!boton.dataset.userId) {
      console.error('El botón no tiene data-user-id válido');
      return;
    }

    // Si el input existe, le asigna el id de usuario que venía en el botón
    if (inputUsuario) {
      inputUsuario.value = boton.dataset.userId;
    }
    // Finalmente, muestra el modal en pantalla
    instanciaModalCrear?.show();
  });

  // Se obtiene el formulario que está dentro del modal de "Crear Emprendimiento"
  const formCrear = get('form-crear-emprendimiento');

  // Se agrega un evento al formulario para cuando se intente enviar
  formCrear?.addEventListener('submit', async (ev) => {

    // Se guardan todos los datos del formulario en un objeto especial "FormData"
    const datos = new FormData(formCrear);

    // Validar que usuario no esté vacío antes de enviar
    if (!datos.get('usuario')) {
      console.error('No se puede crear el emprendimiento: usuario no definido');
      return;
    }

    // Se arma la dirección de la API donde se van a enviar los datos
    const url = `${window.API_BASE_URL}/emprendimientos`;
    try {
      // Se envían los datos a la API con el método POST
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'akalia-api-key': window.API_KEY },
        body: datos
      });
      if (!res.ok) throw new Error(await res.text());
      // Si todo salió bien, se cierra el modal
      instanciaModalCrear?.hide();
      // Opcional: recargar lista o limpiar formulario
    } catch (err) {
      console.error('Error al guardar: ' + (err.message || err));
    }
  });


  /* ------------------------- Modal Ver Detalle ------------------------- */
  // Se crea la instancia del modal "Ver Emprendimiento". Esto permite abrirlo y cerrarlo cuando se necesite.
  const modalVer = crearModal(get('modalVerEmprendimiento'));

  // Función que recibe un emprendimiento y llena los campos del modal con su información
  const rellenarCamposDetalle = (empr) => {
    // Se guardan en un objeto los elementos del DOM que muestran los datos
    const campos = {
      nombre: get('ve-nombre-h4'),
      descripcion: get('ve-descripcion'),
      logo: get('ve-logo'),
      ubicacion: get('ve-ubicacion'),
      fecha: get('ve-fecha'),
      estado: get('ve-estado')
    };

    // Se asigna datos del emprendimiento al campo correspondiente
    if (campos.nombre) campos.nombre.textContent = empr.nombreEmprendimiento;
    if (campos.descripcion) campos.descripcion.textContent = empr.descripcionEmprendimiento || '';
    if (campos.logo) campos.logo.src = empr.logo || '';
    if (campos.ubicacion) campos.ubicacion.textContent = construirUbicacion(empr);

    if (campos.fecha) {
      // Si el emprendimiento tiene una fecha de registro, se convierte a objeto Date
      let fechaObj = null;
      if (empr.fechaRegistro) {
        fechaObj = new Date(empr.fechaRegistro);
      }

      // Validar si la fecha es válida
      if (fechaObj && !isNaN(fechaObj)) {
        campos.fecha.textContent = `Registrado: ${fechaObj.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`;
      } else {
        campos.fecha.textContent = '';
      }
    }

    // Validar si el campo "estado" existe en el DOM
    if (campos.estado) {
      // Se obtiene el valor del estado. Si es null o undefined, por defecto será true (activo).
      const activo = (empr.emprendimientoActivo !== undefined && empr.emprendimientoActivo !== null)
        ? empr.emprendimientoActivo
        : true;

      // asignar el texto y la clase
      if (activo) {
        campos.estado.textContent = 'Activo';
        campos.estado.className = 'badge bg-success';
      } else {
        campos.estado.textContent = 'Inactivo';
        campos.estado.className = 'badge bg-secondary';
      }
    }
  };

  // Abrir modal detalle
  document.body.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('.btn-view-empr');
    if (!btn?.dataset.emprId) return;
    ev.preventDefault();
    try {
      const data = await fetchJSON(`/emprendimiento-detalle/${encodeURIComponent(btn.dataset.emprId)}`, {
        headers: { 'Accept': 'application/json' }
      });
      rellenarCamposDetalle(data.emprendimiento || data);
      modalVer?.show();
    } catch {
      console.error('No fue posible cargar el detalle.');
    }
  });


  /* ------------------------- Modal Editar ------------------------- */
  // Este objeto centraliza todas las referencias(refs) a elementos del DOM relacionados con el modal de edición.
  const refsEditar = {
    modal: document.getElementById('modalEditarEmprendimiento'),
    bsModal: null,
    inputUsuario: document.getElementById('me-usuario-id'),
    inputEmprId: document.getElementById('me-empr-id'),
    campoNombre: document.getElementById('me-nombre'),
    campoDescripcion: document.getElementById('me-descripcion'),
    logoPreview: document.getElementById('me-logo-preview'),
    campoCiudad: document.getElementById('me-ubic-ciudad'),
    campoDepartamento: document.getElementById('me-ubic-departamento'),
    form: document.getElementById('form-editar-emprendimiento-modal')
  };

  // Inicializar modal Bootstrap si existe
  if (refsEditar.modal) {
    refsEditar.bsModal = new bootstrap.Modal(refsEditar.modal);
  }

  // Esta función recibe las referencias del modal y los datos de un emprendimiento, y se encarga de rellenar los inputs con esos datos.
  const rellenarCamposEditar = (refs, empr, idUsuario, idEmpr) => {
    refs.inputUsuario && (refs.inputUsuario.value = idUsuario || '');
    refs.inputEmprId && (refs.inputEmprId.value = idEmpr || '');
    refs.campoNombre && (refs.campoNombre.value = empr.nombreEmprendimiento || '');
    refs.campoDescripcion && (refs.campoDescripcion.value = empr.descripcionEmprendimiento || '');
    refs.logoPreview && (refs.logoPreview.src = empr.logo || '');
    refs.campoCiudad && (refs.campoCiudad.value = empr.ubicacionEmprendimiento?.ciudad || '');
    refs.campoDepartamento && (refs.campoDepartamento.value = empr.ubicacionEmprendimiento?.departamento || '');
  };

  // Construir URL para actualizar
  const construirRutaActualizar = (id) => `${apiBase()}/emprendimientos/${encodeURIComponent(id)}`;

  // Configurar formulario de edición
  const configurarFormularioEditar = (form, url, bsModal, id) => {
    // Escuchar el evento de envío del formulario
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try {
        // Enviar los datos del formulario a la API con método PUT
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'akalia-api-key': window.API_KEY },
          body: new FormData(form)
        });
        // Si la respuesta no es exitosa, lanzar un error con el texto recibido
        if (!res.ok) throw new Error(await res.text().catch(() => 'Error al guardar'));
        // Actualizar la interfaz con los nuevos datos
        actualizarInterfaz(await res.json(), id);
        // Cerrar el modal de edición
        bsModal.hide();
      } catch (err) {
        console.error('No se pudo guardar: ' + err.message);
      }
    });
    // Marcar el formulario como ya configurado para no repetir el listener
    form.__handler = true;
  };

  // Actualizar interfaz tras guardar
  const actualizarInterfaz = (empr, id) => {
    // Buscar el artículo del DOM que tenga el mismo id del emprendimiento
    const art = document.querySelector(`[data-empr-id="${id}"]`)?.closest('article');
    if (!art) return;

    // Actualizar el título con el nombre del emprendimiento
    const h4 = art.querySelector('h4'); if (h4) h4.textContent = empr.nombreEmprendimiento;

    // Actualizar la descripción o poner un texto por defecto
    const p = art.querySelector('p.mb-2'); if (p) p.textContent = empr.descripcionEmprendimiento || 'Sin descripción';

    // Actualizar la ubicación usando la función construirUbicacion
    const span = art.querySelector('span.text-muted.small'); if (span) span.textContent = construirUbicacion(empr);

    // Actualizar la imagen con el logo nuevo o el que ya tenía
    const img = art.querySelector('img'); if (img) img.src = empr.imagenLogo || empr.logo || '';
  };

  // Función principal para abrir modal
  window.editEmprendimiento = async (idUsuario, idEmpr) => {
    // Validar que el modal de edición exista en el DOM
    if (!refsEditar.bsModal) return console.error('Modal de edición no encontrado en el DOM');
    try {
      // Pedir los datos del emprendimiento a la API usando su id
      const data = await fetchJSON(`/emprendimiento-detalle/${encodeURIComponent(idEmpr)}`, { headers: { 'Accept': 'application/json' } });
      // Rellenar los campos del modal con la información recibida
      rellenarCamposEditar(refsEditar, data.emprendimiento || data, idUsuario, idEmpr);
      // Configurar el formulario de edición para que guarde cambios al enviarse
      configurarFormularioEditar(refsEditar.form, construirRutaActualizar(idEmpr), refsEditar.bsModal, idEmpr);
      // Mostrar el modal de edición al usuario
      refsEditar.bsModal.show();
    } catch (err) {
      console.error('Error al abrir modal de edición:', err);
    }
  };

  // hace que el onclick existente funcione
  window.editUserProductDetail = window.editEmprendimiento;


  /* ------------------------- Activar/Inactivar ------------------------- */
  const abrirModalEstado = (modalId, nombreId, idUsuario, idEmpr, nombreEmpr) => {
    // Busca el modal en el DOM
    const modal = get(modalId);

    // Se guardan en el dataset del modal los datos necesarios para la acción (id del emprendimiento y del usuario)
    modal.dataset.emprId = idEmpr || '';
    modal.dataset.userId = idUsuario || '';

    // Se actualiza el texto del span para mostrar el nombre del emprendimiento en el modal
    const spanNombre = get(nombreId);
    if (spanNombre) spanNombre.textContent = nombreEmpr || '';

    // Se crea y abre el modal (Bootstrap Modal)
    crearModal(modal)?.show();
  };

  // Función que asocia un botón a la acción de confirmar el cambio de estado
  function confirmarCambioEstado(btnId, modalId, mensajeId, estado) {
    // Obtiene el botón por su id
    const btn = get(btnId);
    if (!btn) return;

    // Evento click al botón
    btn.addEventListener('click', async function () {
      // Busca el modal correspondiente
      const modal = get(modalId);
      if (!modal) return;

      // Obtiene el ID del emprendimiento desde el modal
      const emprId = modal.dataset.emprId;
      if (!emprId) return console.error(`No se encontró el emprendimiento a ${estado ? 'activar' : 'inactivar'}`);

      btn.disabled = true; // Desactivar botón mientras procesa

      try {
        // Petición PATCH para cambiar estado en el servidor
        await fetchJSON(`${apiBase()}/emprendimientos/${encodeURIComponent(emprId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'akalia-api-key': window.API_KEY
          },
          body: JSON.stringify({ emprendimientoActivo: estado })
        });

        // Busca el artículo relacionado en la interfaz
        const art = document.querySelector(`[data-empr-id="${emprId}"]`)?.closest('article');
        if (art) {
          // Actualiza el estado (Activo/Inactivo)
          const badge = art.querySelector('span.badge');
          if (badge) {
            if (estado) {
              // Si el estado es verdadero → se activa el emprendimiento
              badge.textContent = 'Activo';
              badge.className = 'badge bg-success';
            } else {
              // Si el estado es falso → se inactiva el emprendimiento
              badge.textContent = 'Inactivo';
              badge.className = 'badge bg-secondary';
            }
          }
        } else {
          // Si no encuentra el artículo, recarga la página
          setTimeout(() => location.reload(), 300);
        }

        // Mostrar mensaje de confirmación
        const mensaje = get(mensajeId);
        if (mensaje) {
          mensaje.className = 'alert alert-success';
          mensaje.textContent = `Emprendimiento ${estado ? 'activado' : 'inactivado'} correctamente`;
          mensaje.classList.remove('d-none');
        }

        // Cerrar modal después de 800 ms
        setTimeout(() => bootstrap.Modal.getInstance(modal)?.hide(), 800);

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


  // Abrir modales de confirmación
  window.openInactivarModal = (idUsuario, idEmpr, nombreEmpr) => abrirModalEstado('modalInactivarEmprendimiento', 'modalInactivarNombre', idUsuario, idEmpr, nombreEmpr);
  window.openActivarModal = (idUsuario, idEmpr, nombreEmpr) => abrirModalEstado('modalActivarEmprendimiento', 'modalActivarNombre', idUsuario, idEmpr, nombreEmpr);

  // Configurar botones
  confirmarCambioEstado('btnConfirmInactivar', 'modalInactivarEmprendimiento', 'mensajeEstadoInactivar', false);
  confirmarCambioEstado('btnConfirmActivar', 'modalActivarEmprendimiento', 'mensajeEstadoActivar', true);
});