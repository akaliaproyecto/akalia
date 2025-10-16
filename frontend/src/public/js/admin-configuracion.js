/* JavaScript para gestión de categorías y etiquetas en panel admin */

/**
 * Módulo de UI para configuración del panel admin.
 * - Contiene helpers para mostrar toasts, spinners y manejar modales de
 *   categorías y etiquetas. Solo manipula el DOM y hace llamadas fetch al backend.
 */

// ==================== UTILIDADES ====================

/**
 * Mostrar una notificación amigable en la UI.
 * - Usa la función global `window.mostrarToast` si existe, si no, usa alert.
 * @param {string} mensaje - Texto a mostrar.
 * @param {string} [tipo='info'] - Tipo de notificación (info, success, error, warning).
 */
function mostrarToast(mensaje, tipo = 'info') {
  if (typeof window.mostrarToast === 'function') {
    window.mostrarToast(mensaje, tipo);
  } else {
    // Fallback si la función global no está disponible
    alert(mensaje);
  }
}

/**
 * Mostrar u ocultar un spinner en un botón durante operaciones async.
 * @param {string} botonId - ID del botón que contiene el spinner.
 * @param {string} spinnerId - ID del elemento spinner.
 * @param {string} textoId - ID del elemento que muestra el texto del botón.
 * @param {boolean} mostrar - True para mostrar, false para ocultar.
 */
function mostrarSpinner(botonId, spinnerId, textoId, mostrar) {
  const spinner = document.getElementById(spinnerId);
  const texto = document.getElementById(textoId);
  const boton = document.getElementById(botonId);
  
  if (spinner && texto && boton) {
    if (mostrar) {
      spinner.classList.remove('d-none');
      texto.textContent = 'Guardando...';
      boton.disabled = true;
    } else {
      spinner.classList.add('d-none');
      texto.textContent = 'Guardar';
      boton.disabled = false;
    }
  }
}

// ==================== CATEGORÍAS ====================

/**
 * Abrir modal para crear o editar una categoría.
 * - Si se pasa `id`, se inicializa el modal en modo edición.
 * @param {string|null} [id=null]
 * @param {string} [nombre='']
 * @param {string} [imagen='']
 */
function abrirModalCategoria(id = null, nombre = '', imagen = '') {
  const modal = new bootstrap.Modal(document.getElementById('modalCategoria'));
  const title = document.getElementById('modalCategoriaTitle');
  const categoriaId = document.getElementById('categoriaId');
  const nombreInput = document.getElementById('nombreCategoria');
  const imagenURLInput = document.getElementById('imagenCategoriaURL');
  const imagenFileInput = document.getElementById('imagenCategoriaFile');
  const imagenActualContainer = document.getElementById('imagenActualContainer');
  const imagenActualPreview = document.getElementById('imagenActualPreview');
  const labelImagenFile = document.getElementById('labelImagenFile');
  const nuevaImagenPreviewContainer = document.getElementById('nuevaImagenPreviewContainer');

  // Limpiar formulario
  nombreInput.value = '';
  imagenURLInput.value = '';
  imagenFileInput.value = '';
  nuevaImagenPreviewContainer.style.display = 'none';
  
  // Limpiar errores
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');

  if (id) {
    // Modo edición
    title.textContent = 'Editar Categoría';
    categoriaId.value = id;
    nombreInput.value = nombre;
    imagenURLInput.value = imagen || '';
    labelImagenFile.textContent = 'Cambiar Imagen';
    
    // Mostrar imagen actual si existe
    if (imagen) {
      imagenActualContainer.style.display = 'block';
      imagenActualPreview.src = imagen;
    } else {
      imagenActualContainer.style.display = 'none';
    }
  } else {
    // Modo creación
    title.textContent = 'Nueva Categoría';
    categoriaId.value = '';
    labelImagenFile.textContent = 'Subir Imagen';
    imagenActualContainer.style.display = 'none';
  }

  modal.show();
}

/**
 * Abrir modal de edición para una categoría existente.
 * @param {string} id
 * @param {string} nombre
 * @param {string} imagen
 */
function editarCategoria(id, nombre, imagen) {
  abrirModalCategoria(id, nombre, imagen);
}

/**
 * Mostrar modal de confirmación y eliminar una categoría vía API.
 * @param {string} id
 * @param {string} nombre
 */
async function eliminarCategoria(id, nombre) {
  // Crear modal de confirmación dinámico
  const modalHTML = `
    <div class="modal fade" id="modalEliminarCategoria" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Eliminación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar la categoría <strong>"${nombre}"</strong>?</p>
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              Esta acción no se puede deshacer.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btnConfirmarEliminarCategoria">
              <span class="spinner-border spinner-border-sm d-none" id="spinnerEliminarCategoria"></span>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Limpiar modal anterior si existe
  const modalAnterior = document.getElementById('modalEliminarCategoria');
  if (modalAnterior) modalAnterior.remove();

  // Insertar nuevo modal
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminarCategoria'));
  modalEliminar.show();

  // Configurar botón de confirmación
  document.getElementById('btnConfirmarEliminarCategoria').addEventListener('click', async () => {
    const spinner = document.getElementById('spinnerEliminarCategoria');
    const btn = document.getElementById('btnConfirmarEliminarCategoria');
    
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      const response = await fetch(`${apiBaseUrl}/admin/categorias/${id}`, {
        method: 'DELETE',
        credentials: 'include', 
        headers: {
          'akalia-api-key': apiKey,
          'Cookie': document.cookie
        }
      });

      if (!response.ok) throw new Error('Error al eliminar categoría');

      mostrarToast('Categoría eliminada correctamente', 'success');
      modalEliminar.hide();
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      mostrarToast('Error al eliminar categoría', 'error');
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  });
}

// ==================== ETIQUETAS ====================

/**
 * Abrir modal para crear o editar una etiqueta.
 * @param {string|null} [id=null]
 * @param {string} [nombre='']
 */
function abrirModalEtiqueta(id = null, nombre = '') {
  const modal = new bootstrap.Modal(document.getElementById('modalEtiqueta'));
  const title = document.getElementById('modalEtiquetaTitle');
  const etiquetaId = document.getElementById('etiquetaId');
  const nombreInput = document.getElementById('nombreEtiqueta');

  // Limpiar errores
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');

  if (id) {
    title.textContent = 'Editar Etiqueta';
    etiquetaId.value = id;
    nombreInput.value = nombre;
  } else {
    title.textContent = 'Nueva Etiqueta';
    etiquetaId.value = '';
    nombreInput.value = '';
  }

  modal.show();
}

/**
 * Abrir modal para editar una etiqueta.
 * @param {string} id
 * @param {string} nombre
 */
function editarEtiqueta(id, nombre) {
  abrirModalEtiqueta(id, nombre);
}

/**
 * Mostrar modal de confirmación y eliminar una etiqueta vía API.
 * @param {string} id
 * @param {string} nombre
 */
async function eliminarEtiqueta(id, nombre) {
  // Crear modal de confirmación
  const modalHTML = `
    <div class="modal fade" id="modalEliminarEtiqueta" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Eliminación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar la etiqueta <strong>"${nombre}"</strong>?</p>
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              Esta acción no se puede deshacer.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btnConfirmarEliminarEtiqueta">
              <span class="spinner-border spinner-border-sm d-none" id="spinnerEliminarEtiqueta"></span>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const modalAnterior = document.getElementById('modalEliminarEtiqueta');
  if (modalAnterior) modalAnterior.remove();

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminarEtiqueta'));
  modalEliminar.show();

  document.getElementById('btnConfirmarEliminarEtiqueta').addEventListener('click', async () => {
    const spinner = document.getElementById('spinnerEliminarEtiqueta');
    const btn = document.getElementById('btnConfirmarEliminarEtiqueta');
    
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      const response = await fetch(`${apiBaseUrl}/admin/etiquetas/${id}`, {
        method: 'DELETE',
        credentials: 'include', 
        headers: {
          'akalia-api-key': apiKey,
          'Cookie': document.cookie
        }
      });

      if (!response.ok) throw new Error('Error al eliminar etiqueta');

      mostrarToast('Etiqueta eliminada correctamente', 'success');
      modalEliminar.hide();
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      mostrarToast('Error al eliminar etiqueta', 'error');
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  });
}

// ==================== EVENT LISTENERS ====================

/**
 * Inicializador de eventos del DOM para los modales y formularios de configuración.
 * - Registra handlers para previews de imagen, envíos de formularios y validations simples.
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // Vista previa de imagen al seleccionar archivo
  const imagenFileInput = document.getElementById('imagenCategoriaFile');
  if (imagenFileInput) {
    imagenFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const previewContainer = document.getElementById('nuevaImagenPreviewContainer');
      const preview = document.getElementById('nuevaImagenPreview');
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          preview.src = event.target.result;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.style.display = 'none';
      }
    });
  }
  
  // Form handler para categorías
  const formCategoria = document.getElementById('formCategoria');
  if (formCategoria) {
    formCategoria.addEventListener('submit', async (e) => {
      e.preventDefault();

      const categoriaId = document.getElementById('categoriaId').value;
      const nombreCategoria = document.getElementById('nombreCategoria').value.trim();
      const imagenURL = document.getElementById('imagenCategoriaURL').value.trim();
      const imagenFile = document.getElementById('imagenCategoriaFile').files[0];

      // Validaciones
      if (!nombreCategoria) {
        mostrarToast('El nombre de la categoría es requerido', 'error');
        return;
      }

      mostrarSpinner('btnGuardarCategoria', 'spinnerGuardarCategoria', 'textoGuardarCategoria', true);

      try {
        const isEdit = !!categoriaId;
        const url = isEdit 
          ? `${apiBaseUrl}/admin/categorias/${categoriaId}` 
          : `${apiBaseUrl}/admin/categorias`;
        const method = isEdit ? 'PUT' : 'POST';

        // Si hay archivo, usar FormData
        let body;
        let headers = {
          'akalia-api-key': apiKey,
          'Cookie': document.cookie
        };

        if (imagenFile) {
          const formData = new FormData();
          formData.append('nombreCategoria', nombreCategoria);
          formData.append('imagen', imagenFile);
          body = formData;
          // No establecer Content-Type para FormData (el navegador lo hace automáticamente)
        } else {
          // Si solo hay URL o no hay imagen, usar JSON
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify({ nombreCategoria, imagen: imagenURL });
        }

        const response = await fetch(url, {
          method,
          credentials: 'include', 
          headers,
          body
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al guardar categoría');
        }

        mostrarToast(`Categoría ${isEdit ? 'actualizada' : 'creada'} correctamente`, 'success');
        
        // Cerrar modal y recargar
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCategoria'));
        if (modal) modal.hide();
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } catch (error) {
        console.error('Error:', error);
        mostrarToast(error.message || 'Error al guardar categoría', 'error');
        mostrarSpinner('btnGuardarCategoria', 'spinnerGuardarCategoria', 'textoGuardarCategoria', false);
      }
    });
  }

  // Form handler para etiquetas
  const formEtiqueta = document.getElementById('formEtiqueta');
  if (formEtiqueta) {
    formEtiqueta.addEventListener('submit', async (e) => {
      e.preventDefault();

      const etiquetaId = document.getElementById('etiquetaId').value;
      const nombreEtiqueta = document.getElementById('nombreEtiqueta').value.trim();

      if (!nombreEtiqueta) {
        mostrarToast('El nombre de la etiqueta es requerido', 'error');
        return;
      }

      const data = { nombreEtiqueta };

      try {
        const isEdit = !!etiquetaId;
        const url = isEdit 
          ? `${apiBaseUrl}/admin/etiquetas/${etiquetaId}` 
          : `${apiBaseUrl}/admin/etiquetas`;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          credentials: 'include', 
          headers: {
            'Content-Type': 'application/json',
            'akalia-api-key': apiKey,
            'Cookie': document.cookie
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al guardar etiqueta');
        }

        mostrarToast(`Etiqueta ${isEdit ? 'actualizada' : 'creada'} correctamente`, 'success');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEtiqueta'));
        if (modal) modal.hide();
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } catch (error) {
        console.error('Error:', error);
        mostrarToast(error.message || 'Error al guardar etiqueta', 'error');
      }
    });
  }
});
