/* Validaciones de formularios - Registro, Login y Editar Perfil */

// ===============================
// FUNCIONES UTILITARIAS GLOBALES
// ===============================

// Funciones de validación compartidas (disponibles globalmente)
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
function validarFormatoEmail(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

// Validación de nombre/apellido (reutilizable)
function validarFormatoNombreApellido(valor) {
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return valor.length >= 2 && regexNombre.test(valor);
}

// Validación de teléfono (reutilizable)
function validarFormatoTelefono(telefono) {
  const regexTelefono = /^\d{10}$/;
  return regexTelefono.test(telefono);
}

// ===============================
// FUNCIONES DE VALIDACIÓN REUTILIZABLES
// ===============================

// Función de validación de nombre/apellido reutilizable
function validarNombreApellido(campo, elementoError, tipoCampo) {
  const valor = campo.value.trim();

  if (!valor) {
    mostrarError(campo, elementoError, `El ${tipoCampo} es requerido`);
    return false;
  }

  if (!validarFormatoNombreApellido(valor)) {
    if (valor.length < 2) {
      mostrarError(campo, elementoError, `El ${tipoCampo} debe tener al menos 2 caracteres`);
    } else {
      mostrarError(campo, elementoError, `El ${tipoCampo} solo puede contener letras y espacios`);
    }
    return false;
  }

  mostrarExito(campo, elementoError);
  return true;
}

// Función de validación de email reutilizable
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
        // Verificar si el email ya existe
        const respuesta = await fetch(`${API_BASE}/api/usuarios/verificar-email/${encodeURIComponent(email)}`);
        const datos = await respuesta.json();
        
        if (datos.existe) {
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

// Función de validación de dirección reutilizable
function validarDireccionUsuario(campo, elementoError) {
  const direccion = campo.value.trim();

  // La dirección es opcional, pero si se llena debe tener al menos 10 caracteres
  if (!direccion) {
    mostrarExito(campo, elementoError);
    return true;
  }

  if (direccion.length < 10) {
    mostrarError(campo, elementoError, 'La dirección debe tener al menos 10 caracteres');
    return false;
  }

  if (direccion.length > 100) {
    mostrarError(campo, elementoError, 'La dirección no puede exceder 100 caracteres');
    return false;
  }

  mostrarExito(campo, elementoError);
  return true;
}

// Función de validación de departamento reutilizable
function validarDepartamentoUsuario(campo, elementoError) {
  const departamento = campo.value.trim();

  // El departamento es opcional independientemente
  if (!departamento) {
    mostrarExito(campo, elementoError);
    return true;
  }

  mostrarExito(campo, elementoError);
  return true;
}

// Función de validación de ciudad reutilizable
function validarCiudadUsuario(campo, elementoError, campoDepartamento) {
  const ciudad = campo.value.trim();
  const departamento = campoDepartamento?.value?.trim();

  // La ciudad es opcional independientemente
  if (!ciudad) {
    mostrarExito(campo, elementoError);
    return true;
  }

  // Si se selecciona ciudad, debe haber departamento
  if (ciudad && !departamento) {
    mostrarError(campo, elementoError, 'Debe seleccionar un departamento primero');
    return false;
  }

  mostrarExito(campo, elementoError);
  return true;
}

// ===============================
// FUNCIÓN PARA INICIALIZAR VALIDACIONES DE EDITAR PERFIL (DINÁMICAMENTE)
// ===============================

function inicializarValidacionesEditarPerfil() {
  
  const formularioEditarPerfil = document.getElementById('formEditarPerfil');
  
  if (!formularioEditarPerfil) {
    console.error('❌ Formulario de editar perfil no encontrado');
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
  const validarEmailPerfilFunc = () => validarEmailUsuario(campoEmailPerfil, errorEmailPerfil, false);
  const validarTelefonoPerfilFunc = () => validarTelefonoUsuario(campoTelefonoPerfil, errorTelefonoPerfil, false);
  const validarContrasenaEditFunc = () => validarContrasenaUsuario(campoContrasenaEdit, errorContrasenaEdit, false);
  
  // Event listeners para validación en tiempo real - Editar Perfil
  if (campoNombrePerfil) {
    campoNombrePerfil.addEventListener('blur', validarNombrePerfilFunc);
  }
  if (campoApellidoPerfil) {
    campoApellidoPerfil.addEventListener('blur', validarApellidoPerfilFunc);
  }
  if (campoEmailPerfil) {
    campoEmailPerfil.addEventListener('blur', validarEmailPerfilFunc);
  }
  if (campoTelefonoPerfil) {
    campoTelefonoPerfil.addEventListener('blur', validarTelefonoPerfilFunc);
  }
  if (campoContrasenaEdit) {
    campoContrasenaEdit.addEventListener('blur', validarContrasenaEditFunc);
  }
  
  // Validación al enviar el formulario de editar perfil
  formularioEditarPerfil.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    
    // Ejecutar validaciones básicas
    const validaciones = await Promise.all([
      validarNombrePerfilFunc(),
      validarApellidoPerfilFunc(),
      validarEmailPerfilFunc(),
      validarTelefonoPerfilFunc(),
      validarContrasenaEditFunc()
    ]);
    
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
    
    // Agregar direcciones dinámicas si la función está disponible
    if (typeof obtenerDireccionesDelFormulario === 'function') {
      const direcciones = obtenerDireccionesDelFormulario();
      if (direcciones.length > 0) {
        datosFormulario.direcciones = direcciones;
      }
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
      
      // Si todas las validaciones pasaron, mostrar mensaje de procesamiento
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Iniciando sesión...', 'info');
      }
      
      // Enviar formulario
      formularioLogin.submit();
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
