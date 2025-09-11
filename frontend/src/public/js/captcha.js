document.addEventListener('DOMContentLoaded', function () {

  function getCaptchaElements() {
    return {
      captchaSvg: document.getElementById('captcha-svg'),
      refreshBtn: document.getElementById('refresh-captcha'),
      captchaError: document.getElementById('captcha-error'),
    };
  }

  async function loadCaptcha() {
    const { captchaSvg, captchaError } = getCaptchaElements();
    if (!captchaSvg) return;
    try {
      captchaError.style.display = 'none';
      captchaSvg.innerHTML = 'Cargando...';
      const response = await fetch('/generar-captcha', { credentials: 'include' });
      if (response.ok) {
        const svgText = await response.text();
        captchaSvg.innerHTML = svgText;
      } else {
        throw new Error('Error cargando captcha');
      }
    } catch (error) {
      console.log(error)
      captchaSvg.innerHTML = '';
      captchaError.textContent = 'Error cargando CAPTCHA';
      captchaError.style.display = 'block';
    }
  }

  // Cargar captcha cuando se abre el modal de login
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.addEventListener('shown.bs.modal', loadCaptcha);
  }

  // Cargar captcha inicial si el modal ya está visible
  if (document.getElementById('captcha-svg')) {
    loadCaptcha();
  }

  // Delegar el evento de refresco
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'refresh-captcha') {
      loadCaptcha();
    }
  });
});

async function validarCaptchaAntesDeEnviar() {
  const captchaInput = document.getElementById('captcha-input').value;
  console.log(captchaInput)
  try {
    const response = await fetch('/validar-captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ captcha: captchaInput }) 
    });
    console.log(response.body)
    const result = await response.json();
    if (!result.success) {
      document.getElementById('captcha-error').textContent = result.message;
      document.getElementById('captcha-error').style.display = 'block';

      if (result.newCaptcha) {
        document.getElementById('captcha-svg').innerHTML = result.newCaptcha.data;
      }

      return false;
    }

    return true;

  } catch (error) {
    console.error('Error validando captcha frontend: ', error);
    return false;
  }
}