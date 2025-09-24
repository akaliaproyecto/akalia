/* Validaciones de formularios - Administración (Categorías, Etiquetas, etc.) */
document.addEventListener('DOMContentLoaded', () => {
  
  // ===============================
  // FUNCIONES UTILITARIAS COMUNES
  // ===============================
  
  // Funciones de validación compartidas
  function mostrarError(campo, elementoError, mensaje) {
    campo.classList.add('is-invalid');
    campo.classList.remove('is-valid');
    if (elementoError) {
      elementoError.textContent = mensaje;
      elementoError.style.display = 'block';
    }
  }

  function mostrarExito(campo, elementoError) {
    campo.classList.add('is-valid');
    campo.classList.remove('is-invalid');
    if (elementoError) {
      elementoError.textContent = '';
      elementoError.style.display = 'none';
    }
  }

  // Validación de texto alfanumérico con espacios
  function validarTextoAlfanumerico(texto) {
    const regex = /^[a-zA-ZÀ-ÿ0-9\s]+$/;
    return regex.test(texto);
  }

  // ===============================
  // VALIDACIONES PARA FORMULARIOS DE CATEGORÍAS
  // ===============================
  
  // Formulario de crear categoría
  const formularioCrearCategoria = document.getElementById('form-crear-categoria');
  
  if (formularioCrearCategoria) {
    const campoNombreCategoria = document.getElementById('nombreCategoria');
    const campoImagenCategoria = document.getElementById('imagenCategoria');
    
    let errorNombreCategoria = document.getElementById('nombreCategoriaError');
    let errorImagenCategoria = document.getElementById('imagenCategoriaError');
    
    // Crear elementos de error si no existen
    if (!errorNombreCategoria && campoNombreCategoria) {
      errorNombreCategoria = document.createElement('div');
      errorNombreCategoria.id = 'nombreCategoriaError';
      errorNombreCategoria.className = 'invalid-feedback';
      campoNombreCategoria.parentNode.appendChild(errorNombreCategoria);
    }
    
    if (!errorImagenCategoria && campoImagenCategoria) {
      errorImagenCategoria = document.createElement('div');
      errorImagenCategoria.id = 'imagenCategoriaError';
      errorImagenCategoria.className = 'invalid-feedback';
      campoImagenCategoria.parentNode.appendChild(errorImagenCategoria);
    }
    
    function validarNombreCategoria() {
      const nombre = campoNombreCategoria.value.trim();
      
      if (!nombre) {
        mostrarError(campoNombreCategoria, errorNombreCategoria, 'El nombre de la categoría es obligatorio');
        return false;
      }
      
      if (nombre.length < 2) {
        mostrarError(campoNombreCategoria, errorNombreCategoria, 'La categoría debe tener al menos 2 caracteres');
        return false;
      }
      
      if (nombre.length > 50) {
        mostrarError(campoNombreCategoria, errorNombreCategoria, 'La categoría no puede superar los 50 caracteres');
        return false;
      }
      
      if (!validarTextoAlfanumerico(nombre)) {
        mostrarError(campoNombreCategoria, errorNombreCategoria, 'La categoría solo puede contener letras, números y espacios');
        return false;
      }
      
      mostrarExito(campoNombreCategoria, errorNombreCategoria);
      return true;
    }
    
    function validarImagenCategoria() {
      const imagen = campoImagenCategoria.files ? campoImagenCategoria.files[0] : null;
      
      // La imagen es opcional
      if (!imagen) {
        mostrarExito(campoImagenCategoria, errorImagenCategoria);
        return true;
      }
      
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!tiposPermitidos.includes(imagen.type)) {
        mostrarError(campoImagenCategoria, errorImagenCategoria, 'Solo se permiten imágenes (JPG, PNG, GIF, WebP, SVG)');
        return false;
      }
      
      // Validar tamaño (5MB máximo)
      const tamanoMaximo = 5 * 1024 * 1024; // 5MB en bytes
      if (imagen.size > tamanoMaximo) {
        mostrarError(campoImagenCategoria, errorImagenCategoria, 'La imagen no puede superar los 5MB');
        return false;
      }
      
      mostrarExito(campoImagenCategoria, errorImagenCategoria);
      return true;
    }
    
    // Event listeners
    if (campoNombreCategoria) {
      campoNombreCategoria.addEventListener('blur', validarNombreCategoria);
      campoNombreCategoria.addEventListener('input', () => {
        const nombre = campoNombreCategoria.value.trim();
        if (nombre.length > 50) {
          validarNombreCategoria();
        }
      });
    }
    
    if (campoImagenCategoria) {
      campoImagenCategoria.addEventListener('change', validarImagenCategoria);
    }
    
    formularioCrearCategoria.addEventListener('submit', (evento) => {
      evento.preventDefault();
      
      const validaciones = [];
      
      if (campoNombreCategoria) validaciones.push(validarNombreCategoria());
      if (campoImagenCategoria) validaciones.push(validarImagenCategoria());
      
      const todasValidas = validaciones.every(valida => valida === true);
      
      if (!todasValidas) {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        }
        return;
      }
      
      if (typeof mostrarToast === 'function') {
        mostrarToast('Creando categoría...', 'info');
      }
      
      formularioCrearCategoria.submit();
    });
  }
  
  // Formulario de editar categoría
  const formularioEditarCategoria = document.getElementById('form-editar-categoria');
  
  if (formularioEditarCategoria) {
    // Similar implementación que crear categoría, pero para campos de edición
    // Los IDs podrían ser: nombreCategoriaEdit, imagenCategoriaEdit, etc.
    // ... implementación similar
  }

  // ===============================
  // VALIDACIONES PARA FORMULARIOS DE ETIQUETAS
  // ===============================
  
  // Formulario de crear etiqueta
  const formularioCrearEtiqueta = document.getElementById('form-crear-etiqueta');
  
  if (formularioCrearEtiqueta) {
    const campoNombreEtiqueta = document.getElementById('nombreEtiqueta');
    
    let errorNombreEtiqueta = document.getElementById('nombreEtiquetaError');
    
    if (!errorNombreEtiqueta && campoNombreEtiqueta) {
      errorNombreEtiqueta = document.createElement('div');
      errorNombreEtiqueta.id = 'nombreEtiquetaError';
      errorNombreEtiqueta.className = 'invalid-feedback';
      campoNombreEtiqueta.parentNode.appendChild(errorNombreEtiqueta);
    }
    
    function validarNombreEtiqueta() {
      const nombre = campoNombreEtiqueta.value.trim();
      
      if (!nombre) {
        mostrarError(campoNombreEtiqueta, errorNombreEtiqueta, 'El nombre de la etiqueta es obligatorio');
        return false;
      }
      
      if (nombre.length < 2) {
        mostrarError(campoNombreEtiqueta, errorNombreEtiqueta, 'La etiqueta debe tener al menos 2 caracteres');
        return false;
      }
      
      if (nombre.length > 50) {
        mostrarError(campoNombreEtiqueta, errorNombreEtiqueta, 'La etiqueta no puede superar los 50 caracteres');
        return false;
      }
      
      if (!validarTextoAlfanumerico(nombre)) {
        mostrarError(campoNombreEtiqueta, errorNombreEtiqueta, 'La etiqueta solo puede contener letras, números y espacios');
        return false;
      }
      
      mostrarExito(campoNombreEtiqueta, errorNombreEtiqueta);
      return true;
    }
    
    if (campoNombreEtiqueta) {
      campoNombreEtiqueta.addEventListener('blur', validarNombreEtiqueta);
      campoNombreEtiqueta.addEventListener('input', () => {
        const nombre = campoNombreEtiqueta.value.trim();
        if (nombre.length > 50) {
          validarNombreEtiqueta();
        }
      });
    }
    
    formularioCrearEtiqueta.addEventListener('submit', (evento) => {
      evento.preventDefault();
      
      if (!validarNombreEtiqueta()) {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        }
        return;
      }
      
      if (typeof mostrarToast === 'function') {
        mostrarToast('Creando etiqueta...', 'info');
      }
      
      formularioCrearEtiqueta.submit();
    });
  }
  
  // Formulario de editar etiqueta
  const formularioEditarEtiqueta = document.getElementById('form-editar-etiqueta');
  
  if (formularioEditarEtiqueta) {
    // Similar implementación que crear etiqueta
    // ... implementación similar
  }

  // ===============================
  // VALIDACIONES PARA FORMULARIOS DE PEDIDOS/CARRITOS
  // ===============================
  
  // Formulario de crear pedido/agregar al carrito
  const formularioCrearPedido = document.getElementById('form-crear-pedido');
  
  if (formularioCrearPedido) {
    const campoUnidades = document.getElementById('unidades');
    const campoDescripcionPedido = document.getElementById('descripcionPedido');
    
    let errorUnidades = document.getElementById('unidadesError');
    let errorDescripcionPedido = document.getElementById('descripcionPedidoError');
    
    if (!errorUnidades && campoUnidades) {
      errorUnidades = document.createElement('div');
      errorUnidades.id = 'unidadesError';
      errorUnidades.className = 'invalid-feedback';
      campoUnidades.parentNode.appendChild(errorUnidades);
    }
    
    if (!errorDescripcionPedido && campoDescripcionPedido) {
      errorDescripcionPedido = document.createElement('div');
      errorDescripcionPedido.id = 'descripcionPedidoError';
      errorDescripcionPedido.className = 'invalid-feedback';
      campoDescripcionPedido.parentNode.appendChild(errorDescripcionPedido);
    }
    
    function validarUnidades() {
      const unidades = parseInt(campoUnidades.value);
      
      if (isNaN(unidades) || campoUnidades.value.trim() === '') {
        mostrarError(campoUnidades, errorUnidades, 'Las unidades son obligatorias y deben ser un número');
        return false;
      }
      
      if (unidades < 1) {
        mostrarError(campoUnidades, errorUnidades, 'Debe haber al menos 1 unidad');
        return false;
      }
      
      if (unidades > 999) {
        mostrarError(campoUnidades, errorUnidades, 'No se pueden pedir más de 999 unidades');
        return false;
      }
      
      mostrarExito(campoUnidades, errorUnidades);
      return true;
    }
    
    function validarDescripcionPedido() {
      const descripcion = campoDescripcionPedido.value.trim();
      
      if (!descripcion) {
        mostrarError(campoDescripcionPedido, errorDescripcionPedido, 'La descripción es obligatoria');
        return false;
      }
      
      if (descripcion.length < 3) {
        mostrarError(campoDescripcionPedido, errorDescripcionPedido, 'La descripción debe tener al menos 3 caracteres');
        return false;
      }
      
      if (descripcion.length > 255) {
        mostrarError(campoDescripcionPedido, errorDescripcionPedido, 'La descripción no puede superar los 255 caracteres');
        return false;
      }
      
      mostrarExito(campoDescripcionPedido, errorDescripcionPedido);
      return true;
    }
    
    if (campoUnidades) {
      campoUnidades.addEventListener('blur', validarUnidades);
      campoUnidades.addEventListener('input', validarUnidades);
    }
    
    if (campoDescripcionPedido) {
      campoDescripcionPedido.addEventListener('blur', validarDescripcionPedido);
      campoDescripcionPedido.addEventListener('input', () => {
        const descripcion = campoDescripcionPedido.value.trim();
        if (descripcion.length > 255) {
          validarDescripcionPedido();
        }
      });
    }
    
    formularioCrearPedido.addEventListener('submit', (evento) => {
      evento.preventDefault();
      
      const validaciones = [];
      
      if (campoUnidades) validaciones.push(validarUnidades());
      if (campoDescripcionPedido) validaciones.push(validarDescripcionPedido());
      
      const todasValidas = validaciones.every(valida => valida === true);
      
      if (!todasValidas) {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        }
        return;
      }
      
      if (typeof mostrarToast === 'function') {
        mostrarToast('Procesando pedido...', 'info');
      }
      
      formularioCrearPedido.submit();
    });
  }
});
