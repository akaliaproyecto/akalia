document.addEventListener('DOMContentLoaded', () => {
  const toggleLoginPwd = document.getElementById('toggleLoginPwd');
  const loginPwd = document.getElementById('loginPwd');

  toggleLoginPwd.addEventListener('click', () => {
    loginPwd.type = loginPwd.type === 'password' ? 'text' : 'password';
    toggleLoginPwd.innerHTML = loginPwd.type === 'password' ? '<i class="fa fa-eye"></i>' : '<i class="fa fa-eye-slash"></i>';
  });

  const toggleRegisterPwd = document.getElementById('toggleRegisterPwd');
  const registerPwd = document.getElementById('registerPwd');

  toggleRegisterPwd.addEventListener('click', () => {
    registerPwd.type = registerPwd.type === 'password' ? 'text' : 'password';
    toggleRegisterPwd.innerHTML = registerPwd.type === 'password' ? '<i class="fa fa-eye"></i>' : '<i class="fa fa-eye-slash"></i>';
  });
});

/*****************************************
 * LÓGICA PARA CAMBIAR NAVBAR SEGÚN USUARIO *
 *****************************************/
document.addEventListener("DOMContentLoaded", () => {

  // Variables para identificar elementos de la navbar
  const elementosNavbarVisitante = document.querySelectorAll(".solo-visitante");
  const elementosNavbarUsuario = document.querySelectorAll(".solo-usuario");

  /**
   * Función para obtener datos del usuario desde las cookies del navegador
   * @returns {Object|null} - Objeto con datos del usuario o null si no existe
   */
  function obtenerDatosUsuarioDesdeCookie() {
    // Buscar cookie específica del usuario
    const cookieUsuario = document.cookie
      .split('; ') // Separar todas las cookies
      .find(fila => fila.startsWith('usuario=')); // Encontrar la cookie 'usuario'

    if (cookieUsuario) {
      try {
        // Extraer el valor de la cookie y convertirlo de JSON
        const valorCookie = cookieUsuario.split('=')[1];
        return JSON.parse(decodeURIComponent(valorCookie));
      } catch (error) {
        console.log('Error al leer datos del usuario:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Función para mostrar navbar cuando el usuario está logueado
   * @param {Object} datosUsuario - Información del usuario logueado
   */
  function mostrarNavbarUsuarioLogueado(datosUsuario) {
    // Ocultar elementos de visitante (botones registro/login)
    elementosNavbarVisitante.forEach(elemento => {
      elemento.classList.add("d-none");
    });

    // Mostrar elementos de usuario (dropdown con ícono de persona)
    elementosNavbarUsuario.forEach(elemento => {
      elemento.classList.remove("d-none", "nav-protegida");
    });

    // Personalizar saludo con nombre del usuario
    const elementoSaludo = document.querySelector(".user-name");
    if (elementoSaludo && datosUsuario.nombreUsuario) {
      elementoSaludo.innerText = `Hola ${datosUsuario.nombreUsuario}`;
    }

    // Configurar enlace para ir al perfil del usuario
    const enlacePerfilUsuario = document.querySelector(".user-profile");
    if (enlacePerfilUsuario) {
      enlacePerfilUsuario.href = `/perfil`;
    }

    // Configurar enlace para ver emprendimientos del usuario
    const enlaceEmprendimientos = document.querySelector(".user-emprendimientos");
    if (enlaceEmprendimientos && datosUsuario.idPersona) {
      enlaceEmprendimientos.href = `/usuario-emprendimientos/${datosUsuario.idPersona}`;
    }
  }

  /**
   * Función para mostrar navbar cuando es un visitante (no logueado)
   */
  function mostrarNavbarVisitante() {
    // Mostrar elementos de visitante (botones registro/login)
    elementosNavbarVisitante.forEach(elemento => {
      elemento.classList.remove("d-none", "nav-protegida");
    });

    // Ocultar elementos de usuario (dropdown con ícono de persona)
    elementosNavbarUsuario.forEach(elemento => {
      elemento.classList.add("d-none");
    });
  }

  // LÓGICA PRINCIPAL: Verificar si hay usuario y mostrar navbar correspondiente
  const usuarioActual = obtenerDatosUsuarioDesdeCookie();

  if (usuarioActual) {
    // Si hay usuario logueado, mostrar navbar de usuario
    console.log('Usuario encontrado:', usuarioActual.nombreUsuario);
    mostrarNavbarUsuarioLogueado(usuarioActual);
  } else {
    // Si no hay usuario, mostrar navbar de visitante
    console.log('No hay usuario logueado');
    mostrarNavbarVisitante();
  }
});

/*****************************************
 *      FUNCIÓN PARA CERRAR SESIÓN      *
 *****************************************/
/**
 * Función para cerrar sesión del usuario
 * Elimina la cookie y redirige a la página principal
 */
function cerrarSesionUsuario() {
  // Eliminar cookie del usuario estableciendo fecha de expiración en el pasado
  document.cookie = 'usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

  // Redirigir a página principal (se mostrará navbar de visitante automáticamente)
  window.location.href = '/';
}

// Mantener función logout para compatibilidad con código existente
function logout() {
  cerrarSesionUsuario();
}

/*****************************************
 * LÓGICA PARA MANEJAR FORMULARIO DE REGISTRO *
 *****************************************/
document.addEventListener('DOMContentLoaded', () => {
  const formularioRegistro = document.querySelector('form[action="/registro"]');

  if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', function () {
      // Mostrar mensaje temporal mientras se procesa el registro
      console.log('Procesando registro...');

      // Cerrar modal de registro si existe
      const modalRegistro = document.getElementById('registerModal');
      if (modalRegistro) {
        const instanciaModal = bootstrap.Modal.getInstance(modalRegistro);
        if (instanciaModal) {
          instanciaModal.hide();
        }
      }
    });
  }
});

/*****************************************
 * LÓGICA PARA MANEJAR INICIO DE SESIÓN *
 *****************************************/
document.addEventListener('DOMContentLoaded', () => {
  const formularioInicioSesion = document.getElementById('loginForm');

  if (formularioInicioSesion) {
    formularioInicioSesion.addEventListener('submit', async (eventoEnvio) => {
      eventoEnvio.preventDefault(); // Evitar envío tradicional del formulario

      // Obtener datos del formulario
      const correoIngresado = formularioInicioSesion.email.value;
      const contrasenaIngresada = formularioInicioSesion.contrasena.value;

      console.log('Intentando iniciar sesión con correo:', correoIngresado);

      try {
        // Hacer petición POST al servidor para validar credenciales
        const respuestaDelServidor = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: correoIngresado,
            contrasena: contrasenaIngresada
          })
        });

        const datosDeRespuesta = await respuestaDelServidor.json();

        if (respuestaDelServidor.ok) {
          // Si el inicio de sesión fue exitoso
          console.log('Inicio de sesión exitoso:', datosDeRespuesta);

          // Crear cookie adicional para JavaScript (por si acaso)
          document.cookie = `usuario=${encodeURIComponent(JSON.stringify(datosDeRespuesta.usuario))}; path=/; max-age=${7 * 24 * 60 * 60}`;

          // Cerrar modal de inicio de sesión
          const modalInicioSesion = document.getElementById('loginModal');
          if (modalInicioSesion) {
            const instanciaModal = bootstrap.Modal.getInstance(modalInicioSesion);
            if (instanciaModal) {
              instanciaModal.hide();
            }
          }

          // Recargar la página para que se actualice la navbar automáticamente
          window.location.reload();

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

