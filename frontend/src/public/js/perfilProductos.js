// Helpers globales: función simple para obtener elemento por id
function get(id) {
  return document.getElementById(id);
}

/* Modal eliminar Producto */
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

/* Autocompletado de etiquetas. */
function inicializarAutocompletadoEtiquetas() {
  // carga etiquetas desde data-atributo, etiquetasBuscador es el id del input de las etiquetas.
  const buscador = get('etiquetasBuscador');

  const etiquetas = JSON.parse(buscador.dataset.etiquetas);
  const sugerencias = get('etiquetasSugerencias'); //etiquetasSugerencias es el id del contenedor de sugerencias en el archivo perfilProductos.ejs
  const seleccionadasCont = get('etiquetasSeleccionadas'); //etiquetasSeleccionadas contenedor donde se muestran las etiquetas seleccionadas
  const hidden = get('etiquetasHidden'); //etiquetasHidden input hidden donde se guardan las etiquetas seleccionadas en formato JSON

  const seleccionadas = [];

  // Función para renderizar las etiquetas seleccionadas en el contenedor
  function dibujarSeleccionadas() {
    seleccionadasCont.innerHTML = '';

    //Por cada elemento de la lista seleccionadas se crea un span con clases de Bootstrap (badge bg-secondary). textContent se usa porque se quiere poner solo texto(no HTML crudo). Se toma el nombre de la etiqueta en orden de prioridad: et.nombreEtiqueta
    seleccionadas.forEach((et, i) => {
      const chip = document.createElement('span');
      chip.className = 'badge bg-secondary me-1';
      chip.textContent = et.nombreEtiqueta;

      //Se crea un botón X para quitar la etiqueta. Cuando se hace click, elimina esa etiqueta del array con splice y vuelve a llamar dibujarSeleccionadas() para refrescar la vista.
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn-close btn-close-white btn-sm ms-2';
      btn.addEventListener('click', () => { seleccionadas.splice(i, 1); dibujarSeleccionadas(); });

      // El botón se agrega dentro del span(chip). Finalmente, ese chip se mete en el contenedor principal.
      chip.appendChild(btn);
      seleccionadasCont.appendChild(chip);
    });
    //sincroniza en un campo oculto (hidden) los valores de las etiquetas seleccionadas para que luego puedan enviarse
    hidden.value = JSON.stringify(seleccionadas.map(e => e.nombreEtiqueta));
  }

  //mostrar sugerencias de etiquetas filtradas a partir de lo que se escribe en un buscador y permitir seleccionarlas con un clic
  function buscar(texto) {
    sugerencias.innerHTML = '';
    const t = texto.toLowerCase();

    //etiquetas es el listado completo de posibles etiquetas. Toma e.nombreEtiqueta, convierte a minúsculas y revisa si contiene el texto buscado(includes(t)) así se obtienen solo las coincidencias. Limita el número de sugerencias a un máximo de 6 resultados.
    etiquetas.filter(e => (e.nombreEtiqueta).toLowerCase().includes(t)).slice(0, 6).forEach(e => {
      // Por cada etiqueta coincidente crea un botón con clase boostrap list-group-item con el nombre de la etiqueta
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-group-item list-group-item-action';
      btn.textContent = e.nombreEtiqueta;

      //Cuando se hace clic en una sugerencia: 1. Comprueba que el usuario no tenga ya 3 etiquetas seleccionadas. 2. También verifica que esa etiqueta no esté repetida(some(...)). 3. Si pasa ambas condiciones, agrega la etiqueta al array seleccionadas y llama a dibujarSeleccionadas() para actualizar la vista. 4. Luego limpia el input del buscador(buscador.value = '') y borra las sugerencias.
      btn.addEventListener('click', () => {
        if (seleccionadas.length < 3 && !seleccionadas.some(s => s._id === e._id)) {
          seleccionadas.push(e); dibujarSeleccionadas();
        }
        buscador.value = ''; sugerencias.innerHTML = '';
      });
      //cada botón se agrega al contenedor de sugerencias para que se muestre en pantalla.
      sugerencias.appendChild(btn);
    });
  }

  //cuando el usuario escribe algo en el campo de texto (<input>), se dispara el evento input y se van mostrando las sugerencias en tiempo real mientras  escribe.
  buscador.addEventListener('input', e => buscar(e.target.value));
  // Cuando el campo de texto pierde el foco, se ocultan las sugerencias después de 150ms.
  buscador.addEventListener('blur', () => setTimeout(() => sugerencias.innerHTML = '', 150));
  // Inicializar visual si ya hay valores
  try { const inicial = JSON.parse(hidden.value || '[]'); inicial.forEach(v => { const f = etiquetas.find(e => e._id === v || e.nombreEtiqueta === v || e.nombre === v); if (f) seleccionadas.push(f); }); dibujarSeleccionadas(); } catch (e) { }
}

// Inicializar autocompletado cuando el DOM esté listo 
document.addEventListener('DOMContentLoaded', () => {
  inicializarAutocompletadoEtiquetas();
});

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
