document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recuperarForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const errorDiv = document.getElementById('emailError');

    // Formato básico
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      if (errorDiv) { errorDiv.style.display = 'block'; errorDiv.textContent = 'Ingresa un correo válido'; }
      return;
    }
    if (errorDiv) { errorDiv.style.display = 'none'; }

    try {
      // Verificar existencia del email en el sistema usando el endpoint existente
      const apiBase = window.API_BASE_URL || '';
      const verificarUrl = `${apiBase}/api/usuarios/verificar-email/${encodeURIComponent(email)}`;
      const verifResp = await fetch(verificarUrl, { method: 'GET' });
      const verifData = await verifResp.json().catch(() => ({}));

      // Si el email NO existe, informamos al usuario pero no enviamos el request de recuperación
      if (verifResp.ok && verifData.existe === false) {
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('El correo no está registrado', 'error');
        } else {
          alert('El correo no está registrado');
        }
        return;
      }

      // Si hubo un error al verificar, avisar y no continuar
      if (!verifResp.ok) {
        const msg = verifData.mensaje || 'Error verificando el correo';
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast(msg, 'error');
        } else {
          alert(msg);
        }
        return;
      }

      // Si existe (o no pudimos determinarlo pero la verificación respondió ok), enviar petición de recuperación
      const resp = await fetch('/usuario-recuperar-contrasena', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      // Intentar parsear JSON, pero puede venir HTML si el proxy responde así
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast(data.mensaje || 'Si el correo existe, recibirás un enlace para restablecer tu contraseña', 'success');
        } else {
          alert(data.mensaje || 'Si el correo existe, recibirás un enlace para restablecer tu contraseña');
        }
        setTimeout(() => window.location.href = '/', 3000);
        return true;
      } else {
        const msg = data.error || 'Error enviando correo de recuperación';
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
