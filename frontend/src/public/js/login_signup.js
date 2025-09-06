/* lógica de la navbar */
document.addEventListener("DOMContentLoaded", () => {
  // Elementos de la navbar para visitante y usuario
  const elementosNavbarVisitante = document.querySelectorAll(".solo-visitante");
  const elementosNavbarUsuario = document.querySelectorAll(".solo-usuario");

  /* Obtener datos del usuario desde la cookie 'usuario' */
  function obtenerDatosUsuarioDesdeCookie() {
    const fila = document.cookie.split('; ').find(f => f.startsWith('usuario='));
    if (!fila) return null;
    try {
      const valor = fila.split('=')[1];
      return JSON.parse(decodeURIComponent(valor));
    } catch (e) {
      console.log('Error al leer datos del usuario:', e);
      return null;
    }
  }

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
    const idPersona = datosUsuario?.idPersona;
    const elementoSaludo = document.querySelector(".user-name");
    if (elementoSaludo && nombre) elementoSaludo.innerText = `Hola ${nombre}`;

    const enlacePerfil = document.querySelector(".user-profile");
    if (enlacePerfil) enlacePerfil.href = `/mi-perfil`;

    const enlaceEmpr = document.querySelector(".user-emprendimientos");
    if (enlaceEmpr && idPersona) enlaceEmpr.href = `/usuario-emprendimientos/${idPersona}`;
  }

  // Ejecutar lógica principal
  const usuarioActual = obtenerDatosUsuarioDesdeCookie();
  if (usuarioActual) {
    console.log('Usuario encontrado:', usuarioActual.nombreUsuario);
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

/* logica de inicio de sesion */
document.addEventListener('DOMContentLoaded', () => {
  const formularioInicioSesion = document.getElementById('loginForm');

  if (formularioInicioSesion) {
    formularioInicioSesion.addEventListener('submit', async (eventoEnvio) => {
      eventoEnvio.preventDefault(); // Evitar envío tradicional del formulario

      // Obtener datos del formulario
      const correoIngresado = formularioInicioSesion.email.value;
      const contrasenaIngresada = formularioInicioSesion.contrasena.value;
      const captchaIngresado = formularioInicioSesion.captcha.value;
      
      const captchaValidado = await validarCaptchaAntesDeEnviar()

      if(!captchaValidado) {
        return
      }

      try {
        // Hacer petición POST al servidor para validar credenciales
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
        console.log('El captcha ingresado es: ',datosDeRespuesta)

        if (respuestaDelServidor.ok) {
          // Si el inicio de sesión fue exitoso
          console.log('Inicio de sesión exitoso:', datosDeRespuesta);

          // Crear cookie adicional para JavaScript (por si acaso)
          document.cookie = `usuario=${encodeURIComponent(JSON.stringify(datosDeRespuesta.usuario))}; path=/; max-age=${7 * 24 * 60 * 60}`;
          
          // Recargar la página para que se actualice la navbar automáticamente
          window.location.reload();
          
          // Cerrar modal de inicio de sesión
          const modalInicioSesion = document.getElementById('loginModal');
          if (modalInicioSesion) {
            const instanciaModal = bootstrap.Modal.getInstance(modalInicioSesion);
            if (instanciaModal) {
              instanciaModal.hide();
            }
          }


        } else {
          // Si hay error en las credenciales
          console.error('Error de credenciales:', datosDeRespuesta);
          alert(datosDeRespuesta.error || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
        }

      } catch (errorDeConexion) {
        console.error('Error de conexión al iniciar sesión:', errorDeConexion);
        alert('Error de conexión. Por favor, inténtalo de nuevo más tarde.');
      }
    });
  }
});