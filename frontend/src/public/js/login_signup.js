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

/* Funcionalidad de redirección al iniciar sesión con credenciales correctas */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = loginForm.email.value;
      const contrasena = loginForm.contrasena.value;

      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, contrasena })
        });

        if (!res.ok) throw new Error('Error en la respuesta del servidor');

        const data = await res.json();

        if (data.error) {
          alert('Credenciales incorrectas. Inténtalo de nuevo.');
        } else {
          console.log('Inicio de sesión exitoso:', data);

          // Guardar usuario en cookie si lo necesitas para otra cosa
          document.cookie = `usuario=${encodeURIComponent(JSON.stringify(data.usuario))}; path=/`;

          // Aquí simplemente redirigimos a la ruta limpia
          window.location.href = '/perfil';
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
      }
    });
  }
});

// FUNCION NAVBAR SEGÚN USUARIO
  document.addEventListener("DOMContentLoaded", () => {
    // Leer usuario desde cookie
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    }
    let usuario = null;
    try {
      const usuarioCookie = getCookie('usuario');
      usuario = usuarioCookie ? JSON.parse(decodeURIComponent(usuarioCookie)) : null;
    } catch (e) {
      usuario = null;
    }

    const soloVisitante = document.querySelectorAll(".solo-visitante");
    const soloUsuario = document.querySelectorAll(".solo-usuario");

    if (usuario) {
      soloVisitante.forEach(el => el.classList.add("d-none"));
      soloUsuario.forEach(el => el.classList.remove("d-none","nav-protegida"));

          if (usuario && usuario.idPersona) {
            const userName = document.querySelector(".user-name");
            if (userName) userName.innerText = `Hola ${usuario.nombreUsuario}`;
            // Enlace de perfil: usar formulario oculto y POST
            const userProfileLink = document.querySelector(".user-profile");
            if (userProfileLink) {
                userProfileLink.href = `/perfil`;

              // userProfileLink.onclick = function(e) {
              //   e.preventDefault();
              //   fetch('/usuario-perfil', {
              //     method: 'POST',
              //     headers: { 'Content-Type': 'application/json' },
              //     body: JSON.stringify({ id: usuario.idPersona })
              //   })
              //   .then(res => res.text())
              //   .then(html => {
              //     document.open();
              //     document.write(html);
              //     document.close();
              //   });
              // };
            }
            const userEmprendimientosLink = document.querySelector(".user-emprendimientos");
            if (userEmprendimientosLink) {
              userEmprendimientosLink.href = `/usuario-emprendimientos/${usuario.idPersona}`;
            }
      }

    } else {
      soloVisitante.forEach(el => el.classList.remove("d-none","nav-protegida"));
      soloUsuario.forEach(el => el.classList.add("d-none"));
    }
    
  });

    // LOGOUT

    function logout() {
      // Eliminar la cookie de usuario
      document.cookie = 'usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      window.location.href = `/`;

    }

