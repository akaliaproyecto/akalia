// Helpers globales
/**
 * Obtener elemento por id del DOM.
 * @param {string} id - Id del elemento
 * @returns {HTMLElement|null}
 */
function get(id) {
  return document.getElementById(id);
}

// Función global para verificar contraseña actual
/**
 * Verifica la contraseña actual usando la ruta SSR que actúa como proxy.
 * - Llama a `/usuario-detalle/verificar-contrasena` y devuelve el resultado JSON.
 * @param {string} userId - ID del usuario
 * @param {string} contrasenaActual - Contraseña a verificar
 * @returns {Promise<Object>} Resultado del backend
 */
async function verificarContrasenaActual(userId, contrasenaActual) {
  try {
    const response = await fetch('/usuario-detalle/verificar-contrasena', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        contrasenaActual: contrasenaActual
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Error al verificar contraseña');
    }
    
    return result;
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    throw error;
  }
}// Hacer la función disponible globalmente
window.verificarContrasenaActual = verificarContrasenaActual;

// Limpiar estado de validación de campos del modal editar perfil
/**
 * Limpia las clases y mensajes de validación del formulario de editar perfil.
 */
function limpiarEstadoValidacion() {
  const campos = ['editarNombre', 'editarApellido', 'editarEmail', 'editarTelefono', 'editarContrasena'];
  const errores = ['editarNombreError', 'editarApellidoError', 'editarEmailError', 'editarTelefonoError', 'editarContrasenaError'];

  // Limpiar clases de validación de los campos
  campos.forEach(campoId => {
    const campo = get(campoId);
    if (campo) {
      campo.classList.remove('is-invalid', 'is-valid');
    }
  });

  // Limpiar mensajes de error
  errores.forEach(errorId => {
    const error = get(errorId);
    if (error) {
      error.textContent = '';
      error.style.display = 'none';
      error.classList.add('d-none');
      error.classList.remove('d-block');
    }
  });
}

// Abrir modal (editar/eliminar) - elimina/editar usan IDs de los partials
/**
 * Abre el modal de eliminación de cuenta y prepara la UI.
 * @param {string} modalId - Id del modal
 * @param {string} nombreId - Id del span donde mostrar el nombre
 * @param {{id:string, nombre:string}} param2 - Objeto con id y nombre
 */
function abrirModalEliminar(modalId, nombreId, { id, nombre }) {
  const modal = get(modalId);
  if (!modal) return;
  modal.dataset.entidadId = id || '';
  const span = get(nombreId);
  if (span) span.textContent = nombre || '';

  // Resetear pasos del modal de eliminación (usar add/remove, no toggle)
  const pasoUno = get('pasoUnoEliminacion');
  const pasoDos = get('pasoDosEliminacion');
  const botonesUno = get('botonesPasoUno');
  const botonesDos = get('botonesPasoDos');
  if (pasoUno) pasoUno.classList.remove('d-none');
  if (pasoDos) pasoDos.classList.add('d-none');
  if (botonesUno) botonesUno.classList.remove('d-none');
  if (botonesDos) botonesDos.classList.add('d-none');

  const mensaje = get('mensajeEstadoEliminacion');
  if (mensaje) { mensaje.className = 'alert d-none'; mensaje.textContent = ''; }

  bootstrap.Modal.getOrCreateInstance(modal).show();
}

// Configurar acción de confirmación (validación de contraseña + desactivar cuenta)
/**
 * Configura el botón que confirma la eliminación de cuenta.
 * - Valida contraseña, llama a la ruta SSR para desactivar y muestra mensajes.
 * @param {{btnId:string, modalId:string, mensajeId:string}} options
 */
function configurarBotonConfirmacion({ btnId, modalId, mensajeId }) {
  const btn = get(btnId);
  if (!btn) return;

  // Asegurar único listener
  btn.replaceWith(btn.cloneNode(true));
  const newBtn = get(btnId);

  newBtn.addEventListener('click', async () => {
    const modal = get(modalId);
    if (!modal) return;
    const entidadId = modal.dataset.entidadId;
    const password = (get('confirmarContrasenaEliminacion') || {}).value || '';
    const mensaje = get(mensajeId);

    if (!password) {
      if (mensaje) { mensaje.className = 'alert alert-warning'; mensaje.textContent = 'Ingresa tu contraseña para confirmar.'; }
      return;
    }

    newBtn.disabled = true;
    try {
      // Validar contraseña en el frontend (ruta SSR)
      const validarResp = await fetch(`/validar-contrasena-usuario/${encodeURIComponent(entidadId)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contrasenaIngresada: password })
      });

      if (!validarResp.ok) {
        const err = await validarResp.json().catch(() => ({}));
        throw new Error(err.error || 'Contraseña incorrecta');
      }

      // Desactivar cuenta (ruta SSR)
      const resp = await fetch(`/desactivar-cuenta-usuario/${encodeURIComponent(entidadId)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'No se pudo desactivar la cuenta');
      }

      if (mensaje) { mensaje.className = 'alert alert-success'; mensaje.textContent = 'Cuenta desactivada correctamente.'; }

      setTimeout(() => {
        bootstrap.Modal.getInstance(modal)?.hide();
        // limpiar cookie pública y redirigir
        document.cookie = 'usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/';
      }, 900);

    } catch (err) {
      console.error('Error en eliminación:', err);
      if (mensaje) { mensaje.className = 'alert alert-danger'; mensaje.textContent = err.message || 'Error al eliminar cuenta'; }
    } finally {
      newBtn.disabled = false;
    }
  });
}

// Exponer API global para invocar desde atributos onClick o icons
window.eliminarUsuario = (id, nombre) => abrirModalEliminar('modalEliminarCuenta', 'nombreUsuarioBorrando', { id, nombre });
window.editarUsuario = (id) => editUsuario(id);

// Async: editar usuario (llenar modal editar)
/**
 * Carga los datos del usuario y los inserta en el formulario de edición.
 * - Llama a `/usuario-detalle/:id` para obtener los datos.
 * @param {string} idUsuario - ID del usuario a editar
 */
async function editUsuario(idUsuario) {
  try {
    const response = await fetch(`/usuario-detalle/${encodeURIComponent(idUsuario)}`, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) throw new Error('No se pudieron obtener los datos del usuario');
    const data = await response.json();
    const usuario = data.usuario || data || {};

    // Debug: mostrar qué datos está recibiendo
    console.log('📍 Datos del usuario recibidos:', usuario);

    const inputNombre = get('editarNombre'); if (inputNombre) inputNombre.value = usuario.nombreUsuario || '';
    const inputApellido = get('editarApellido'); if (inputApellido) inputApellido.value = usuario.apellidoUsuario || '';
    const inputEmail = get('editarEmail');
    if (inputEmail) {
      inputEmail.value = usuario.email || '';
      // Guardar email original para comparación
      inputEmail.dataset.emailOriginal = usuario.email || '';
    }
    const inputTelefono = get('editarTelefono'); if (inputTelefono) inputTelefono.value = usuario.telefono || '';
    const inputContrasena = get('editarContrasena'); if (inputContrasena) inputContrasena.value = '';

    // Inicializar sistema de direcciones dinámicas
    if (typeof inicializarDireccionesDinamicas === 'function') {
      inicializarDireccionesDinamicas(usuario.direcciones || []);
    } else {
      console.warn('❌ Función inicializarDireccionesDinamicas no disponible');
    }

    const form = get('formEditarPerfil');
    if (form) {
      form.action = `/actualizar-perfil-usuario/${encodeURIComponent(idUsuario)}`;
      form.method = 'POST';
      // Guardar userId para validaciones de contraseña
      form.dataset.userId = idUsuario;
    }

    // Inicializar validaciones dinámicamente DESPUÉS de cargar los datos y mostrar el modal
    setTimeout(() => {
      if (typeof window.inicializarValidacionesEditarPerfil === 'function') {
        console.log('✅ Inicializando validaciones para editar perfil...');
        window.inicializarValidacionesEditarPerfil();
      } else {
        console.warn('❌ Función inicializarValidacionesEditarPerfil no disponible');
      }
    }, 300);

    // Limpiar estado de validación antes de mostrar el modal
    limpiarEstadoValidacion();

    const modalEl = get('modalEditarPerfil');
    if (modalEl) new bootstrap.Modal(modalEl).show();

  } catch (err) {
    console.error('Error cargando datos de usuario:', err);
  }
}

// Inicializar listeners cuando el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
  // Configurar botón de confirmación (eliminar cuenta)
  configurarBotonConfirmacion({ btnId: 'btnEliminarDefinitivo', modalId: 'modalEliminarCuenta', mensajeId: 'mensajeEstadoEliminacion' });

  // Botón editar perfil (usa data-id en el botón)
  const btnEditar = get('btnEditarPerfil');
  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      const id = btnEditar.getAttribute('data-id') || btnEditar.dataset.id;
      if (id) editUsuario(id);
    });
  }

  // Botón eliminar cuenta (abre modal paso 1)
  const btnEliminar = get('btnEliminarCuenta');
  if (btnEliminar) {
    btnEliminar.addEventListener('click', () => {
      const id = btnEliminar.getAttribute('data-id') || btnEliminar.dataset.id;
      const nombre = btnEliminar.getAttribute('data-name') || btnEliminar.dataset.name || '';
      abrirModalEliminar('modalEliminarCuenta', 'nombreUsuarioBorrando', { id, nombre });
    });
  }

  // Navegación interna del modal eliminar (continuar / volver)
  const btnContinuar = get('btnContinuarEliminacion');
  const btnVolver = get('btnVolverPasoUno');
  if (btnContinuar) {
    btnContinuar.addEventListener('click', () => {
      const pasoUno = get('pasoUnoEliminacion');
      const pasoDos = get('pasoDosEliminacion');
      const botonesUno = get('botonesPasoUno');
      const botonesDos = get('botonesPasoDos');
      if (pasoUno && pasoDos && botonesUno && botonesDos) {
        pasoUno.classList.add('d-none');
        pasoDos.classList.remove('d-none');
        botonesUno.classList.add('d-none');
        botonesDos.classList.remove('d-none');
      }
    });
  }
  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      const pasoUno = get('pasoUnoEliminacion');
      const pasoDos = get('pasoDosEliminacion');
      const botonesUno = get('botonesPasoUno');
      const botonesDos = get('botonesPasoDos');
      if (pasoUno && pasoDos && botonesUno && botonesDos) {
        pasoUno.classList.remove('d-none');
        pasoDos.classList.add('d-none');
        botonesUno.classList.remove('d-none');
        botonesDos.classList.add('d-none');
      }
    });
  }
});