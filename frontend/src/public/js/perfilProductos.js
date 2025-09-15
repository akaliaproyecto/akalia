// Helpers globales: función simple para obtener elemento por id
function get(id) {
  return document.getElementById(id);
}

/* --------------------------------------------
  Modal eliminar Producto
  - abrirModalEliminarProducto: abre el modal y pone data attributes con ids
  - configurarBotonConfirmacionProducto: configura el botón de confirmación para
    llamar al endpoint que elimina/inhabilita el producto
  Notas: este archivo sigue el estilo y comentarios de perfilEmprendimientos.js
-------------------------------------------- */

function abrirModalEliminarProducto(modalId, nombreId, { usuario, id, nombre }) {
  const modal = get(modalId);
  if (!modal) return;

  // Guardamos en dataset para luego leer en el handler
  modal.dataset.productoId = id || '';
  modal.dataset.userId = usuario || '';

  const spanNombre = get(nombreId);
  if (spanNombre) spanNombre.textContent = nombre || '';

  // Usamos bootstrap para abrir el modal
  bootstrap.Modal.getOrCreateInstance(modal).show();
}

function configurarBotonConfirmacionProducto({ btnId, modalId, mensajeId, estado }) {
  const btn = get(btnId);
  if (!btn) return;

  // Reemplazamos el botón para evitar múltiples listeners acumulados
  btn.replaceWith(btn.cloneNode(true));
  const newBtn = get(btnId);

  newBtn.addEventListener('click', async () => {
    const modal = get(modalId);
    if (!modal) return;

    const productoId = modal.dataset.productoId;
    const userId = modal.dataset.userId;

    newBtn.disabled = true;

    try {
      // Llamada al endpoint que inactiva/elimina el producto en el servidor
      await fetch(`/api/productos/usuario-productos/${userId}/eliminar/${productoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idProducto: productoId, usuario: userId, productoEliminado: estado })
      });

      const mensaje = get(mensajeId);
      if (mensaje) {
        mensaje.classList.remove('d-none');
        mensaje.classList.remove('alert-danger');
        mensaje.classList.add('alert-success');
        mensaje.textContent = estado ? 'Producto eliminado correctamente' : 'Producto reactivado correctamente';
      }

      // Cerrar modal y recargar la página después de un breve delay para mostrar mensaje
      setTimeout(() => {
        bootstrap.Modal.getOrCreateInstance(modal).hide();
        window.location.reload();
      }, 800);

    } catch (err) {
      console.error(`Error al ${estado ? 'eliminar' : 'activar'} producto:`, err);
      alert(`No se pudo ${estado ? 'eliminar' : 'activar'} el producto.`);
    } finally {
      newBtn.disabled = false;
    }
  });
}

// API global para abrir modal desde íconos en la tabla
window.eliminarProducto = (usuario, id, nombre) => {
  abrirModalEliminarProducto('modalEliminarProducto', 'nombreProductoBorrando', { usuario, id, nombre });
};

// Inicializar listeners cuando el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
  configurarBotonConfirmacionProducto({
    btnId: 'btnConfirmEliminarProducto',
    modalId: 'modalEliminarProducto',
    mensajeId: 'mensajeEstadoEliminarProducto',
    estado: true // true = eliminar
  });

  // Ocultar id de producto en la barra de direcciones si estamos en /productos/usuario-productos/:id
  ocultarIdProductoEnUrl();
});

/* ------------------------- Modal Crear Producto ------------------------- */
async function crearProducto(idUsuario) {
  try {
    const modal = new bootstrap.Modal(document.getElementById('modalCrearProducto'));
    modal.show();
  } catch (err) {
    console.error('Error cargando modal crear producto:', err);
  }
}

/* ------------------------- Modal EDITAR Producto ------------------------- */
async function editProducto(idUsuario, idProducto) {
  try {
    // Pedimos detalle del producto al servidor (ruta proxy en frontend)
    const response = await fetch(`/api/productos/${idProducto}`, { headers: { 'Accept': 'application/json' } });
    const data = await response.json();

    // Llenamos campos del modal con los datos recibidos
    document.getElementById('me-usuario-id').value = idUsuario;
    document.getElementById('me-producto-id').value = idProducto;
    document.getElementById('me-titulo').value = data.producto?.tituloProducto || '';
    document.getElementById('me-descripcion').value = data.producto?.descripcionProducto || '';
    document.getElementById('me-precio').value = data.producto?.precio || '';

    // Imágenes: si existe preview lo mostramos
    const logoPreview = document.getElementById('me-imagen-preview');
    if (logoPreview) {
      logoPreview.src = data.producto?.urlImagen || '';
      logoPreview.style.display = data.producto?.urlImagen ? 'block' : 'none';
    }

    // Action del form (mantener localhost:3000 como proxy en desarrollo)
    const form = document.getElementById('form-editar-producto-modal');
    if (form) form.action = `http://localhost:3000/api/productos/usuario-productos/${idUsuario}/editar/${idProducto}`;

    const modal = new bootstrap.Modal(document.getElementById('modalEditarProducto'));
    modal.show();

  } catch (err) {
    console.error('Error cargando datos de producto:', err);
  }
}

/* Ocultar el id en la URL al mostrar detalle/editar de producto */
function ocultarIdProductoEnUrl() {
  try {
    const rutaActual = window.location.pathname || '';
    const prefijo = '/productos/usuario-productos/';
    if (rutaActual.startsWith(prefijo) && rutaActual.length > prefijo.length) {
      const rutaLimpia = '/productos/usuario-productos';
      const urlNueva = rutaLimpia + window.location.search + window.location.hash;
      window.history.replaceState(null, '', urlNueva);
    }
  } catch (error) {
    console.error('No se pudo ocultar el id en la URL:', error);
  }
}

// Exportar funciones para uso en templates (si se necesitan desde atributos onclick)
window.crearProducto = crearProducto;
window.editProducto = editProducto;
