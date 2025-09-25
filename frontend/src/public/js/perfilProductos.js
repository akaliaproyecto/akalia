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
      // Llamada al endpoint SSR que procesa la eliminación. Usamos POST a la ruta SSR que luego hace proxy al backend.
      await fetch(`/productos/usuario-productos/eliminar/${productoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: userId, productoEliminado: estado })
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

// Función para navegar a la vista del detalle de producto
window.showUserProductDetail = (usuario, idProducto) => {
  // construimos la ruta que definimos en productos.front.routes.js
  const rutaDetalle = `/productos/usuario-productos/ver/${idProducto}`;
  window.location.href = rutaDetalle;
};

/*Función para abrir el modal de edición de producto*/
window.editUserProductDetail = async (usuario, idProducto) => {
  try {
    // Pedir al servidor el partial HTML del formulario de edición
    const res = await fetch(`/productos/usuario-productos/editar/${idProducto}`);
    const html = await res.text();

    // busca garantizar un contenedor dinámico y añadir contenido en él.
    const contId = 'contenedorModalesDinamicos'; //asegura que exista en el DOM un <div> con id contenedorModalesDinamicos.
    let contenedor = document.getElementById(contId);
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = contId;
      document.body.appendChild(contenedor);
    }
    contenedor.innerHTML = html;

    // Inicializo autocompletado de etiquetas
    inicializarAutocompletadoEtiquetasConPrefijo('Editar');

    // Usar setTimeout para asegurar que el DOM esté completamente renderizado antes de inicializar validaciones
    setTimeout(() => {      
      // Inicializar validaciones del formulario de editar producto
      if (typeof window.inicializarValidacionesEditar === 'function') {
        window.inicializarValidacionesEditar();
      } else {
        console.error('❌ Función inicializarValidacionesEditar no disponible');
      }
    }, 200);

    // Mostrar modal con Bootstrap y asegurar limpieza al ocultarse
    const modalEl = document.getElementById('modalEditarProducto');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    // elimina el div del DOM
    modalEl.addEventListener('hidden.bs.modal', () => {
      contenedor.remove();
    });
  } catch (err) {
    // Mensaje claro para desarrollador y usuario
    console.error('No se pudo cargar el formulario de edición', err);
  }
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
    
    // Mostrar el modal
        // Mostrar modal con Bootstrap y asegurar limpieza al ocultarse
    const modalEl = document.getElementById('modalCrearProducto');
    const instancia = bootstrap.Modal.getOrCreateInstance(modalEl);
    instancia.show();

    
  } catch (err) {
    console.error('Error cargando modal crear producto:', err);
    window.mostrarToast && window.mostrarToast('Error al cargar datos para crear producto', 'error');
  }
}

/* Autocompletado de etiquetas */
function inicializarAutocompletadoEtiquetasConPrefijo(prefijo = '') {
  //obtiene las referencias a los elementos del DOM con ids dinámicos (etiquetasBuscador${prefijo}, etiquetasSugerencias${prefijo}, etiquetasSeleccionadas${prefijo}, etiquetasHidden${prefijo}) y las asigna respectivamente a las variables buscador, sugerencias, seleccionadasCont y hidden
  const [buscador, sugerencias, seleccionadasCont, hidden] =
    ['Buscador', 'Sugerencias', 'Seleccionadas', 'Hidden'].map(id => get(`etiquetas${id}${prefijo}`));

  //carga las etiquetas disponibles y prepara una lista vacía para las elegidas.
  const etiquetas = JSON.parse(buscador.dataset.etiquetas);
  const seleccionadas = [];

  //Mostrar visualmente las etiquetas seleccionadas
  const dibujarSeleccionadas = () => {
    // Se limpia el  contenedor para llenarlo
    seleccionadasCont.innerHTML = '';

    // Se recorre el arreglo de etiquetas seleccionadas y se crea un <span> que representará cada etiqueta como un "chip" visual
    seleccionadas.forEach((et, i) => {
      const chip = Object.assign(document.createElement('span'), {
        className: 'badge bg-secondary me-1',
        textContent: et.nombreEtiqueta,
        style: 'cursor:pointer'
      });

      //al hacer clic en el chip, la etiqueta se elimine del arreglo
      chip.onclick = () => { seleccionadas.splice(i, 1); dibujarSeleccionadas(); };

      // Se agrega el chip dentro del contenedor en la página
      seleccionadasCont.appendChild(chip);
    });

    // Se actualiza el campo oculto (hidden) con las etiquetas seleccionadas, convirtiendo el array en un JSON (para poder enviarlo al servidor)
    if (hidden) hidden.value = JSON.stringify(seleccionadas.map(e => e.nombreEtiqueta));
  };

  // busca etiquetas según el texto escrito en el buscador
  const buscar = texto => {
    // Limpiar sugerencias previas antes de mostrar nuevas
    sugerencias.innerHTML = '';

    // Filtrar las etiquetas que coincidan con el texto ingresado
    etiquetas
      .filter(e => e.nombreEtiqueta.toLowerCase().includes(texto.toLowerCase())) // busca coincidencias ignorando mayúsculas/minúsculas
      .slice(0, 6) // limita el máximo a 6 resultados
      .forEach(e => {
        // Crear un botón para cada etiqueta sugerida
        const item = Object.assign(document.createElement('button'), {
          type: 'button',
          className: 'list-group-item list-group-item-action',
          textContent: e.nombreEtiqueta
        });
        item.onclick = () => {
          // Solo permite añadir etiqueta si no hay más de 3 etiquetas y no es duplicada
          if (seleccionadas.length < 3 && !seleccionadas.find(s => s.nombreEtiqueta === e.nombreEtiqueta)) {
            seleccionadas.push(e); // agregar etiqueta al array
            dibujarSeleccionadas(); // actualizar visualmente las etiquetas seleccionadas
            sugerencias.innerHTML = ''; // limpiar sugerencias después de elegir
            buscador.value = ''; // limpiar el campo de texto
          }
        };
        sugerencias.appendChild(item);
      });
  };

  // actualiza las sugerencias mientras se escribe.
  buscador.oninput = e => buscar(e.target.value);
  //limpia las sugerencias al salir del input, con un pequeño retardo para no cortar la interacción del usuario.
  buscador.onblur = () => setTimeout(() => sugerencias && (sugerencias.innerHTML = ''), 150);

  try {
    JSON.parse(hidden?.value || '[]') // Convierte en array el contenido del hidden o usa [] si no hay nada
      // Recorre cada etiqueta guardada, La agrega a la lista de seleccionadas
      .forEach(v => seleccionadas.push(etiquetas.find(e => e.nombreEtiqueta === v) || { nombreEtiqueta: v }));
    dibujarSeleccionadas();  // Agrega las etiquetas en la interfaz
  } catch { }
}

// Compatibilidad: llamada antigua sin prefijo
function inicializarAutocompletadoEtiquetas() {
  inicializarAutocompletadoEtiquetasConPrefijo('');
}

// Inicializar autocompletado cuando el DOM esté listo 
document.addEventListener('DOMContentLoaded', () => {
  inicializarAutocompletadoEtiquetas();
  inicializarValidacionCrearProducto(); // Inicializar validación del formulario
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

// Exportar funciones para uso en templates 
window.crearProducto = crearProducto;
window.editProducto = editProducto;