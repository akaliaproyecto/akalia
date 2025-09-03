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

  // ---------------------------
  // Nueva lógica: modal detalle
  // ---------------------------
  const modalVerEl = document.getElementById('modalVerEmprendimiento');
  let bsModalVer = null;
  if (modalVerEl) bsModalVer = new bootstrap.Modal(modalVerEl);

  // delegación: escucha clicks en botones con clase .btn-view-empr
  document.body.addEventListener('click', async function (ev) {
    const btn = ev.target.closest && ev.target.closest('.btn-view-empr');
    if (!btn) return;
    ev.preventDefault();

    const emprId = btn.dataset.emprId;
    if (!emprId) {
      console.error('No se encontró data-empr-id en el botón');
      return;
    }

    // mostrar carga mínima
    const nombreH4 = document.getElementById('ve-nombre-h4');
    const descripcionEl = document.getElementById('ve-descripcion');
    const logoEl = document.getElementById('ve-logo');
    const ubicEl = document.getElementById('ve-ubicacion');
    const fechaEl = document.getElementById('ve-fecha');
    const estadoEl = document.getElementById('ve-estado');
    const productosBody = document.getElementById('ve-productos-body');
    const noProductos = document.getElementById('ve-no-productos');

    if (nombreH4) nombreH4.textContent = 'Cargando...';
    if (descripcionEl) descripcionEl.textContent = '';
    if (logoEl) logoEl.src = '/images/default-logo.png';
    if (productosBody) productosBody.innerHTML = '';
    if (noProductos) noProductos.classList.add('d-none');

    // petición al backend (ruta proxy que añadiremos)
    try {
      const resp = await fetch(`/emprendimiento-detalle/${encodeURIComponent(emprId)}`, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error('Error en la petición: ' + resp.status);
      const json = await resp.json();

      const emprendimiento = json.emprendimiento || json;
      const productos = Array.isArray(json.productos) ? json.productos : (emprendimiento.productos || []);

      // rellenar campos
      if (nombreH4) nombreH4.textContent = emprendimiento.nombreEmprendimiento || emprendimiento.nombre || 'Sin nombre';
      if (document.getElementById('ve-nombre')) document.getElementById('ve-nombre').textContent = emprendimiento.nombreEmprendimiento || emprendimiento.nombre || 'Detalle';
      if (descripcionEl) descripcionEl.textContent = emprendimiento.descripcionEmprendimiento || emprendimiento.descripcionNegocio || '';
      if (logoEl) {
        logoEl.src = emprendimiento.logo || emprendimiento.imagenLogo || '/images/default-logo.png';
        logoEl.onerror = function () { this.src = '/images/default-logo.png'; };
      }
      // ubicación / fecha / estado
      const ubicText = (emprendimiento.ubicacionEmprendimiento && (emprendimiento.ubicacionEmprendimiento.ciudad || emprendimiento.ubicacionEmprendimiento.departamento))
        ? `${emprendimiento.ubicacionEmprendimiento.ciudad || ''}${emprendimiento.ubicacionEmprendimiento.ciudad ? ', ' : ''}${emprendimiento.ubicacionEmprendimiento.departamento || ''}`
        : (emprendimiento.ubicacion || '');
      if (ubicEl) ubicEl.textContent = ubicText;
      if (fechaEl) {
        const f = emprendimiento.fechaRegistro ? new Date(emprendimiento.fechaRegistro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        fechaEl.textContent = f ? `Registrado: ${f}` : '';
      }
      if (estadoEl) {
        const activo = emprendimiento.emprendimientoActivo !== undefined ? emprendimiento.emprendimientoActivo : emprendimiento.activo;
        estadoEl.textContent = activo ? 'Activo' : 'Inactivo';
        estadoEl.className = `badge ${activo ? 'bg-success' : 'bg-secondary'}`;
      }

      // redes sociales: eliminado (no se usa en esta aplicación)

      // productos
      productosBody.innerHTML = '';
      if (Array.isArray(productos) && productos.length) {
        productos.forEach(p => {
          const tr = document.createElement('tr');

          const tdImg = document.createElement('td');
          const img = document.createElement('img');
          img.src = p.urlImagen || p.imagen || '/images/default-product.png';
          img.className = 'img-producto';
          img.style = 'width:64px;height:64px;object-fit:cover;border:1px solid #e3e3e3;padding:2px;border-radius:4px;';
          img.onerror = function () { this.src = '/images/default-product.png'; };
          tdImg.appendChild(img);

          const tdTitulo = document.createElement('td');
          tdTitulo.textContent = p.tituloProducto || p.titulo || p.nombreProducto || '-';

          const tdEmpr = document.createElement('td');
          tdEmpr.textContent = p.nombreEmprendimiento || emprendimiento.nombreEmprendimiento || '';

          const tdPrecio = document.createElement('td');
          tdPrecio.textContent = p.precio ? ('$' + p.precio) : (p.valor ? ('$' + p.valor) : '-');

          const tdAcc = document.createElement('td');
          tdAcc.innerHTML = '<div class="acciones-producto"><button class="btn-icon btn" title="Ver producto"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 20" fill="none"><path d="M28 10C28 10 22.75 0.375 14 0.375C5.25 0.375 0 10 0 10C0 10 5.25 19.625 14 19.625C22.75 19.625 28 10 28 10ZM2.05275 10C2.89762 8.71303 3.87094 7.51514 4.95775 6.42475C7.21 4.169 10.29 2.125 14 2.125C17.71 2.125 20.7882 4.169 23.044 6.42475C24.1308 7.51514 25.1041 8.71303 25.949 10C25.8487 10.1517 25.7349 10.3197 25.6077 10.504C25.0215 11.344 24.1553 12.464 23.044 13.5753C20.7882 15.831 17.7083 17.875 14 17.875C10.2917 17.875 7.21175 15.831 4.956 13.5753C3.86919 12.4849 2.89762 11.287 2.05275 10Z" fill="currentColor"/></svg></button></div>';

          tr.appendChild(tdImg);
          tr.appendChild(tdTitulo);
          tr.appendChild(tdEmpr);
          tr.appendChild(tdPrecio);
          tr.appendChild(tdAcc);

          productosBody.appendChild(tr);
        });
      } else {
        if (noProductos) noProductos.classList.remove('d-none');
      }

      // mostrar modal
      if (bsModalVer) bsModalVer.show();
    } catch (err) {
      console.error('Error cargando detalle:', err);
      alert('No fue posible cargar el detalle. Revisa consola.');
    }
  });

  // ---------------------------
  // Nueva lógica: Editar emprendimiento en modal (función pública simple)
  // ---------------------------
  // Explicación: Esta función será llamada desde el atributo onclick del botón "lápiz".
  // Recibe el id del usuario y el id del emprendimiento, pide al backend la información
  // y rellena el formulario dentro del modal de edición creado en la vista EJS.
  window.editUserProductDetail = async function (idUsuario, idEmprendimiento) {
    try {
      // Obtener referencias a elementos del modal
      const modalEditarEl = document.getElementById('modalEditarEmprendimiento');
      if (!modalEditarEl) {
        console.error('No existe el modal de edición en la página');
        return;
      }

      // Inicializar instancia bootstrap (si no existe ya)
      const bsModalEditar = new bootstrap.Modal(modalEditarEl);

      // Referencias a los campos del formulario
      const inputUsuario = document.getElementById('me-usuario-id');
      const inputEmprId = document.getElementById('me-empr-id');
      const campoNombre = document.getElementById('me-nombre');
      const campoDescripcion = document.getElementById('me-descripcion');
      const logoPreview = document.getElementById('me-logo-preview');
      const campoCiudad = document.getElementById('me-ubic-ciudad');
      const campoDepartamento = document.getElementById('me-ubic-departamento');
      const formModal = document.getElementById('form-editar-emprendimiento-modal');

      // Mostrar texto de carga simple mientras se obtiene la info
      campoNombre.value = 'Cargando...';
      campoDescripcion.value = '';
      logoPreview.src = '/images/default-logo.png';
      if (campoCiudad) campoCiudad.value = '';
      if (campoDepartamento) campoDepartamento.value = '';

      // Llamada al backend para traer datos del emprendimiento
      // Usamos la ruta proxy que ya existe para detalle (misma que usa la vista de ver)
      const respuesta = await fetch(`/emprendimiento-detalle/${encodeURIComponent(idEmprendimiento)}`, { headers: { 'Accept': 'application/json' } });
      if (!respuesta.ok) throw new Error('Error al obtener datos: ' + respuesta.status);
      const datos = await respuesta.json();
      const emprendimiento = datos.emprendimiento || datos;

      // Rellenar campos con datos recibidos (nombres en español y claros)
      if (inputUsuario) inputUsuario.value = idUsuario || '';
      if (inputEmprId) inputEmprId.value = idEmprendimiento || '';
      if (campoNombre) campoNombre.value = emprendimiento.nombreEmprendimiento || emprendimiento.nombre || '';
      if (campoDescripcion) campoDescripcion.value = emprendimiento.descripcionEmprendimiento || emprendimiento.descripcionNegocio || '';
      if (logoPreview) logoPreview.src = emprendimiento.imagenLogo || emprendimiento.logo || '/images/default-logo.png';
      // Rellenar ubicación si está disponible
      if (campoCiudad) campoCiudad.value = (emprendimiento.ubicacionEmprendimiento && emprendimiento.ubicacionEmprendimiento.ciudad) ? emprendimiento.ubicacionEmprendimiento.ciudad : (emprendimiento.ubicacion && emprendimiento.ubicacion.ciudad) || '';
      if (campoDepartamento) campoDepartamento.value = (emprendimiento.ubicacionEmprendimiento && emprendimiento.ubicacionEmprendimiento.departamento) ? emprendimiento.ubicacionEmprendimiento.departamento : (emprendimiento.ubicacion && emprendimiento.ubicacion.departamento) || '';

      // campos de redes eliminados (no se usan)

      // Ajustar ruta de actualización: usamos el endpoint PUT /emprendimientos/:id del backend
      const apiBase = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000`;
      const rutaActualizar = `${apiBase.replace(/\/$/, '')}/emprendimientos/${encodeURIComponent(idEmprendimiento)}`;

      // Manejar envío del formulario desde el modal (enviar FormData con archivo)
      // Nota: usamos FormData para poder enviar archivo (logo) y campos normales.
      if (formModal && !formModal.__perfil_emprendimiento_handler) {
        formModal.addEventListener('submit', async function (ev) {
          ev.preventDefault();

          // Botón enviar - lo deshabilitamos mientras ocurre la petición
          const botonEnviar = formModal.querySelector('button[type="submit"]');
          if (botonEnviar) botonEnviar.disabled = true;

          // Construir FormData desde el formulario (incluye archivo si el usuario lo seleccionó)
          const datosParaEnviar = new FormData(formModal);

          try {
            // Header con API key (no ponemos Content-Type para FormData)
            const headers = { 'akalia-api-key': window.API_KEY || '' };

            // Petición PUT al backend para actualizar el emprendimiento
            const respuestaGuardar = await fetch(rutaActualizar, { method: 'PUT', headers, body: datosParaEnviar });

            if (!respuestaGuardar.ok) {
              const textoError = await respuestaGuardar.text().catch(() => 'Error al guardar');
              throw new Error(textoError || 'Error al guardar');
            }

            // Leer el emprendimiento actualizado devuelto por el servidor
            const emprendimientoActualizado = await respuestaGuardar.json();

            // --------------------------------------
            // Actualizar la interfaz sin recargar
            // --------------------------------------
            // Buscamos el botón de "ver" que tiene data-empr-id y desde ahí obtenemos el artículo
            const botonVer = document.querySelector(`[data-empr-id="${idEmprendimiento}"]`);
            const articulo = botonVer ? botonVer.closest('article') : null;

            if (articulo) {
              // Actualizar nombre
              const encabezadoNombre = articulo.querySelector('h4');
              if (encabezadoNombre) encabezadoNombre.textContent = emprendimientoActualizado.nombreEmprendimiento || emprendimientoActualizado.nombre || '';

              // Actualizar descripción (si existe un párrafo, lo reemplazamos; si no, lo creamos)
              let parrafoDesc = articulo.querySelector('p.mb-2');
              const textoDesc = emprendimientoActualizado.descripcionEmprendimiento || emprendimientoActualizado.descripcionNegocio || '';
              if (parrafoDesc) {
                parrafoDesc.textContent = textoDesc || 'Sin descripción disponible';
              } else {
                parrafoDesc = document.createElement('p');
                parrafoDesc.className = 'mb-2';
                parrafoDesc.textContent = textoDesc || 'Sin descripción disponible';
                // insertamos antes de la ubicación si existe
                const contInfo = articulo.querySelector('.d-flex.flex-column.justify-content-center');
                if (contInfo) contInfo.insertBefore(parrafoDesc, contInfo.firstChild);
              }

              // Actualizar ubicación (primera etiqueta span.text-muted.small dentro del article)
              const spansMuted = articulo.querySelectorAll('span.text-muted.small');
              const textoUbic = (emprendimientoActualizado.ubicacionEmprendimiento && (emprendimientoActualizado.ubicacionEmprendimiento.ciudad || emprendimientoActualizado.ubicacionEmprendimiento.departamento))
                ? `${emprendimientoActualizado.ubicacionEmprendimiento.ciudad || ''}${emprendimientoActualizado.ubicacionEmprendimiento.ciudad ? ', ' : ''}${emprendimientoActualizado.ubicacionEmprendimiento.departamento || ''}`
                : (emprendimientoActualizado.ubicacion || '');
              if (spansMuted && spansMuted.length > 0) {
                // asumimos que el primer span es la ubicación
                spansMuted[0].textContent = textoUbic;
              }

              // Actualizar logo (primera imagen dentro del article)
              const imagenArticulo = articulo.querySelector('img');
              if (imagenArticulo && (emprendimientoActualizado.imagenLogo || emprendimientoActualizado.logo)) {
                imagenArticulo.src = emprendimientoActualizado.imagenLogo || emprendimientoActualizado.logo;
              }
            } else {
              // Si no encontramos el artículo, recargamos la página como fallback
              setTimeout(() => location.reload(), 300);
            }

            // Cerrar modal
            bsModalEditar.hide();
          } catch (error) {
            // Mostrar error simple para el estudiante
            alert('No se pudo guardar: ' + (error.message || error));
            if (botonEnviar) botonEnviar.disabled = false;
          }
        });
        // Marcar que ya se añadió el manejador para evitar duplicados
        formModal.__perfil_emprendimiento_handler = true;
      }

      // Mostrar modal
      bsModalEditar.show();

    } catch (err) {
      console.error('Error al abrir modal de edición:', err);
      alert('No fue posible cargar el formulario de edición. Revisa la consola.');
    }
  };

  // ---------------------------
  // Lógica para inactivar emprendimientos (modal de confirmación)
  // ---------------------------
  // Abrir modal de inactivación y mostrar nombre
  window.openInactivarModal = function (idUsuario, idEmprendimiento, nombreEmpr) {
    const modalEl = document.getElementById('modalInactivarEmprendimiento');
    if (!modalEl) {
      console.error('No existe modal de inactivación en la página');
      return;
    }
    // Guardar datos en atributos para usar luego
    modalEl.dataset.emprId = idEmprendimiento || '';
    modalEl.dataset.userId = idUsuario || '';
    const nombreSpan = document.getElementById('modalInactivarNombre');
    if (nombreSpan) nombreSpan.textContent = nombreEmpr || '';
    const bs = new bootstrap.Modal(modalEl);
    bs.show();
  };

  // Confirmar inactivación: mandar PATCH para establecer emprendimientoActivo = false
  const btnConfirmInactivar = document.getElementById('btnConfirmInactivar');
  if (btnConfirmInactivar) {
    btnConfirmInactivar.addEventListener('click', async function () {
      const modalEl = document.getElementById('modalInactivarEmprendimiento');
      if (!modalEl) return;
      const emprId = modalEl.dataset.emprId;
      if (!emprId) return alert('No se encontró el emprendimiento a inactivar');

      // Deshabilitar botón para evitar múltiples clicks
      btnConfirmInactivar.disabled = true;

      try {
        const apiBase = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000`;
        const url = `${apiBase.replace(/\/$/, '')}/emprendimientos/${encodeURIComponent(emprId)}`;

        // Enviaremos un PATCH con el campo que queremos cambiar
        const headers = {
          'Content-Type': 'application/json',
          'akalia-api-key': window.API_KEY || ''
        };

        const resp = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ emprendimientoActivo: false })
        });

        if (!resp.ok) {
          const txt = await resp.text().catch(() => 'Error al inactivar');
          throw new Error(txt || 'Error al inactivar');
        }

        const actualizado = await resp.json();

        // Actualizar badge en la UI (sin recargar)
        const botonVer = document.querySelector(`[data-empr-id="${emprId}"]`);
        const articulo = botonVer ? botonVer.closest('article') : null;
        if (articulo) {
          const badge = articulo.querySelector('span.badge');
          if (badge) {
            badge.textContent = 'Inactivo';
            badge.className = 'badge bg-secondary';
          }
        } else {
          // fallback: recargar lista
          setTimeout(() => location.reload(), 300);
        }

        // mostrar mensaje de éxito dentro del modal y cerrarlo
        const mensaje = document.getElementById('mensajeEstadoInactivar');
        if (mensaje) {
          mensaje.className = 'alert alert-success';
          mensaje.textContent = 'Emprendimiento inactivado correctamente';
          mensaje.classList.remove('d-none');
        }

        // cerrar modal después de un breve retraso
        setTimeout(() => {
          const bsIns = bootstrap.Modal.getInstance(modalEl);
          if (bsIns) bsIns.hide();
        }, 800);

      } catch (err) {
        console.error('Error al inactivar:', err);
        alert('No fue posible inactivar: ' + (err.message || err));
      } finally {
        btnConfirmInactivar.disabled = false;
      }
    });
  }

});

// Funciones de activación fuera del DOMContentLoaded para que sean accesibles si el archivo se carga antes
window.openActivarModal = function (idUsuario, idEmprendimiento, nombreEmpr) {
  const modalEl = document.getElementById('modalActivarEmprendimiento');
  if (!modalEl) {
    console.error('No existe modal de activación en la página');
    return;
  }
  modalEl.dataset.emprId = idEmprendimiento || '';
  modalEl.dataset.userId = idUsuario || '';
  const nombreSpan = document.getElementById('modalActivarNombre');
  if (nombreSpan) nombreSpan.textContent = nombreEmpr || '';
  const bs = new bootstrap.Modal(modalEl);
  bs.show();
};

// Manejador para confirmar activación
document.addEventListener('click', async function (ev) {
  const btn = ev.target.closest && ev.target.closest('#btnConfirmActivar');
  if (!btn) return;
  ev.preventDefault();

  const modalEl = document.getElementById('modalActivarEmprendimiento');
  if (!modalEl) return;
  const emprId = modalEl.dataset.emprId;
  if (!emprId) return alert('No se encontró el emprendimiento a activar');

  btn.disabled = true;
  try {
    const apiBase = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000`;
    const url = `${apiBase.replace(/\/$/, '')}/emprendimientos/${encodeURIComponent(emprId)}`;
    const headers = { 'Content-Type': 'application/json', 'akalia-api-key': window.API_KEY || '' };
    const resp = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ emprendimientoActivo: true }) });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => 'Error al activar');
      throw new Error(txt || 'Error al activar');
    }
    const actualizado = await resp.json();

    // Actualizar UI
    const botonVer = document.querySelector(`[data-empr-id="${emprId}"]`);
    const articulo = botonVer ? botonVer.closest('article') : null;
    if (articulo) {
      const badgeContainerLink = articulo.querySelector('a > span.badge') || articulo.querySelector('span.badge');
      if (badgeContainerLink) {
        badgeContainerLink.textContent = 'Activo';
        badgeContainerLink.className = 'badge bg-success';
        // si estaba dentro de un <a>, quitar el enlace (simplemente reemplazamos el <a> por el span)
        const posibleA = badgeContainerLink.closest('a');
        if (posibleA) {
          const span = document.createElement('span');
          span.className = 'badge bg-success';
          span.textContent = 'Activo';
          posibleA.parentNode.replaceChild(span, posibleA);
        }
      }
    } else {
      setTimeout(() => location.reload(), 300);
    }

    const mensaje = document.getElementById('mensajeEstadoActivar');
    if (mensaje) {
      mensaje.className = 'alert alert-success';
      mensaje.textContent = 'Emprendimiento activado correctamente';
      mensaje.classList.remove('d-none');
    }

    setTimeout(() => {
      const bsIns = bootstrap.Modal.getInstance(modalEl);
      if (bsIns) bsIns.hide();
    }, 800);

  } catch (err) {
    console.error('Error al activar:', err);
    alert('No fue posible activar: ' + (err.message || err));
  } finally {
    btn.disabled = false;
  }
});
