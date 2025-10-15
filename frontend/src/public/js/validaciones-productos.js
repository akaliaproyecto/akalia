/* Validaciones de formularios - Productos */

// ===============================
// FUNCIONES UTILITARIAS COMUNES (GLOBALES)
// ===============================

/* Función para verificar si un emprendimiento está activo */
async function verificarEmprendimientoActivo(idEmprendimiento) {
  try {
    const response = await fetch(`/emprendimientos/verificar-activo/${idEmprendimiento}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return data.activo;
  } catch (error) {
    console.error('Error al verificar estado del emprendimiento:', error);
    return true; // Por defecto asumimos que está activo en caso de error
  }
}

// Funciones de validación compartidas
function mostrarError(campo, elementoError, mensaje) {
  if (campo) {
    campo.classList.add('is-invalid');
    campo.classList.remove('is-valid');
  }
  if (elementoError) {
    elementoError.textContent = mensaje;
    elementoError.style.display = 'block';
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
  }
}

// ===============================
// FUNCIONES DE VALIDACIÓN REUTILIZABLES (GLOBALES)
// ===============================

function validarTituloProducto(campoTitulo, elementoError) {
  if (!campoTitulo) return true;
  
  const titulo = campoTitulo.value.trim();
  
  if (!titulo) {
    mostrarError(campoTitulo, elementoError, 'El título del producto es obligatorio');
    return false;
  }
  
  if (titulo.length < 3) {
    mostrarError(campoTitulo, elementoError, 'El título debe tener al menos 3 caracteres');
    return false;
  }
  
  if (titulo.length > 100) {
    mostrarError(campoTitulo, elementoError, 'El título no puede superar los 100 caracteres');
    return false;
  }
  
  mostrarExito(campoTitulo, elementoError);
  return true;
}

function validarDescripcionProducto(campoDescripcion, elementoError) {
  if (!campoDescripcion) return true;
  
  const descripcion = campoDescripcion.value.trim();
  
  if (!descripcion) {
    mostrarError(campoDescripcion, elementoError, 'La descripción del producto es obligatoria');
    return false;
  }
  
  if (descripcion.length < 3) {
    mostrarError(campoDescripcion, elementoError, 'La descripción debe tener al menos 3 caracteres');
    return false;
  }
  
  if (descripcion.length > 800) {
    mostrarError(campoDescripcion, elementoError, 'La descripción no puede superar los 800 caracteres');
    return false;
  }
  
  mostrarExito(campoDescripcion, elementoError);
  return true;
}

function validarPrecioProducto(campoPrecio, elementoError) {
  if (!campoPrecio) return true;
  
  const precio = parseFloat(campoPrecio.value);
  
  if (isNaN(precio) || campoPrecio.value.trim() === '') {
    mostrarError(campoPrecio, elementoError, 'El precio es obligatorio y debe ser un número válido');
    return false;
  }
  
  if (precio <= 0) {
    mostrarError(campoPrecio, elementoError, 'El precio debe ser un valor positivo');
    return false;
  }
  
  // Validar que no tenga más de 2 decimales
  const precioString = campoPrecio.value.trim();
  const decimalIndex = precioString.indexOf('.');
  if (decimalIndex !== -1 && precioString.length - decimalIndex > 0) {
    mostrarError(campoPrecio, elementoError, 'El precio no puede tener decimales');
    return false;
  }
  
  mostrarExito(campoPrecio, elementoError);
  return true;
}

function validarImagenesProducto(campoImagenes, elementoError, esObligatorio = true) {
  if (!campoImagenes) return true;
  
  const archivos = campoImagenes.files;
  
  if (archivos.length === 0) {
    if (esObligatorio) {
      mostrarError(campoImagenes, elementoError, 'Debe seleccionar al menos 1 imagen');
      return false;
    } else {
      // Para editar, las imágenes son opcionales (puede usar las existentes)
      mostrarExito(campoImagenes, elementoError);
      return true;
    }
  }
  
  if (archivos.length > 10) {
    mostrarError(campoImagenes, elementoError, 'No puede seleccionar más de 10 imágenes');
    return false;
  }
  
  // Validar cada archivo
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/jfif', 'image/avif', 'image/heic', 'image/heif'];
  const tamanoMaximo = 25 * 1024 * 1024; // 25MB por imagen

  for (let i = 0; i < archivos.length; i++) {
    const archivo = archivos[i];
    
    if (!tiposPermitidos.includes(archivo.type)) {
      mostrarError(campoImagenes, elementoError, `La imagen "${archivo.name}" no es un formato válido. Solo se permiten JPG, PNG, GIF, WebP, SVG`);
      return false;
    }
    
    if (archivo.size > tamanoMaximo) {
      mostrarError(campoImagenes, elementoError, `La imagen "${archivo.name}" supera el tamaño máximo de 25MB`);
      return false;
    }
  }
  
  mostrarExito(campoImagenes, elementoError);
  return true;
}

async function validarEmprendimientoProducto(campoEmprendimiento, elementoError, campoEstado = null) {
  if (!campoEmprendimiento) return true;
  
  const emprendimientoId = campoEmprendimiento.value.trim();
  
  if (!emprendimientoId) {
    mostrarError(campoEmprendimiento, elementoError, 'Debe seleccionar un emprendimiento');
    return false;
  }
  
  // Verificar si el emprendimiento está activo
  const emprendimientoActivo = await verificarEmprendimientoActivo(emprendimientoId);
  
  if (!emprendimientoActivo) {
    // Si hay un campo de estado y está marcado como activo, cambiarlo a inactivo automáticamente
    if (campoEstado && campoEstado.value === 'true') {
      campoEstado.value = 'false';
    }
    
    // Mostrar advertencia pero con estilo de warning, no error
    if (elementoError) {
      elementoError.textContent = 'Este emprendimiento está inactivo';
      elementoError.style.display = 'block';
      elementoError.className = 'text-warning small mt-1'; // Cambiar a warning en lugar de error
    }
    if (campoEmprendimiento) {
      campoEmprendimiento.classList.remove('is-invalid');
      campoEmprendimiento.classList.add('is-valid'); // Marcar como válido porque el emprendimiento existe
    }
  } else {
    mostrarExito(campoEmprendimiento, elementoError);
  }
  
  return true; // Siempre retornar true - la validación real del estado está en validarEstadoProducto
}

function validarCategoriaProducto(campoCategoria, elementoError) {
  if (!campoCategoria) return true;
  
  const categoriaId = campoCategoria.value.trim();
  
  if (!categoriaId) {
    mostrarError(campoCategoria, elementoError, 'Debe seleccionar una categoría');
    return false;
  }
  
  mostrarExito(campoCategoria, elementoError);
  return true;
}

function validarEtiquetasProducto(campoEtiquetas, elementoError, esObligatorio = true) {
  if (!campoEtiquetas) return true;
  
  let etiquetasSeleccionadas = [];
  
  try {
    const etiquetasValue = campoEtiquetas.value.trim();
    if (etiquetasValue) {
      etiquetasSeleccionadas = JSON.parse(etiquetasValue);
    }
  } catch (error) {
    // Si no es JSON válido, intentar como array simple
    etiquetasSeleccionadas = [];
  }
  
  if (!Array.isArray(etiquetasSeleccionadas)) {
    etiquetasSeleccionadas = [];
  }
  
  if (etiquetasSeleccionadas.length === 0) {
    if (esObligatorio) {
      mostrarError(campoEtiquetas, elementoError, 'Debe seleccionar al menos 1 etiqueta');
      return false;
    } else {
      // Para editar, las etiquetas pueden ser opcionales si ya existen
      mostrarExito(campoEtiquetas, elementoError);
      return true;
    }
  }
  
  if (etiquetasSeleccionadas.length > 10) {
    mostrarError(campoEtiquetas, elementoError, 'No puede seleccionar más de 10 etiquetas');
    return false;
  }
  
  mostrarExito(campoEtiquetas, elementoError);
  return true;
}

async function validarEstadoProducto(campoEstado, elementoError, campoEmprendimiento = null) {
  if (!campoEstado) return false;
  
  const estado = campoEstado.value;
  
  if (estado !== 'true' && estado !== 'false') {
    mostrarError(campoEstado, elementoError, 'Debe seleccionar un estado válido');
    return false;
  }
  
  // Si el producto se está activando, verificar que el emprendimiento esté activo
  if (estado === 'true' && campoEmprendimiento && campoEmprendimiento.value) {
    const emprendimientoActivo = await verificarEmprendimientoActivo(campoEmprendimiento.value);
    
    if (!emprendimientoActivo) {
      mostrarError(campoEstado, elementoError, 'No puede activar el producto porque el emprendimiento está inactivo');
      
      // Mostrar toast de error si está disponible
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('No puede activar el producto porque el emprendimiento está inactivo', 'error');
      }
      
      return false;
    }
  }
  
  mostrarExito(campoEstado, elementoError);
  return true;
}

// ===============================
// FUNCIÓN PARA CREAR ELEMENTOS DE ERROR (GLOBAL)
// ===============================

function crearElementoError(campo, errorId) {
  if (!campo) return null;
  
  let elementoError = document.getElementById(errorId);
  
  if (!elementoError) {
    elementoError = document.createElement('div');
    elementoError.id = errorId;
    elementoError.className = 'invalid-feedback';
    elementoError.style.display = 'none';
    campo.parentNode.appendChild(elementoError);
  }
  
  return elementoError;
}

// ===============================
// FUNCIÓN PARA INICIALIZAR VALIDACIONES DE EDITAR (GLOBAL)
// ===============================

function inicializarValidacionesEditar() {
  
  const formularioEditarProducto = document.getElementById('form-editar-producto');
  
  if (!formularioEditarProducto) {
    console.error('Formulario de editar producto no encontrado');
    return;
  }
    
  // Elementos del formulario de editar (usando IDs únicos para evitar conflictos)
  const campoTituloEdit = document.getElementById('titulo-editar');
  const campoDescripcionEdit = document.getElementById('descripcion-editar');
  const campoPrecioEdit = document.getElementById('precio-editar');
  const campoImagenesEdit = document.getElementById('imagenes-editar');
  const campoEmprendimientoEdit = document.getElementById('emprendimiento-editar');
  const campoCategoriaEdit = document.getElementById('categoria-editar');
  const campoEtiquetasEdit = document.getElementById('etiquetasHiddenEditar');
  const campoEstadoEdit = document.getElementById('me-activo');
  
  // Log detallado de elementos faltantes
  if (!campoTituloEdit) console.error('Campo título no encontrado');
  if (!campoDescripcionEdit) console.error('Campo descripción no encontrado');
  if (!campoPrecioEdit) console.error('Campo precio no encontrado');
  if (!campoEmprendimientoEdit) console.error('Campo emprendimiento no encontrado');
  if (!campoCategoriaEdit) console.error('Campo categoría no encontrado');
  
  // Crear elementos de error para el formulario de editar
  const errorTituloEdit = crearElementoError(campoTituloEdit, 'tituloEditError');
  const errorDescripcionEdit = crearElementoError(campoDescripcionEdit, 'descripcionEditError');
  const errorPrecioEdit = crearElementoError(campoPrecioEdit, 'precioEditError');
  const errorImagenesEdit = crearElementoError(campoImagenesEdit, 'imagenesEditError');
  const errorEmprendimientoEdit = crearElementoError(campoEmprendimientoEdit, 'emprendimientoEditError');
  const errorCategoriaEdit = crearElementoError(campoCategoriaEdit, 'categoriaEditError');
  const errorEstadoEdit = crearElementoError(campoEstadoEdit, 'me-estadoError');

  // Para etiquetas, buscar el contenedor específico
  let errorEtiquetasEdit = document.getElementById('etiquetasEditError');
  if (!errorEtiquetasEdit && campoEtiquetasEdit) {
    errorEtiquetasEdit = document.createElement('div');
    errorEtiquetasEdit.id = 'etiquetasEditError';
    errorEtiquetasEdit.className = 'invalid-feedback';
    errorEtiquetasEdit.style.display = 'none';
    // Buscar el contenedor de etiquetas para agregar el error
    const contenedorEtiquetasEdit = document.getElementById('etiquetasSeleccionadasEditar') || 
                                   document.querySelector('.form-check');
    if (contenedorEtiquetasEdit) {
      contenedorEtiquetasEdit.parentNode.appendChild(errorEtiquetasEdit);
    } else if (campoEtiquetasEdit.parentNode) {
      campoEtiquetasEdit.parentNode.appendChild(errorEtiquetasEdit);
    }
  }

  
  // Funciones de validación locales que llaman a las reutilizables
  const validarTituloEditar = () => validarTituloProducto(campoTituloEdit, errorTituloEdit);
  const validarDescripcionEditar = () => validarDescripcionProducto(campoDescripcionEdit, errorDescripcionEdit);
  const validarPrecioEditar = () => validarPrecioProducto(campoPrecioEdit, errorPrecioEdit);
  const validarImagenesEditar = () => validarImagenesProducto(campoImagenesEdit, errorImagenesEdit, false); // Opcional en editar
  const validarEmprendimientoEditar = () => validarEmprendimientoProducto(campoEmprendimientoEdit, errorEmprendimientoEdit, campoEstadoEdit);
  const validarCategoriaEditar = () => validarCategoriaProducto(campoCategoriaEdit, errorCategoriaEdit);
  const validarEtiquetasEditar = () => validarEtiquetasProducto(campoEtiquetasEdit, errorEtiquetasEdit, true); // Obligatorio en editar
  const validarEstadoEditar = () => validarEstadoProducto(campoEstadoEdit, errorEstadoEdit, campoEmprendimientoEdit);

  // Event listeners para validación en tiempo real - Editar
  if (campoTituloEdit) {

    campoTituloEdit.addEventListener('blur', validarTituloEditar);
    campoTituloEdit.addEventListener('input', () => {
      const titulo = campoTituloEdit.value.trim();
      if (titulo.length > 100) {
        validarTituloEditar();
      }
    });
  }
  
  if (campoDescripcionEdit) {
    campoDescripcionEdit.addEventListener('blur', validarDescripcionEditar);
    campoDescripcionEdit.addEventListener('input', () => {
      const descripcion = campoDescripcionEdit.value.trim();
      if (descripcion.length > 800) {
        validarDescripcionEditar();
      }
    });
  }
  
  if (campoPrecioEdit) {
    campoPrecioEdit.addEventListener('blur', validarPrecioEditar);
    campoPrecioEdit.addEventListener('input', validarPrecioEditar);
  }
  
  if (campoImagenesEdit) {
    campoImagenesEdit.addEventListener('change', validarImagenesEditar);
  }
  
  if (campoEmprendimientoEdit) {
    campoEmprendimientoEdit.addEventListener('change', async () => {
      await validarEmprendimientoEditar();
    });
  }
  
  if (campoCategoriaEdit) {
    campoCategoriaEdit.addEventListener('change', validarCategoriaEditar);
  }
  
  if (campoEstadoEdit) {
    campoEstadoEdit.addEventListener('change', async () => {
      await validarEstadoEditar();
    });
  }

  if (campoEtiquetasEdit) {
    // Crear un observador para detectar cambios en el valor del campo oculto
    const observerEdit = new MutationObserver(() => {
      validarEtiquetasEditar();
    });
    
    // Observar cambios en el atributo value
    observerEdit.observe(campoEtiquetasEdit, { 
      attributes: true, 
      attributeFilter: ['value'] 
    });
    
    // Event listeners para detectar cambios en el campo
    campoEtiquetasEdit.addEventListener('input', validarEtiquetasEditar);
    campoEtiquetasEdit.addEventListener('change', validarEtiquetasEditar);
    
    // También verificar cambios periódicamente como backup
    let ultimoValorEtiquetas = campoEtiquetasEdit.value;
    setInterval(() => {
      if (campoEtiquetasEdit.value !== ultimoValorEtiquetas) {
        ultimoValorEtiquetas = campoEtiquetasEdit.value;
        validarEtiquetasEditar();
      }
    }, 1000);
  }
  
  // Validación al enviar el formulario de editar
  formularioEditarProducto.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    
    // Desactivar la validación nativa de HTML5
    formularioEditarProducto.setAttribute('novalidate', 'true');
    
    // Ejecutar todas las validaciones (algunas son asíncronas)
    const validaciones = await Promise.all([
      validarTituloEditar(),
      validarDescripcionEditar(),
      validarPrecioEditar(),
      validarImagenesEditar(),
      validarEmprendimientoEditar(),
      validarCategoriaEditar(),
      validarEtiquetasEditar(),
      validarEstadoEditar()
    ]);
    
    // Verificar si todas las validaciones pasaron
    const todasValidas = validaciones.every(valida => valida === true);
    
    if (!todasValidas) {
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Por favor, corrige los errores en el formulario', 'error');
      } else {
        console.warn('mostrarToast no disponible, usando alert como fallback');
        alert('Por favor, corrige los errores en el formulario');
      }
      return;
    }
    
    // Si todas las validaciones pasaron
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Actualizando producto...', 'info');
    }
    
    // Reactivar la validación nativa y enviar formulario
    formularioEditarProducto.removeAttribute('novalidate');
    formularioEditarProducto.submit();
  });
}

// Hacer la función disponible globalmente
window.inicializarValidacionesEditar = inicializarValidacionesEditar;

// ===============================
// VALIDACIONES DEL FORMULARIO CREAR PRODUCTO (EJECUTADO CUANDO DOM ESTÉ LISTO)
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  const formularioCrearProducto = document.getElementById('form-crear-producto');
  
  if (formularioCrearProducto) {
    console.log('Formulario crear producto encontrado, inicializando validaciones...');
    
    // Deshabilitar validación HTML nativa para usar solo nuestras validaciones personalizadas
    formularioCrearProducto.setAttribute('novalidate', 'true');
    
    // Elementos del formulario
    const campoTitulo = document.getElementById('titulo');
    const campoDescripcion = document.getElementById('descripcion');
    const campoPrecio = document.getElementById('precio');
    const campoImagenes = document.getElementById('imagenes');
    const campoEmprendimiento = document.getElementById('emprendimiento');
    const campoCategoria = document.getElementById('categoria');
    const campoEtiquetas = document.getElementById('etiquetasHidden');
    
    // Crear elementos de error
    const errorTitulo = crearElementoError(campoTitulo, 'tituloError');
    const errorDescripcion = crearElementoError(campoDescripcion, 'descripcionError');
    const errorPrecio = crearElementoError(campoPrecio, 'precioError');
    const errorImagenes = crearElementoError(campoImagenes, 'imagenesError');
    const errorEmprendimiento = crearElementoError(campoEmprendimiento, 'emprendimientoError');
    const errorCategoria = crearElementoError(campoCategoria, 'categoriaError');
    
    // Para etiquetas, buscar el contenedor específico
    let errorEtiquetas = document.getElementById('etiquetasError');
    if (!errorEtiquetas && campoEtiquetas) {
      errorEtiquetas = document.createElement('div');
      errorEtiquetas.id = 'etiquetasError';
      errorEtiquetas.className = 'invalid-feedback';
      errorEtiquetas.style.display = 'none';
      // Buscar el contenedor de etiquetas para agregar el error
      const contenedorEtiquetas = document.getElementById('etiquetasSeleccionadas') || 
                                  document.querySelector('.form-check');
      if (contenedorEtiquetas) {
        contenedorEtiquetas.parentNode.appendChild(errorEtiquetas);
      } else if (campoEtiquetas.parentNode) {
        campoEtiquetas.parentNode.appendChild(errorEtiquetas);
      }
    }
    
    // Funciones de validación locales que llaman a las reutilizables
    const validarTituloCrear = () => validarTituloProducto(campoTitulo, errorTitulo);
    const validarDescripcionCrear = () => validarDescripcionProducto(campoDescripcion, errorDescripcion);
    const validarPrecioCrear = () => validarPrecioProducto(campoPrecio, errorPrecio);
    const validarImagenesCrear = () => validarImagenesProducto(campoImagenes, errorImagenes, true); // Obligatorio en crear
    const validarEmprendimientoCrear = () => validarEmprendimientoProducto(campoEmprendimiento, errorEmprendimiento);
    const validarCategoriaCrear = () => validarCategoriaProducto(campoCategoria, errorCategoria);
    const validarEtiquetasCrear = () => validarEtiquetasProducto(campoEtiquetas, errorEtiquetas, true); // Obligatorio en crear
    
    // Event listeners para validación en tiempo real
    if (campoTitulo) {
      campoTitulo.addEventListener('blur', validarTituloCrear);
      campoTitulo.addEventListener('input', () => {
        const titulo = campoTitulo.value.trim();
        if (titulo.length > 100) {
          validarTituloCrear();
        }
      });
    }
    
    if (campoDescripcion) {
      campoDescripcion.addEventListener('blur', validarDescripcionCrear);
      campoDescripcion.addEventListener('input', () => {
        const descripcion = campoDescripcion.value.trim();
        if (descripcion.length > 800) {
          validarDescripcionCrear();
        }
      });
    }
    
    if (campoPrecio) {
      campoPrecio.addEventListener('blur', validarPrecioCrear);
      campoPrecio.addEventListener('input', validarPrecioCrear);
    }
    
    if (campoImagenes) {
      campoImagenes.addEventListener('change', validarImagenesCrear);
    }
    
    if (campoEmprendimiento) {
      campoEmprendimiento.addEventListener('change', async () => {
        await validarEmprendimientoCrear();
      });
    }
    
    if (campoCategoria) {
      campoCategoria.addEventListener('change', validarCategoriaCrear);
    }
    
    // Para etiquetas, necesitamos escuchar cambios en el campo oculto
    if (campoEtiquetas) {
      // Crear un observador para detectar cambios en el valor del campo oculto
      const observer = new MutationObserver(() => {
        validarEtiquetasCrear();
      });
      
      // Observar cambios en el atributo value
      observer.observe(campoEtiquetas, { 
        attributes: true, 
        attributeFilter: ['value'] 
      });
      
      // También escuchar el evento input si se dispara
      campoEtiquetas.addEventListener('input', validarEtiquetasCrear);
    }
    
    // Validación al enviar el formulario
    formularioCrearProducto.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      
      // Desactivar la validación nativa de HTML5
      formularioCrearProducto.setAttribute('novalidate', 'true');
      
      // Ejecutar todas las validaciones (algunas son asíncronas)
      const validaciones = await Promise.all([
        validarTituloCrear(),
        validarDescripcionCrear(),
        validarPrecioCrear(),
        validarImagenesCrear(),
        validarEmprendimientoCrear(),
        validarCategoriaCrear(),
        validarEtiquetasCrear()
      ]);
      
      // Verificar si todas las validaciones pasaron
      const todasValidas = validaciones.every(valida => valida === true);
      
      if (!todasValidas) {
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Por favor, corrige los errores en el formulario', 'error');
        } else {
          console.warn('mostrarToast no disponible, usando alert como fallback');
          alert('Por favor, corrige los errores en el formulario');
        }
        return;
      }
      
      // Si todas las validaciones pasaron
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Creando producto...', 'info');
      }
      
      // Reactivar la validación nativa y enviar formulario
      formularioCrearProducto.removeAttribute('novalidate');
      formularioCrearProducto.submit();
    });
  }
});
