document.addEventListener('DOMContentLoaded', () => {
  // Helpers para DOM
  const getById = id => document.getElementById(id);

  // Elementos principales
  const elementoDatosUsuario = getById('datosUsuarioParaJS');
  const botonEditarPerfil = getById('btnEditarPerfil');
  const modalEditarPerfil = getById('modalEditarPerfil');
  const formEditarPerfil = getById('formEditarPerfil');
  const btnGuardarCambios = getById('btnGuardarCambios');

  const botonEliminarCuenta = getById('btnEliminarCuenta');
  const modalEliminarCuenta = getById('modalEliminarCuenta');
  const btnContinuarEliminacion = getById('btnContinuarEliminacion');
  const btnVolverPasoUno = getById('btnVolverPasoUno');
  const btnEliminarDefinitivo = getById('btnEliminarDefinitivo');
  const inputConfirmarContrasena = getById('confirmarContrasenaEliminacion');
  const btnMostrarContrasena = getById('mostrarContrasenaEliminacion');

  // Obtener datos embebidos en HTML (data-*)
  function obtenerDatosUsuarioDesdeHTML() {
    if (!elementoDatosUsuario) { window.datosUsuario = null; return null; }
    const ds = elementoDatosUsuario.dataset;
    const datos = {
      idPersona: ds.idPersona || '',
      nombreUsuario: ds.nombreUsuario || '',
      apellidoUsuario: ds.apellidoUsuario || '',
      email: ds.email || '',
      telefono: ds.telefono || '',
      estadoUsuario: ds.estadoUsuario || ''
    };
    window.datosUsuario = datos;
    return datos;
  }
  obtenerDatosUsuarioDesdeHTML();

  // Rellenar formulario de edición con datos actuales 
  function llenarFormularioConDatosActuales() {
    const datos = window.datosUsuario || obtenerDatosUsuarioDesdeHTML() || {};
    const campo = id => getById(id);
    if (campo('editarNombre')) campo('editarNombre').value = datos.nombreUsuario || '';
    if (campo('editarApellido')) campo('editarApellido').value = datos.apellidoUsuario || '';
    if (campo('editarEmail')) campo('editarEmail').value = datos.email || '';
    if (campo('editarTelefono')) campo('editarTelefono').value = (datos.telefono && datos.telefono !== 'No registrado') ? datos.telefono : '';
    if (campo('editarContrasena')) campo('editarContrasena').value = ''; // limpiar por seguridad
  }

  // Abrir modal de edición y rellenar
  if (botonEditarPerfil && modalEditarPerfil) {
    botonEditarPerfil.addEventListener('click', () => {
      const idUsuario = botonEditarPerfil.dataset.id || botonEditarPerfil.getAttribute('data-id');
      if (!idUsuario) { console.error('ID de usuario no encontrado para editar'); return; }
      llenarFormularioConDatosActuales();
      new bootstrap.Modal(modalEditarPerfil).show();
    });
  }

  // Guardar cambios (envía PUT a la ruta del servidor)
  if (btnGuardarCambios && formEditarPerfil) {
    btnGuardarCambios.addEventListener('click', async () => {
      const formData = new FormData(formEditarPerfil);
      const idUsuario = botonEditarPerfil?.dataset?.id || botonEditarPerfil?.getAttribute('data-id');
      const datos = {
        nombreUsuario: formData.get('nombreUsuario') || '',
        apellidoUsuario: formData.get('apellidoUsuario') || '',
        email: formData.get('email') || '',
        telefono: formData.get('telefono') || '',
        contrasena: formData.get('contrasena') || ''
      };

      // Validación mínima 
      if (!datos.nombreUsuario || !datos.apellidoUsuario || !datos.email) {
        console.error('Faltan campos obligatorios para guardar perfil');
        return;
      }

      // Bloquear botón y mostrar indicador simple en el HTML (si se desea)
      btnGuardarCambios.disabled = true;
      try {
        const resp = await fetch(`/actualizar-perfil-usuario/${idUsuario}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });

        if (resp.ok) {
          console.debug('Perfil actualizado correctamente');
          // recargar para mostrar cambios en vista 
          window.location.reload();
        } else {
          const err = await resp.json().catch(() => ({}));
          console.error('Error al actualizar perfil:', err.error || err.mensaje || resp.status);
        }
      } catch (e) {
        console.error('Error de conexión al actualizar perfil:', e);
      } finally {
        btnGuardarCambios.disabled = false;
      }
    });
  }

  // LOGICA DE ELIMINACIÓN: modal con dos pasos + validación de contraseña
  function mostrarPasoEliminacion(paso) {
    const pasoUno = getById('pasoUnoEliminacion');
    const pasoDos = getById('pasoDosEliminacion');
    const botonesUno = getById('botonesPasoUno');
    const botonesDos = getById('botonesPasoDos');
    if (!pasoUno || !pasoDos || !botonesUno || !botonesDos) return;
    pasoUno.classList.toggle('d-none', paso !== 1);
    pasoDos.classList.toggle('d-none', paso !== 2);
    botonesUno.classList.toggle('d-none', paso !== 1);
    botonesDos.classList.toggle('d-none', paso !== 2);
    if (inputConfirmarContrasena) { inputConfirmarContrasena.value = ''; inputConfirmarContrasena.type = 'password'; if (paso === 2) inputConfirmarContrasena.focus(); }
  }

  if (botonEliminarCuenta && modalEliminarCuenta) {
    botonEliminarCuenta.addEventListener('click', () => {
      mostrarPasoEliminacion(1);
      new bootstrap.Modal(modalEliminarCuenta).show();
    });
  }

  if (btnContinuarEliminacion) btnContinuarEliminacion.addEventListener('click', () => mostrarPasoEliminacion(2));
  if (btnVolverPasoUno) btnVolverPasoUno.addEventListener('click', () => mostrarPasoEliminacion(1));

  // Mostrar/ocultar contraseña en modal
  if (btnMostrarContrasena && inputConfirmarContrasena) {
    btnMostrarContrasena.addEventListener('click', () => {
      const icono = getById('iconoOjoContrasena');
      if (inputConfirmarContrasena.type === 'password') {
        inputConfirmarContrasena.type = 'text';
        if (icono) icono.className = 'fas fa-eye-slash';
      } else {
        inputConfirmarContrasena.type = 'password';
        if (icono) icono.className = 'fas fa-eye';
      }
    });
  }

  // Botón definitivo: valida contraseña y luego desactiva cuenta 
  if (btnEliminarDefinitivo) {
    btnEliminarDefinitivo.addEventListener('click', async () => {
      const contrasena = (inputConfirmarContrasena?.value || '').trim();
      const idUsuario = botonEliminarCuenta?.dataset?.id || botonEliminarCuenta?.getAttribute('data-id');
      if (!contrasena) { console.error('Contraseña requerida para eliminar cuenta'); return; }
      if (!idUsuario) { console.error('ID usuario no encontrado para eliminar'); return; }

      btnEliminarDefinitivo.disabled = true;
      try {
        // Paso 1: validar contraseña
        const validar = await fetch(`/validar-contrasena-usuario/${idUsuario}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contrasenaIngresada: contrasena })
        });

        if (!validar.ok) {
          console.error('Validación de contraseña falló', validar.status);
          return;
        }

        // Paso 2: desactivar cuenta en servidor
        const eliminar = await fetch(`/desactivar-cuenta-usuario/${idUsuario}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });

        if (!eliminar.ok) {
          const err = await eliminar.json().catch(() => ({}));
          console.error('Error al desactivar cuenta:', err.error || err.mensaje || eliminar.status);
          return;
        }

        // Limpieza local y redirección 
        document.cookie = 'usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/';
      } catch (e) {
        console.error('Error en proceso de eliminación:', e);
      } finally {
        btnEliminarDefinitivo.disabled = false;
      }
    });
  }
});