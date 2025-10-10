/* lógica de la navbar */
document.addEventListener("DOMContentLoaded", () => {
  // Elementos de la navbar para visitante y usuario
  const elementosNavbarVisitante = document.querySelectorAll(".solo-visitante");
  const elementosNavbarUsuario = document.querySelectorAll(".solo-usuario");

  /* Función para mostrar toasts/notificaciones */
  function mostrarToast(mensaje, tipo = 'error') {
    // Crear el contenedor de toasts si no existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Crear el toast
    const toast = document.createElement('div');
    toast.className = `alert alert-${tipo === 'error' ? 'danger' : tipo === 'success' ? 'success' : 'info'} alert-dismissible fade show toast-notification`;
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
      <strong>${tipo === 'error' ? '¡Error!' : tipo === 'success' ? '¡Éxito!' : 'Info:'}</strong> ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Agregar el toast al contenedor
    toastContainer.appendChild(toast);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.classList.remove('show');
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
          if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    }, 5000);
  }

  // Hacer la función global para poder usarla en otros lugares
  window.mostrarToast = mostrarToast;

  /* Verificar si hay un registro exitoso y mostrar toast */
  function verificarRegistroExitoso() {
    // Buscar cookie de registro exitoso
    const registroExitoso = document.cookie
      .split('; ')
      .find(fila => fila.startsWith('registro-exitoso='));

    if (registroExitoso) {
      // Extraer el valor de la cookie
      const valor = registroExitoso.split('=')[1];

      if (valor === 'true') {
        // Mostrar toast de éxito
        setTimeout(() => {
          mostrarToast('¡Registro exitoso! Bienvenido a Akalia', 'success');
        }, 500); // Pequeño delay para que la página termine de cargar

        // Eliminar la cookie inmediatamente para evitar mostrar el toast repetidamente
        document.cookie = 'registro-exitoso=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      }
    }
  }

  // Ejecutar verificación de registro exitoso
  verificarRegistroExitoso();

  /* Obtener datos del usuario desde la cookie 'usuario' */
  function obtenerDatosUsuarioDesdeCookie() {
    const fila = document.cookie.split('; ').find(f => f.startsWith('usuario='));
    console.log('datos de la cookie', fila)
    if (!fila) return null;
    try {
      const valor = fila.split('=')[1];
      return JSON.parse(decodeURIComponent(valor));
    } catch (e) {
      console.log('Error al leer datos del usuario:', e);
      return null;
    }
  }

  // Esta variable se define desde el servidor via template
  const API_BASE = window.API_BASE_URL || 'http://localhost:4006';
  /**
   * Muestra u oculta los elementos de la navbar según si el usuario está logueado.
   * @param {boolean} estaLogueado
   */

  function actualizarNavbar(estaLogueado, datosUsuario) {
    // Mostrar/ocultar elementos de visitante
    elementosNavbarVisitante.forEach(el => {
      el.classList.toggle("d-none", estaLogueado);
      if (!estaLogueado) el.classList.remove("nav-protegida");
    });

    // Mostrar/ocultar elementos de usuario
    elementosNavbarUsuario.forEach(el => {
      el.classList.toggle("d-none", !estaLogueado);
      if (estaLogueado) el.classList.remove("nav-protegida");
    });

    if (!estaLogueado) return;

    // Personalizar saludo y enlaces (si existen)
    const nombre = datosUsuario?.nombreUsuario;
    const idUsuario = datosUsuario?.idUsuario;
    const elementoSaludo = document.querySelector(".user-name");
    if (elementoSaludo && nombre) elementoSaludo.innerText = `Hola ${nombre}`;

    const enlacePerfil = document.querySelector(".user-profile");
    if (enlacePerfil) enlacePerfil.href = `/mi-perfil`;

    const enlaceEmpr = document.querySelector(".user-emprendimientos");
    if (enlaceEmpr) enlaceEmpr.href = `/usuario-emprendimientos`;
  }

  // Ejecutar lógica principal
  const usuarioActual = obtenerDatosUsuarioDesdeCookie();
  if (usuarioActual) {
    actualizarNavbar(true, usuarioActual);
  } else {
    console.log('No hay usuario logueado');
    actualizarNavbar(false);
  }
});

/* lógica para cerrar sesión */
function cerrarSesionUsuario() {
  // Eliminar cookie del usuario estableciendo fecha de expiración en el pasado
  document.cookie = 'usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  // Redirigir a página principal (se mostrará navbar de visitante automáticamente)
  window.location.href = '/';
}
function logout() {
  cerrarSesionUsuario();
}

document.addEventListener('DOMContentLoaded', () => {
  const formularioLogin = document.getElementById('loginForm');

  if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (eventoEnvio) => {
      eventoEnvio.preventDefault(); // Evitar envío tradicional del formulario

      // Obtener datos del formulario
      // Realizar autenticación
      try {
        // Validar captcha antes de proceder
        if (typeof validarCaptchaAntesDeEnviar === 'function') {
          const captchaValidado = await validarCaptchaAntesDeEnviar();
          if (!captchaValidado) {
            if (typeof window.mostrarToast === 'function') {
              window.mostrarToast('Por favor, completa el CAPTCHA correctamente', 'error');
            }
            return;
          }
        }

        const correoIngresado = document.getElementById('correoLogin').value;
        const contrasenaIngresada = document.getElementById('contrasenaLogin').value;
        const captchaIngresado = formularioLogin.querySelector('[name="captcha"]')?.value || '';

        const respuestaDelServidor = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: correoIngresado,
            contrasena: contrasenaIngresada,
            captcha: captchaIngresado
          })
        });

        const datosDeRespuesta = await respuestaDelServidor.json();

        if (respuestaDelServidor.ok) {
          // Si el inicio de sesión fue exitoso
          if (typeof window.mostrarToast === 'function') {
            window.mostrarToast('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
          }

          // Crear cookie para JavaScript
          document.cookie = `usuario=${encodeURIComponent(JSON.stringify(datosDeRespuesta.usuario))}; path=/; max-age=${7 * 24 * 60 * 60}`;

          // Cerrar modal de inicio de sesión
          const modalInicioSesion = document.getElementById('loginModal');
          if (modalInicioSesion) {
            const instanciaModal = bootstrap.Modal.getInstance(modalInicioSesion);
            if (instanciaModal) {
              instanciaModal.hide();
            }
          }

          // Recargar la página después de un breve delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);

        } else {
          // Si hay error en las credenciales
          if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(datosDeRespuesta.error || 'Credenciales incorrectas. Verifica tu correo y contraseña.', 'error');
          }
        }

      } catch (errorDeConexion) {
        console.error('Error de conexión al iniciar sesión:', errorDeConexion);
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Error de conexión. Por favor, inténtalo de nuevo más tarde.', 'error');
        }
      }
    });
  }
});

