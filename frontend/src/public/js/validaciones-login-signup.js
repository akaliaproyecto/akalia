/* Validaciones de formularios - Registro, Login y Editar Perfil */

// ===============================
// FUNCIONES UTILITARIAS GLOBALES
// ===============================

// Funciones de validación compartidas (disponibles globalmente)
/**
 * Mostrar un error visual en un campo y elemento asociado.
 * @param {HTMLElement} campo - Elemento input
 * @param {HTMLElement} elementoError - Elemento donde mostrar el mensaje
 * @param {string} mensaje - Texto del mensaje de error
 */
function mostrarError(campo, elementoError, mensaje) {
  if (campo) {
    campo.classList.add('is-invalid');
    campo.classList.remove('is-valid');
  }
  if (elementoError) {
    elementoError.textContent = mensaje;
    elementoError.style.display = 'block';
    elementoError.classList.add('d-block');
    elementoError.classList.remove('d-none');
  }
}

/**
 * Marcar campo como válido y ocultar mensaje de error.
 * @param {HTMLElement} campo
 * @param {HTMLElement} elementoError
 */
function mostrarExito(campo, elementoError) {
  if (campo) {
    campo.classList.add('is-valid');
    campo.classList.remove('is-invalid');
  }
  if (elementoError) {
    elementoError.textContent = '';
    elementoError.style.display = 'none';
    elementoError.classList.add('d-none');
    elementoError.classList.remove('d-block');
  }
}

// Validación de formato de email (reutilizable)
/**
 * Valida que una cadena tenga formato de email básico.
 * @param {string} email
 * @returns {boolean}
 */
function validarFormatoEmail(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

// Validación de nombre/apellido (reutilizable)
function validarFormatoNombreApellido(valor) {
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return valor.length >= 3 && valor.length <= 30 && regexNombre.test(valor);
}

// Validación de teléfono (reutilizable)
function validarFormatoTelefono(telefono) {
  const regexTelefono = /^\d{10}$/;
  return regexTelefono.test(telefono);
}

// Función de validación de nombre/apellido reutilizable
/**
 * Valida un campo de nombre o apellido y muestra mensajes adecuadamente.
 * @param {HTMLInputElement} campo
 * @param {HTMLElement} elementoError
 * @param {string} tipoCampo
 * @returns {boolean}
 */
function validarNombreApellido(campo, elementoError, tipoCampo) {
  const valor = campo.value.trim();

  if (!valor) {
    mostrarError(campo, elementoError, `El ${tipoCampo} es requerido`);
    return false;
  }

  if (!validarFormatoNombreApellido(valor)) {
    if (valor.length < 3 || valor.length > 30) {
      mostrarError(campo, elementoError, `El ${tipoCampo} debe tener mín 3 y máx 30 caracteres`);
    } else {
      mostrarError(campo, elementoError, `El ${tipoCampo} solo puede contener letras y espacios`);
    }
    return false;
  }

  mostrarExito(campo, elementoError);
  return true;
}

// Función de validación de email reutilizable
/**
 * Valida un email y opcionalmente verifica si ya existe en el backend.
 * @param {HTMLInputElement} campo
 * @param {HTMLElement} elementoError
 * @param {boolean} verificarExistencia
 * @returns {Promise<boolean>}
 */
function validarEmailUsuario(campo, elementoError, verificarExistencia = false) {
  return new Promise(async (resolve) => {
    const email = campo.value.trim();

    if (!email) {
      mostrarError(campo, elementoError, 'El email es requerido');
      resolve(false);
      return;
    }

    if (!validarFormatoEmail(email)) {
      mostrarError(campo, elementoError, 'Formato de email inválido');
      resolve(false);
      return;
    }

    if (verificarExistencia) {
      try {
        const form = document.getElementById('recuperarForm')
        if (form) {
          return;
        }
        // Verificar si el email ya existe
        const respuesta = await fetch(`${API_BASE_URL}/api/usuarios/verificar-email/${encodeURIComponent(email)}`);
        const datos = await respuesta.json();
        if (datos.existe)  {
          mostrarError(campo, elementoError, 'Este correo ya está registrado');
          resolve(false);
          return;
        } 
      } catch (error) {
        console.error('Error al verificar email:', error);
        mostrarError(campo, elementoError, 'Error verificando email, pruebe nuevamente');
        resolve(false);
        return;
      }
    }

    mostrarExito(campo, elementoError);
    resolve(true);
  });
}

// Función de validación de teléfono reutilizable
/**
 * Valida un número de teléfono (10 dígitos) y actualiza la UI.
 * @param {HTMLInputElement} campo
 * @param {HTMLElement} elementoError
 * @param {boolean} esRequerido
 * @returns {boolean}
 */
function validarTelefonoUsuario(campo, elementoError, esRequerido = false) {
  const telefono = campo.value.trim();

  if (!telefono) {
    if (esRequerido) {
      mostrarError(campo, elementoError, 'El teléfono es requerido');
      return false;
    } else {
      mostrarExito(campo, elementoError);
      return true; // Es opcional
    }
  }

  if (!validarFormatoTelefono(telefono)) {
    mostrarError(campo, elementoError, 'El teléfono debe contener exactamente 10 números');
    return false;
  }

  mostrarExito(campo, elementoError);
  return true;
}

// Función de validación de contraseña reutilizable
/**
 * Valida una contraseña según reglas mínimas (8+ caracteres, mayúscula, número, símbolo).
 * @param {HTMLInputElement} campo
 * @param {HTMLElement} elementoError
 * @param {boolean} esRequerida
 * @returns {boolean}
 */
function validarContrasenaUsuario(campo, elementoError, esRequerida = true) {
  const contrasena = campo.value;

  if (!contrasena) {
    if (esRequerida) {
      mostrarError(campo, elementoError, 'La contraseña es requerida');
      return false;
    } else {
      mostrarExito(campo, elementoError);
      return true; // Es opcional (para editar perfil)
    }
  }

  if (contrasena.length < 8) {
    mostrarError(campo, elementoError, 'La contraseña debe tener al menos 8 caracteres');
    return false;
  }

  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneNumero = /\d/.test(contrasena);
  const tieneSimbolo = /[!@#$%^&*(),.?":{}|<>]/.test(contrasena);

  if (!tieneMayuscula) {
    mostrarError(campo, elementoError, 'La contraseña debe incluir al menos una letra mayúscula');
    return false;
  }

  if (!tieneNumero) {
    mostrarError(campo, elementoError, 'La contraseña debe incluir al menos un número');
    return false;
  }

  if (!tieneSimbolo) {
    mostrarError(campo, elementoError, 'La contraseña debe incluir al menos un símbolo');
    return false;
  }

  mostrarExito(campo, elementoError);
  return true;
}

// Función de validación de confirmación de contraseña reutilizable
/**
 * Valida que la confirmación de contraseña coincida con la original.
 * @param {HTMLInputElement} campoContrasena
 * @param {HTMLInputElement} campoConfirmacion
 * @param {HTMLElement} elementoError
 * @returns {boolean}
 */
function validarConfirmacionContrasena(campoContrasena, campoConfirmacion, elementoError) {
  const contrasena = campoContrasena.value;
  const confirmarContrasena = campoConfirmacion.value;

  if (!confirmarContrasena) {
    mostrarError(campoConfirmacion, elementoError, 'Debe confirmar la contraseña');
    return false;
  }

  if (contrasena !== confirmarContrasena) {
    mostrarError(campoConfirmacion, elementoError, 'Las contraseñas no coinciden');
    return false;
  }

  mostrarExito(campoConfirmacion, elementoError);
  return true;
}

// ===============================
// FUNCIÓN PARA INICIALIZAR VALIDACIONES DE EDITAR PERFIL (DINÁMICAMENTE)
// ===============================

/**
 * Inicializa validaciones del formulario editar perfil (listeners y lógica).
 */
function inicializarValidacionesEditarPerfil() {

  const formularioEditarPerfil = document.getElementById('formEditarPerfil');

  if (!formularioEditarPerfil) {
    console.error('Formulario de editar perfil no encontrado');
    return;
  }

  // Verificar si ya se inicializaron las validaciones para evitar duplicados
  if (formularioEditarPerfil.dataset.validacionesInicializadas === 'true') {
    return;
  }


  // Elementos del formulario de editar perfil
  const campoNombrePerfil = document.getElementById('editarNombre');
  const campoApellidoPerfil = document.getElementById('editarApellido');
  const campoEmailPerfil = document.getElementById('editarEmail');
  const campoTelefonoPerfil = document.getElementById('editarTelefono');
  const campoContrasenaEdit = document.getElementById('editarContrasena');

  // Elementos de error
  const errorNombrePerfil = document.getElementById('editarNombreError');
  const errorApellidoPerfil = document.getElementById('editarApellidoError');
  const errorEmailPerfil = document.getElementById('editarEmailError');
  const errorTelefonoPerfil = document.getElementById('editarTelefonoError');
  const errorContrasenaEdit = document.getElementById('editarContrasenaError');

  // Funciones de validación locales que llaman a las reutilizables
  const validarNombrePerfilFunc = () => validarNombreApellido(campoNombrePerfil, errorNombrePerfil, 'nombre');
  const validarApellidoPerfilFunc = () => validarNombreApellido(campoApellidoPerfil, errorApellidoPerfil, 'apellido');

  // Validación especial para email en perfil: verificar existencia pero excluir email actual
  const validarEmailPerfilFunc = async () => {
    const emailActual = campoEmailPerfil.dataset.emailOriginal || '';
    const emailNuevo = campoEmailPerfil.value.trim();

    // Si el email no ha cambiado, no verificar existencia
    if (emailActual === emailNuevo) {
      return validarEmailUsuario(campoEmailPerfil, errorEmailPerfil, false);
    }

    // Si cambió, verificar que no exista en la base de datos
    return validarEmailUsuario(campoEmailPerfil, errorEmailPerfil, true);
  };

  const validarTelefonoPerfilFunc = () => validarTelefonoUsuario(campoTelefonoPerfil, errorTelefonoPerfil, false);

  // Elementos adicionales para cambio de contraseña
  const btnCambiarContrasena = document.getElementById('btnCambiarContrasena');
  const camposContrasena = document.getElementById('camposContrasena');
  const campoContrasenaActual = document.getElementById('contrasenaActual');
  const campoConfirmarNuevaContrasena = document.getElementById('confirmarNuevaContrasena');
  const errorContrasenaActual = document.getElementById('contrasenaActualError');
  const errorConfirmarNuevaContrasena = document.getElementById('confirmarNuevaContrasenaError');

  // Funciones de validación para contraseñas
  const validarContrasenaActualFunc = async () => {
    const contrasena = campoContrasenaActual?.value.trim() || '';
    if (!contrasena) {
      mostrarError(campoContrasenaActual, errorContrasenaActual, 'La contraseña actual es requerida');
      return false;
    }

    // Verificar la contraseña actual usando la función global
    try {
      const userId = document.getElementById('formEditarPerfil')?.dataset.userId;
      if (!userId) {
        mostrarError(campoContrasenaActual, errorContrasenaActual, 'Error de autenticación');
        return false;
      }

      // Usar la función global definida en perfilUsuario.js
      if (typeof verificarContrasenaActual === 'function') {
        const result = await verificarContrasenaActual(userId, contrasena);

        if (result.valida) {
          mostrarExito(campoContrasenaActual, errorContrasenaActual);
          return true;
        } else {
          mostrarError(campoContrasenaActual, errorContrasenaActual, result.mensaje || 'Contraseña actual incorrecta');
          return false;
        }
      } else {
        mostrarError(campoContrasenaActual, errorContrasenaActual, 'Función de verificación no disponible');
        return false;
      }
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      mostrarError(campoContrasenaActual, errorContrasenaActual, 'Error al verificar la contraseña');
      return false;
    }
  };

  const validarContrasenaEditFunc = () => {
    // Solo validar si los campos de contraseña están visibles
    if (camposContrasena && camposContrasena.style.display === 'none') {
      return true; // No validar si no se está cambiando la contraseña
    }
    return validarContrasenaUsuario(campoContrasenaEdit, errorContrasenaEdit, true);
  };

  const validarConfirmarNuevaContrasenaFunc = () => {
    // Solo validar si los campos de contraseña están visibles
    if (camposContrasena && camposContrasena.style.display === 'none') {
      return true;
    }
    return validarConfirmacionContrasena(campoContrasenaEdit, campoConfirmarNuevaContrasena, errorConfirmarNuevaContrasena);
  };

  // Manejador del botón "Cambiar contraseña"
  if (btnCambiarContrasena) {
    btnCambiarContrasena.addEventListener('click', (e) => {
      e.preventDefault();
      if (camposContrasena) {
        const estaVisible = camposContrasena.style.display !== 'none';
        if (estaVisible) {
          // Ocultar campos
          camposContrasena.style.display = 'none';
          btnCambiarContrasena.textContent = 'Cambiar contraseña';
          // Limpiar campos
          if (campoContrasenaActual) campoContrasenaActual.value = '';
          if (campoContrasenaEdit) campoContrasenaEdit.value = '';
          if (campoConfirmarNuevaContrasena) campoConfirmarNuevaContrasena.value = '';
          // Limpiar errores
          mostrarExito(campoContrasenaActual, errorContrasenaActual);
          mostrarExito(campoContrasenaEdit, errorContrasenaEdit);
          mostrarExito(campoConfirmarNuevaContrasena, errorConfirmarNuevaContrasena);
        } else {
          // Mostrar campos
          camposContrasena.style.display = 'block';
          btnCambiarContrasena.textContent = 'Cancelar cambio de contraseña';
        }
      }
    });
  }

  // Event listeners para validación en tiempo real - Editar Perfil
  if (campoNombrePerfil) {
    campoNombrePerfil.addEventListener('blur', validarNombrePerfilFunc);
    campoNombrePerfil.addEventListener('input', validarNombrePerfilFunc);
  }
  if (campoApellidoPerfil) {
    campoApellidoPerfil.addEventListener('blur', validarApellidoPerfilFunc);
    campoApellidoPerfil.addEventListener('input', validarApellidoPerfilFunc);
  }
  if (campoEmailPerfil) {
    campoEmailPerfil.addEventListener('blur', validarEmailPerfilFunc);
    campoEmailPerfil.addEventListener('input', validarEmailPerfilFunc);
  }
  if (campoTelefonoPerfil) {
    campoTelefonoPerfil.addEventListener('blur', validarTelefonoPerfilFunc);
    campoTelefonoPerfil.addEventListener('input', validarTelefonoPerfilFunc);
  }
  if (campoContrasenaActual) {
    campoContrasenaActual.addEventListener('blur', validarContrasenaActualFunc);
    campoContrasenaActual.addEventListener('input', validarContrasenaActualFunc);
  }
  if (campoContrasenaEdit) {
    campoContrasenaEdit.addEventListener('blur', validarContrasenaEditFunc);
    campoContrasenaEdit.addEventListener('input', validarContrasenaEditFunc);
  }
  if (campoConfirmarNuevaContrasena) {
    campoConfirmarNuevaContrasena.addEventListener('blur', validarConfirmarNuevaContrasenaFunc);
    campoConfirmarNuevaContrasena.addEventListener('input', validarConfirmarNuevaContrasenaFunc);
  }

  // Validación al enviar el formulario de editar perfil
  formularioEditarPerfil.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    // Preparar validaciones básicas
    const validacionesBasicas = [
      validarNombrePerfilFunc(),
      validarApellidoPerfilFunc(),
      validarEmailPerfilFunc(),
      validarTelefonoPerfilFunc()
    ];

    // Agregar validaciones de contraseña si están visibles
    if (camposContrasena && camposContrasena.style.display !== 'none') {
      validacionesBasicas.push(
        validarContrasenaActualFunc(),
        validarContrasenaEditFunc(),
        validarConfirmarNuevaContrasenaFunc()
      );
    }

    // Ejecutar todas las validaciones
    const validaciones = await Promise.all(validacionesBasicas);

    // Validar direcciones dinámicas si la función está disponible
    let direccionesValidas = true;
    if (typeof validarTodasLasDirecciones === 'function') {
      direccionesValidas = validarTodasLasDirecciones();
    }

    // Verificar si todas las validaciones pasaron
    const todasValidas = validaciones.every(valida => valida === true) && direccionesValidas;

    if (!todasValidas) {
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Por favor, corrige los errores en el formulario', 'error');
      } else {
        console.warn('mostrarToast no disponible, usando alert como fallback');
        alert('Por favor, corrige los errores en el formulario');
      }
      return;
    }

    // Si todas las validaciones pasaron, recopilar datos y enviar
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Actualizando perfil...', 'info');
    }

    // Recopilar datos del formulario
    const formData = new FormData(formularioEditarPerfil);
    const datosFormulario = {};

    // Datos básicos
    for (let [key, value] of formData.entries()) {
      datosFormulario[key] = value;
    }

    // Normalizar el nombre del campo email para el backend
    if (datosFormulario.email) {
      datosFormulario.correo = datosFormulario.email;
      delete datosFormulario.email;
    }

    // Manejar contraseña solo si se está cambiando
    if (camposContrasena && camposContrasena.style.display !== 'none') {
      // Si están visibles los campos de contraseña, enviar la nueva contraseña
      datosFormulario.contrasena = campoContrasenaEdit.value;
    } else {
      // Si no se está cambiando contraseña, no enviar el campo
      delete datosFormulario.contrasena;
      delete datosFormulario.editarContrasena;
    }

    // Agregar direcciones dinámicas si la función está disponible
    if (typeof obtenerDireccionesDelFormulario === 'function') {
      const direcciones = obtenerDireccionesDelFormulario();
      // Siempre enviar el array de direcciones, incluso si está vacío
      // Esto permite que el backend sepa que debe eliminar direcciones existentes
      datosFormulario.direcciones = direcciones;
    }

    // Enviar datos vía fetch
    try {
      const response = await fetch(formularioEditarPerfil.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosFormulario)
      });

      if (response.ok) {
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Perfil actualizado correctamente', 'success');
        }

        // Cerrar modal después de un breve delay
        setTimeout(() => {
          const modalEditar = document.getElementById('modalEditarPerfil');
          if (modalEditar) {
            const instanciaModal = bootstrap.Modal.getInstance(modalEditar);
            if (instanciaModal) {
              instanciaModal.hide();
            }
          }
          // Recargar la página para mostrar los cambios
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json();
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast(errorData.error || 'Error al actualizar el perfil', 'error');
        }
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Error de conexión al actualizar el perfil', 'error');
      }
    }
  });

  // Marcar que las validaciones ya están inicializadas
  formularioEditarPerfil.dataset.validacionesInicializadas = 'true';
}

// Hacer la función disponible globalmente
window.inicializarValidacionesEditarPerfil = inicializarValidacionesEditarPerfil;

// ===============================
// INICIALIZACIÓN AL CARGAR EL DOM
// ===============================

document.addEventListener('DOMContentLoaded', () => {

  // ===============================
  // VALIDACIONES DEL FORMULARIO DE REGISTRO
  // ===============================
  const formularioRegistro = document.getElementById('registerForm');

  if (formularioRegistro) {
    // Elementos del formulario
    const campoEmail = document.getElementById('email');
    const campoNombre = document.getElementById('nombreUsuario');
    const campoApellido = document.getElementById('apellidoUsuario');
    const campoTelefono = document.getElementById('telefono');
    const campoContrasena = document.getElementById('contrasena');
    const campoConfirmarContrasena = document.getElementById('confirmarContrasena');

    // Elementos de error
    const errorEmail = document.getElementById('emailError');
    const errorNombre = document.getElementById('nombreError');
    const errorApellido = document.getElementById('apellidoError');
    const errorTelefono = document.getElementById('telefonoError');
    const errorContrasena = document.getElementById('contrasenaError');
    const errorConfirmarContrasena = document.getElementById('confirmarContrasenaError');

    // Funciones de validación locales usando las reutilizables
    const validarEmailRegistro = () => validarEmailUsuario(campoEmail, errorEmail, true);
    const validarNombreRegistro = () => validarNombreApellido(campoNombre, errorNombre, 'nombre');
    const validarApellidoRegistro = () => validarNombreApellido(campoApellido, errorApellido, 'apellido');
    const validarTelefonoRegistro = () => validarTelefonoUsuario(campoTelefono, errorTelefono, false);
    const validarContrasenaRegistro = () => validarContrasenaUsuario(campoContrasena, errorContrasena, true);
    const validarConfirmacionRegistro = () => validarConfirmacionContrasena(campoContrasena, campoConfirmarContrasena, errorConfirmarContrasena);

    // Event listeners para validación en tiempo real
    campoEmail.addEventListener('blur', validarEmailRegistro);
    campoNombre.addEventListener('blur', validarNombreRegistro);
    campoApellido.addEventListener('blur', validarApellidoRegistro);
    campoTelefono.addEventListener('blur', validarTelefonoRegistro);
    campoContrasena.addEventListener('blur', validarContrasenaRegistro);
    campoConfirmarContrasena.addEventListener('blur', validarConfirmacionRegistro);

    // También validar confirmación cuando cambie la contraseña principal
    campoContrasena.addEventListener('input', () => {
      if (campoConfirmarContrasena.value) {
        validarConfirmacionRegistro();
      }
    });

    // Validación al enviar el formulario
    formularioRegistro.addEventListener('submit', async (evento) => {
      evento.preventDefault();

      // Ejecutar todas las validaciones
      const validaciones = await Promise.all([
        validarEmailRegistro(),
        validarNombreRegistro(),
        validarApellidoRegistro(),
        validarTelefonoRegistro(),
        validarContrasenaRegistro(),
        validarConfirmacionRegistro()
      ]);

      // Verificar si todas las validaciones pasaron
      const todasValidas = validaciones.every(valida => valida === true);

      if (!todasValidas) {
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        } else {
          alert('Por favor, corrige los errores en el formulario');
        }
        return;
      }

      // Si todas las validaciones pasaron, mostrar mensaje de procesamiento y enviar el formulario
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Creando cuenta... Por favor espera', 'info');
      }
      // Cerrar modal de registro
      const modalRegistro = document.getElementById('registerModal');
      if (modalRegistro) {
        const instanciaModal = bootstrap.Modal.getInstance(modalRegistro);
        if (instanciaModal) {
          instanciaModal.hide();
        }
      }

      // Enviar formulario
      formularioRegistro.submit();
    });
  }

  // ===============================
  // VALIDACIONES DEL FORMULARIO DE LOGIN
  // ===============================
  const formularioLogin = document.getElementById('loginForm');

  if (formularioLogin) {

    formularioLogin.setAttribute('novalidate', 'true');

    // Elementos del formulario de login
    const campoEmailLogin = document.getElementById('correoLogin');
    const campoContrasenaLogin = document.getElementById('contrasenaLogin');

    // Elementos de error
    const errorEmailLogin = document.getElementById('emailLoginError');
    const errorContrasenaLogin = document.getElementById('contrasenaLoginError');

    // Funciones de validación locales usando las reutilizables
    const validarEmailLoginFunc = () => validarEmailUsuario(campoEmailLogin, errorEmailLogin, false);
    const validarContrasenaLoginFunc = () => {
      const contrasena = campoContrasenaLogin.value.trim();

      if (!contrasena) {
        mostrarError(campoContrasenaLogin, errorContrasenaLogin, 'La contraseña es requerida');
        return false;
      }

      mostrarExito(campoContrasenaLogin, errorContrasenaLogin);
      return true;
    };

    // Event listeners para validación en tiempo real
    if (campoEmailLogin) {
      campoEmailLogin.addEventListener('blur', validarEmailLoginFunc);
    }
    if (campoContrasenaLogin) {
      campoContrasenaLogin.addEventListener('blur', validarContrasenaLoginFunc);
    }

    // Validación al enviar el formulario de login
    formularioLogin.addEventListener('submit', async (evento) => {
      evento.preventDefault();

      // Ejecutar todas las validaciones
      const validaciones = await Promise.all([
        validarEmailLoginFunc(),
        validarContrasenaLoginFunc()
      ]);

      // Verificar si todas las validaciones pasaron
      const todasValidas = validaciones.every(valida => valida === true);

      if (!todasValidas) {
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        } else {
          alert('Por favor, corrige los errores en el formulario');
        }
        return;
      }

      console.log(' Validaciones pasaron, enviando formulario...');

      // Si todas las validaciones pasaron, mostrar mensaje de procesamiento
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Iniciando sesión...', 'info');
      }

      // Realizar autenticación

    });
  }

  // ===============================
  // VALIDACIONES DEL FORMULARIO DE EDITAR PERFIL (ESTÁTICO)
  // ===============================
  const formularioEditarPerfil = document.getElementById('formEditarPerfil');

  if (formularioEditarPerfil) {
    inicializarValidacionesEditarPerfil();
  }
});
