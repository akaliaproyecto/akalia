/**
 * @file Script para la página de restablecer contraseña
 * @description Controla el formulario de reset: valida contraseñas y envía el request al servidor.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value.trim();
    const passwordConfirm = document.getElementById('passwordConfirm').value.trim();
    const token = document.getElementById('token').value;
    const id = document.getElementById('userId').value;

    const errorPwd = document.getElementById('passwordError');
    const errorPwdC = document.getElementById('passwordConfirmError');

    // Si las funciones de validación globales están disponibles, úsalas para feedback consistente
    const pwdField = document.getElementById('password');
    const pwdConfirmField = document.getElementById('passwordConfirm');

    if (typeof validarContrasenaUsuario === 'function') {
      const ok = validarContrasenaUsuario(pwdField, errorPwd, true);
      if (!ok) return;
    } else {
      if (!password || password.length < 8) {
        if (errorPwd) { errorPwd.style.display = 'block'; errorPwd.textContent = 'La contraseña debe tener al menos 8 caracteres'; }
        return;
      }
    }

    if (typeof validarConfirmacionContrasena === 'function') {
      const ok2 = validarConfirmacionContrasena(pwdField, pwdConfirmField, errorPwdC);
      if (!ok2) return;
    } else {
      if (password !== passwordConfirm) {
        if (errorPwdC) { errorPwdC.style.display = 'block'; errorPwdC.textContent = 'Las contraseñas no coinciden'; }
        return;
      }
    }

    try {
      const resp = await fetch('/usuario-reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, id, password, passwordConfirm })
      });
      if (resp.ok) {
        // Mostrar toast y redirigir
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Contraseña actualizada. Puedes iniciar sesión.', 'success');
        } else {
          alert('Contraseña actualizada. Puedes iniciar sesión.');
        }
        setTimeout(() => window.location.href = '/', 3000);
      } else {
        const data = await resp.json().catch(() => ({}));
        const msg = data.error || 'Error actualizando la contraseña';
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast(msg, 'error');
        } else {
          alert(msg);
        }
      }
    } catch (err) {
      console.error(err);
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Error de conexión', 'error');
      } else {
        alert('Error de conexión');
      }
    }
  });
});
