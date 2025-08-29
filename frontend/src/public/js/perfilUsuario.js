// Lógica para manejar las acciones del perfil del usuario

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {

  // === FUNCIÓN PARA OBTENER DATOS DEL USUARIO DESDE ATRIBUTOS DATA ===
  function obtenerDatosUsuarioDesdeHTML() {
    console.log("📋 Obteniendo datos del usuario desde atributos HTML...");

    // Buscar el elemento que contiene los datos del usuario
    const elementoDatosUsuario = document.getElementById('datosUsuarioParaJS');

    if (elementoDatosUsuario) {
      // Extraer datos desde los atributos data-*
      const datosUsuarioExtraidos = {
        idPersona: elementoDatosUsuario.getAttribute('data-id-persona') || '',
        nombreUsuario: elementoDatosUsuario.getAttribute('data-nombre-usuario') || '',
        apellidoUsuario: elementoDatosUsuario.getAttribute('data-apellido-usuario') || '',
        email: elementoDatosUsuario.getAttribute('data-email') || '',
        telefono: elementoDatosUsuario.getAttribute('data-telefono') || '',
        estadoUsuario: elementoDatosUsuario.getAttribute('data-estado-usuario') || ''
      };

      // Crear objeto global para acceso desde otras funciones
      window.datosUsuario = datosUsuarioExtraidos;

      console.log('✅ Datos del usuario obtenidos correctamente:', window.datosUsuario);
      return datosUsuarioExtraidos;

    } else {
      console.log('⚠️ No se encontraron datos del usuario en el HTML');
      window.datosUsuario = null;
      return null;
    }
  }

  // === INICIALIZAR DATOS DEL USUARIO AL CARGAR LA PÁGINA ===
  // Obtener datos del usuario inmediatamente cuando se carga la página
  obtenerDatosUsuarioDesdeHTML();

  // === FUNCIONALIDAD PARA EDITAR PERFIL (AHORA CON MODAL) ===
  const botonEditarPerfil = document.getElementById("btnEditarPerfil");
  const modalEditarPerfil = document.getElementById("modalEditarPerfil");
  const formEditarPerfil = document.getElementById("formEditarPerfil");
  const btnGuardarCambios = document.getElementById("btnGuardarCambios");

  if (botonEditarPerfil && modalEditarPerfil) {

    botonEditarPerfil.addEventListener("click", function () {
      console.log("🖱️ Click en botón Editar Perfil");

      // Obtener el ID del usuario desde el atributo data-id del botón
      const idUsuarioAEditar = botonEditarPerfil.getAttribute("data-id");

      if (idUsuarioAEditar) {
        console.log("👤 ID del usuario a editar:", idUsuarioAEditar);

        // PASO 1: Llenar el formulario del modal con los datos actuales del usuario
        llenarFormularioConDatosActuales();

        // PASO 2: Mostrar el modal usando Bootstrap
        const instanciaModal = new bootstrap.Modal(modalEditarPerfil);
        instanciaModal.show();

        console.log("📝 Modal de edición abierto correctamente");

      } else {
        // Mostrar error si no se encuentra el ID
        console.error("❌ Error: No se encontró el ID del usuario para editar.");
        alert("Error: No se puede acceder a la edición del perfil.");
      }
    });
  }

  // === FUNCIÓN MEJORADA PARA LLENAR EL FORMULARIO CON DATOS ACTUALES ===
  function llenarFormularioConDatosActuales() {
    console.log("📋 Llenando formulario con datos actuales...");

    try {
      // MÉTODO MEJORADO: Obtener datos desde el objeto global ya inicializado
      let nombreUsuarioActual = '';
      let apellidoUsuarioActual = '';
      let emailActual = '';
      let telefonoActual = '';

      // Verificar si tenemos datos del usuario disponibles
      if (window.datosUsuario && window.datosUsuario.nombreUsuario) {
        // MÉTODO PRINCIPAL: Usar datos del objeto global
        nombreUsuarioActual = window.datosUsuario.nombreUsuario || '';
        apellidoUsuarioActual = window.datosUsuario.apellidoUsuario || '';
        emailActual = window.datosUsuario.email || '';
        telefonoActual = window.datosUsuario.telefono || '';

        console.log("✅ Datos obtenidos desde objeto global");

      } else {
        // MÉTODO FALLBACK: Obtener desde elementos de la página
        console.log("⚠️ Usando método fallback: extrayendo desde elementos HTML");

        const telefonoElemento = document.querySelector('.usuario-perfil-info .row:nth-child(1) .col-md-6:nth-child(2) div');
        const emailElemento = document.querySelector('.usuario-perfil-info .row:nth-child(2) .col-md-6:nth-child(1) div');

        emailActual = emailElemento ? emailElemento.textContent.trim() : '';
        telefonoActual = telefonoElemento ? telefonoElemento.textContent.trim() : '';

        // Para nombre y apellido, mostrar mensaje informativo
        mostrarMensajeModal("info", "Por favor verifica y completa tus datos en el formulario");
      }

      // Llenar los campos del formulario con los datos obtenidos
      const campoNombre = document.getElementById('editarNombre');
      const campoApellido = document.getElementById('editarApellido');
      const campoEmail = document.getElementById('editarEmail');
      const campoTelefono = document.getElementById('editarTelefono');
      const campoContrasena = document.getElementById('editarContrasena');

      if (campoNombre) {
        campoNombre.value = nombreUsuarioActual;
      }

      if (campoApellido) {
        campoApellido.value = apellidoUsuarioActual;
      }

      if (campoEmail) {
        campoEmail.value = emailActual;
      }

      if (campoTelefono) {
        // Solo llenar el teléfono si no es el mensaje de "No registrado"
        campoTelefono.value = (telefonoActual !== 'No registrado' && telefonoActual !== 'Error al cargar') ? telefonoActual : '';
      }

      if (campoContrasena) {
        // Siempre limpiar el campo de contraseña por seguridad
        campoContrasena.value = '';
      }

      console.log("✅ Formulario llenado con datos:", {
        nombre: nombreUsuarioActual,
        apellido: apellidoUsuarioActual,
        email: emailActual,
        telefono: telefonoActual
      });

    } catch (errorLlenandoFormulario) {
      console.error("❌ Error al llenar el formulario:", errorLlenandoFormulario);

      // En caso de error, limpiar todos los campos excepto contraseña
      const campos = ['editarNombre', 'editarApellido', 'editarEmail', 'editarTelefono'];
      campos.forEach(idCampo => {
        const campo = document.getElementById(idCampo);
        if (campo) {
          campo.value = '';
        }
      });

      // Siempre limpiar contraseña por seguridad
      const campoContrasena = document.getElementById('editarContrasena');
      if (campoContrasena) {
        campoContrasena.value = '';
      }

      mostrarMensajeModal("error", "Error al cargar los datos. Por favor ingresa la información manualmente.");
    }
  }

  // === FUNCIONALIDAD PARA GUARDAR CAMBIOS ===
  if (btnGuardarCambios && formEditarPerfil) {

    btnGuardarCambios.addEventListener("click", async function () {
      console.log("💾 Iniciando proceso de guardado...");

      // PASO 1: Obtener los datos del formulario
      const datosFormulario = new FormData(formEditarPerfil);
      const idUsuario = botonEditarPerfil.getAttribute("data-id");

      // Convertir FormData a objeto JavaScript para facilitar el manejo
      const datosUsuarioEditado = {
        nombreUsuario: datosFormulario.get('nombreUsuario'),
        apellidoUsuario: datosFormulario.get('apellidoUsuario'),
        email: datosFormulario.get('email'),
        telefono: datosFormulario.get('telefono'),
        contrasena: datosFormulario.get('contrasena') // Solo se enviará si no está vacía
      };

      console.log("📝 Datos a enviar:", datosUsuarioEditado);

      // PASO 2: Validar que los campos obligatorios no estén vacíos
      if (!datosUsuarioEditado.nombreUsuario || !datosUsuarioEditado.apellidoUsuario || !datosUsuarioEditado.email) {
        mostrarMensajeModal("error", "Por favor completa todos los campos obligatorios (Nombre, Apellido y Email)");
        return;
      }

      // PASO 3: Mostrar indicador de carga
      btnGuardarCambios.disabled = true;
      btnGuardarCambios.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

      try {
        // PASO 4: Enviar datos al servidor
        const respuestaServidor = await fetch(`/actualizar-perfil-usuario/${idUsuario}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosUsuarioEditado)
        });

        if (respuestaServidor.ok) {
          // ÉXITO: Los datos se guardaron correctamente
          console.log("✅ Perfil actualizado exitosamente");

          mostrarMensajeModal("success", "¡Perfil actualizado exitosamente! La página se recargará para mostrar los cambios.");

          // Esperar 2 segundos y recargar la página para mostrar los cambios
          setTimeout(() => {
            window.location.reload();
          }, 2000);

        } else {
          // ERROR: Hubo un problema en el servidor
          const datosError = await respuestaServidor.json();
          const mensajeError = datosError.error || datosError.mensaje || "Error desconocido al actualizar el perfil";

          console.error("❌ Error del servidor:", mensajeError);
          mostrarMensajeModal("error", `Error al actualizar el perfil: ${mensajeError}`);
        }

      } catch (errorConexion) {
        // ERROR DE CONEXIÓN: No se pudo conectar con el servidor
        console.error("🌐 Error de conexión:", errorConexion);
        mostrarMensajeModal("error", "Error de conexión con el servidor. Verifica tu conexión a internet e intenta nuevamente.");

      } finally {
        // PASO 5: Restaurar el botón a su estado original
        btnGuardarCambios.disabled = false;
        btnGuardarCambios.innerHTML = '<i class="fas fa-save me-1"></i> Guardar Cambios';
      }
    });
  }

  // === FUNCIÓN MEJORADA PARA MOSTRAR MENSAJES EN EL MODAL (AHORA CON TIPO INFO) ===
  function mostrarMensajeModal(tipo, mensaje) {
    const elementoMensaje = document.getElementById('mensajeEstadoModal');

    if (elementoMensaje) {
      // Limpiar clases anteriores
      elementoMensaje.className = 'alert';

      // Agregar clase según el tipo de mensaje
      if (tipo === 'success') {
        elementoMensaje.classList.add('alert-success');
      } else if (tipo === 'error') {
        elementoMensaje.classList.add('alert-danger');
      } else if (tipo === 'info') {
        // Nuevo tipo para mensajes informativos
        elementoMensaje.classList.add('alert-info');
      }

      // Mostrar el mensaje
      elementoMensaje.textContent = mensaje;
      elementoMensaje.classList.remove('d-none');

      console.log(`📢 Mensaje ${tipo}:`, mensaje);
    }
  }

  // === FUNCIONALIDAD PARA ELIMINAR CUENTA (AHORA CON MODAL) ===
  const botonEliminarCuenta = document.getElementById("btnEliminarCuenta");
  const modalEliminarCuenta = document.getElementById("modalEliminarCuenta");
  const btnContinuarEliminacion = document.getElementById("btnContinuarEliminacion");
  const btnVolverPasoUno = document.getElementById("btnVolverPasoUno");
  const btnEliminarDefinitivo = document.getElementById("btnEliminarDefinitivo");
  const inputConfirmarContrasena = document.getElementById("confirmarContrasenaEliminacion");
  const btnMostrarContrasena = document.getElementById("mostrarContrasenaEliminacion");

  if (botonEliminarCuenta && modalEliminarCuenta) {

    // PASO 1: Abrir modal cuando se hace clic en "Eliminar cuenta"
    botonEliminarCuenta.addEventListener("click", function () {
      console.log("🗑️ Click en botón Eliminar Cuenta");

      // Reiniciar el modal al paso 1
      mostrarPasoEliminacion(1);

      // Abrir el modal de eliminación
      const instanciaModal = new bootstrap.Modal(modalEliminarCuenta);
      instanciaModal.show();

      console.log("⚠️ Modal de eliminación abierto");
    });

    // FUNCIONALIDAD ADICIONAL: Mostrar/Ocultar contraseña en el modal de eliminación
    if (btnMostrarContrasena && inputConfirmarContrasena) {
      btnMostrarContrasena.addEventListener("click", function () {
        const tipoInputActual = inputConfirmarContrasena.type;
        const iconoOjo = document.getElementById("iconoOjoContrasena");

        if (tipoInputActual === "password") {
          // Mostrar contraseña
          inputConfirmarContrasena.type = "text";
          iconoOjo.className = "fas fa-eye-slash";
          console.log("👁️ Contraseña visible en modal de eliminación");
        } else {
          // Ocultar contraseña
          inputConfirmarContrasena.type = "password";
          iconoOjo.className = "fas fa-eye";
          console.log("👁️‍🗨️ Contraseña oculta en modal de eliminación");
        }
      });
    }

    // PASO 2: Continuar al segundo paso de confirmación
    if (btnContinuarEliminacion) {
      btnContinuarEliminacion.addEventListener("click", function () {
        console.log("➡️ Avanzando al paso 2 de eliminación");
        mostrarPasoEliminacion(2);
      });
    }

    // PASO 3: Volver al primer paso
    if (btnVolverPasoUno) {
      btnVolverPasoUno.addEventListener("click", function () {
        console.log("⬅️ Volviendo al paso 1 de eliminación");
        mostrarPasoEliminacion(1);
      });
    }

    // PASO 4: Procesar eliminación definitiva con validación de contraseña
    if (btnEliminarDefinitivo) {
      btnEliminarDefinitivo.addEventListener("click", async function () {
        console.log("🚨 Procesando eliminación definitiva con validación de contraseña...");

        // Verificar que el usuario ingresó su contraseña
        const contrasenaIngresada = inputConfirmarContrasena.value.trim();

        if (!contrasenaIngresada) {
          mostrarMensajeEliminacion("error", "❌ Debes ingresar tu contraseña actual para confirmar la eliminación");
          return;
        }

        // Verificar que la contraseña tenga una longitud mínima razonable
        if (contrasenaIngresada.length < 3) {
          mostrarMensajeEliminacion("error", "❌ La contraseña ingresada parece ser muy corta. Verifica que sea correcta");
          return;
        }

        // Obtener ID del usuario
        const idUsuarioAEliminar = botonEliminarCuenta.getAttribute("data-id");

        if (!idUsuarioAEliminar) {
          mostrarMensajeEliminacion("error", "❌ Error: No se encontró el ID del usuario");
          return;
        }

        // Deshabilitar botón y mostrar carga
        btnEliminarDefinitivo.disabled = true;
        btnEliminarDefinitivo.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Validando contraseña...';

        try {
          // PASO 4.1: Primero validar la contraseña antes de eliminar
          console.log("🔐 Validando contraseña del usuario...");

          const validacionContrasena = await fetch(`/validar-contrasena-usuario/${idUsuarioAEliminar}`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contrasenaIngresada: contrasenaIngresada
            })
          });

          // Mostrar detalles del error para debugging
          if (!validacionContrasena.ok) {
            const datosErrorValidacion = await validacionContrasena.json();
            console.error("❌ Error en validación - Status:", validacionContrasena.status);
            console.error("❌ Error en validación - Datos:", datosErrorValidacion);

            let mensajeErrorValidacion = "Error desconocido al validar contraseña";

            if (validacionContrasena.status === 401) {
              mensajeErrorValidacion = "La contraseña ingresada es incorrecta";
            } else if (datosErrorValidacion.error) {
              mensajeErrorValidacion = datosErrorValidacion.error;
            } else if (datosErrorValidacion.mensaje) {
              mensajeErrorValidacion = datosErrorValidacion.mensaje;
            }

            mostrarMensajeEliminacion("error", `❌ ${mensajeErrorValidacion}`);
            return;
          }

          console.log("✅ Contraseña validada correctamente");

          // PASO 4.2: Si la contraseña es correcta, proceder con la eliminación
          btnEliminarDefinitivo.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Eliminando cuenta...';

          const respuestaEliminacion = await fetch(`/desactivar-cuenta-usuario/${idUsuarioAEliminar}`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (respuestaEliminacion.ok) {
            // ÉXITO: La cuenta se desactivó correctamente
            console.log("✅ Cuenta desactivada exitosamente");

            mostrarMensajeEliminacion("success", "✅ Tu cuenta ha sido eliminada exitosamente. Serás redirigido al inicio en 3 segundos...");

            // Esperar 3 segundos antes de cerrar sesión y redirigir
            setTimeout(() => {
              // Limpiar cookies de sesión (cerrar sesión)
              document.cookie = "usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

              // Redirigir a la página principal sin sesión
              window.location.href = "/";
            }, 3000);

          } else {
            // ERROR: Hubo un problema en el servidor al eliminar
            const datosError = await respuestaEliminacion.json();
            const mensajeError = datosError.error || datosError.mensaje || "Error desconocido al eliminar la cuenta";

            console.error("❌ Error del servidor al eliminar:", mensajeError);
            mostrarMensajeEliminacion("error", `❌ Error al eliminar la cuenta: ${mensajeError}`);
          }

        } catch (errorConexion) {
          // ERROR DE CONEXIÓN: No se pudo conectar con el servidor
          console.error("🌐 Error de conexión completo:", errorConexion);
          mostrarMensajeEliminacion("error", "❌ Error de conexión con el servidor. Verifica tu conexión a internet e intenta nuevamente.");

        } finally {
          // Restaurar el botón a su estado original
          btnEliminarDefinitivo.disabled = false;
          btnEliminarDefinitivo.innerHTML = '<i class="fas fa-trash-alt me-1"></i> Eliminar Cuenta';
        }
      });
    }
  }

  // === FUNCIÓN PARA MOSTRAR DIFERENTES PASOS EN EL MODAL DE ELIMINACIÓN ===
  function mostrarPasoEliminacion(numeroPaso) {
    const pasoUno = document.getElementById('pasoUnoEliminacion');
    const pasoDos = document.getElementById('pasoDosEliminacion');
    const botonesPasoUno = document.getElementById('botonesPasoUno');
    const botonesPasoDos = document.getElementById('botonesPasoDos');

    if (numeroPaso === 1) {
      // Mostrar paso 1 y ocultar paso 2
      pasoUno.classList.remove('d-none');
      pasoDos.classList.add('d-none');
      botonesPasoUno.classList.remove('d-none');
      botonesPasoDos.classList.add('d-none');

      // Limpiar el campo de contraseña
      if (inputConfirmarContrasena) {
        inputConfirmarContrasena.value = '';
        inputConfirmarContrasena.type = 'password'; // Asegurar que esté oculta
      }

      console.log("📋 Mostrando paso 1 de eliminación");

    } else if (numeroPaso === 2) {
      // Mostrar paso 2 y ocultar paso 1
      pasoUno.classList.add('d-none');
      pasoDos.classList.remove('d-none');
      botonesPasoUno.classList.add('d-none');
      botonesPasoDos.classList.remove('d-none');

      // Enfocar el campo de contraseña
      if (inputConfirmarContrasena) {
        inputConfirmarContrasena.focus();
      }

      console.log("📋 Mostrando paso 2 de eliminación");
    }

    // Limpiar mensajes anteriores
    const elementoMensaje = document.getElementById('mensajeEstadoEliminacion');
    if (elementoMensaje) {
      elementoMensaje.classList.add('d-none');
    }
  }

  // === FUNCIÓN PARA MOSTRAR MENSAJES EN EL MODAL DE ELIMINACIÓN ===
  function mostrarMensajeEliminacion(tipo, mensaje) {
    const elementoMensaje = document.getElementById('mensajeEstadoEliminacion');

    if (elementoMensaje) {
      // Limpiar clases anteriores
      elementoMensaje.className = 'alert';

      // Agregar clase según el tipo de mensaje
      if (tipo === 'success') {
        elementoMensaje.classList.add('alert-success');
      } else if (tipo === 'error') {
        elementoMensaje.classList.add('alert-danger');
      }

      // Mostrar el mensaje
      elementoMensaje.textContent = mensaje;
      elementoMensaje.classList.remove('d-none');

      console.log(`📢 Mensaje eliminación ${tipo}:`, mensaje);
    }
  }

  // === FUNCIONALIDAD ADICIONAL: MOSTRAR MENSAJE DE BIENVENIDA (SIN CAMBIOS) ===
  // Mostrar mensaje de bienvenida si el usuario acaba de loguearse
  const parametrosUrl = new URLSearchParams(window.location.search);
  const mensajeExito = parametrosUrl.get('exito');

  if (mensajeExito) {
    // Crear y mostrar notificación de éxito
    const notificacionExito = document.createElement('div');
    notificacionExito.className = 'alert alert-success alert-dismissible fade show position-fixed';
    notificacionExito.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 300px;';
    notificacionExito.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      ${mensajeExito}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notificacionExito);

    // Auto-eliminar la notificación después de 5 segundos
    setTimeout(() => {
      if (notificacionExito.parentNode) {
        notificacionExito.remove();
      }
    }, 5000);
  }
});

