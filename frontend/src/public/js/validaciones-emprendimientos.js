/* Validaciones de formularios - Emprendimientos */

// ===============================
// FUNCIONES UTILITARIAS GLOBALES
// ===============================

// Funciones de validación compartidas
function mostrarErrorEmprendimiento(campo, elementoError, mensaje) {
  campo.classList.add('is-invalid');
  campo.classList.remove('is-valid');
  if (elementoError) {
    elementoError.textContent = mensaje;
    elementoError.style.display = 'block';
  }
}

/* Validaciones de formularios - Emprendimientos */
/**
 * Validaciones para formularios relacionados con emprendimientos.
 * Contiene helpers para mostrar errores/exitos, validadores reutilizables y
 * la inicialización de validaciones para formularios de crear y editar.
 * Los comentarios están escritos para un estudiante principiante.
 */

// ===============================
// FUNCIONES UTILITARIAS GLOBALES
// ===============================

// Funciones de validación compartidas
/**
 * Muestra un error visual en un campo (clase Bootstrap 'is-invalid').
 * @param {HTMLElement} campo - Elemento input/textarea/select.
 * @param {HTMLElement|null} elementoError - Contenedor del texto de error.
 * @param {string} mensaje - Mensaje a mostrar.
 */
function mostrarErrorEmprendimiento(campo, elementoError, mensaje) {
  campo.classList.add('is-invalid');
  campo.classList.remove('is-valid');
  if (elementoError) {
    elementoError.textContent = mensaje;
    elementoError.style.display = 'block';
  }
}

/**
 * Marca un campo como exitoso (clase Bootstrap 'is-valid') y oculta el error.
 * @param {HTMLElement} campo - Elemento input/textarea/select.
 * @param {HTMLElement|null} elementoError - Contenedor del texto de error.
 */
function mostrarExitoEmprendimiento(campo, elementoError) {
  campo.classList.add('is-valid');
  campo.classList.remove('is-invalid');
  if (elementoError) {
    elementoError.textContent = '';
    elementoError.style.display = 'none';
  }
}

/**
 * Comprueba si un valor está presente como opción válida en un elemento select.
 * @param {HTMLSelectElement} selectElement - El select a revisar.
 * @param {string} valor - Valor a buscar en las opciones.
 * @returns {boolean} true si el valor existe en las opciones.
 */
function validarOpcionValidaEmprendimiento(selectElement, valor) {
  if (!selectElement || !valor) return false;
  
  // Verificar si el valor existe como una opción válida en el select
  const opciones = Array.from(selectElement.options);
  return opciones.some(opcion => opcion.value === valor);
}

/**
 * Crea (si no existe) y devuelve un contenedor para mostrar errores cerca del campo.
 * @param {HTMLElement} campo - El campo al que se asociará el error.
 * @param {string} idError - ID para el contenedor de error.
 * @returns {HTMLElement|null} Elemento de error creado o existente, o null si no hay campo.
 */
function crearElementoErrorEmprendimiento(campo, idError) {
  if (!campo) return null;
  
  let elementoError = document.getElementById(idError);
  if (!elementoError) {
    elementoError = document.createElement('div');
    elementoError.id = idError;
    elementoError.className = 'invalid-feedback';
    elementoError.style.display = 'none';
    campo.parentNode.appendChild(elementoError);
  }
  return elementoError;
}

// ===============================
// FUNCIONES DE VALIDACIÓN REUTILIZABLES
// ===============================

/**
 * Valida el nombre del emprendimiento.
 * - Obligatorio
 * - Mínimo 3 caracteres
 * - Máximo 100 caracteres
 * @param {HTMLInputElement} campoNombre - Campo input del nombre.
 * @param {HTMLElement|null} elementoError - Contenedor del mensaje de error.
 * @returns {boolean} true si es válido.
 */
function validarNombreEmprendimiento(campoNombre, elementoError) {
  if (!campoNombre) return false;
  
  const nombre = campoNombre.value.trim();
  
  if (!nombre) {
    mostrarErrorEmprendimiento(campoNombre, elementoError, 'El nombre del emprendimiento es obligatorio');
    return false;
  }
  
  if (nombre.length < 3) {
    mostrarErrorEmprendimiento(campoNombre, elementoError, 'El nombre debe tener al menos 3 caracteres');
    return false;
  }
  
  if (nombre.length > 100) {
    mostrarErrorEmprendimiento(campoNombre, elementoError, 'El nombre no puede superar los 100 caracteres');
    return false;
  }
  
  mostrarExitoEmprendimiento(campoNombre, elementoError);
  return true;
}

/**
 * Valida la descripción del emprendimiento (opcional).
 * - Máximo 500 caracteres si se provee.
 * @param {HTMLTextAreaElement} campoDescripcion - Campo de descripción.
 * @param {HTMLElement|null} elementoError - Contenedor del mensaje de error.
 * @returns {boolean} true si es válida o vacía.
 */
function validarDescripcionEmprendimiento(campoDescripcion, elementoError) {
  if (!campoDescripcion) return true; // Es opcional
  
  const descripcion = campoDescripcion.value.trim();
  
  // La descripción es opcional, pero si se proporciona debe cumplir las reglas
  if (descripcion && descripcion.length > 500) {
    mostrarErrorEmprendimiento(campoDescripcion, elementoError, 'La descripción no puede superar los 500 caracteres');
    return false;
  }
  
  mostrarExitoEmprendimiento(campoDescripcion, elementoError);
  return true;
}

/**
 * Valida la selección de ciudad.
 * Verifica que el campo exista y que el valor sea una opción válida del select.
 * @param {HTMLSelectElement} campoCiudad - Select de ciudad.
 * @param {HTMLElement|null} elementoError - Contenedor del mensaje de error.
 * @returns {boolean} true si la ciudad es válida.
 */
function validarCiudadEmprendimiento(campoCiudad, elementoError) {
  if (!campoCiudad) {

    return false;
  }
  
  const ciudad = campoCiudad.value ? campoCiudad.value.trim() : '';

  
  if (!ciudad || ciudad === '') {
    mostrarErrorEmprendimiento(campoCiudad, elementoError, 'La ciudad es obligatoria');
    return false;
  }
  
  // Validar que la ciudad sea una opción válida
  if (!validarOpcionValidaEmprendimiento(campoCiudad, ciudad)) {
    mostrarErrorEmprendimiento(campoCiudad, elementoError, 'Debe seleccionar una ciudad válida de la lista');
    return false;
  }
  
  mostrarExitoEmprendimiento(campoCiudad, elementoError);
  return true;
}

/**
 * Valida el departamento seleccionado.
 * @param {HTMLSelectElement} campoDepartamento - Select de departamento.
 * @param {HTMLElement|null} elementoError - Contenedor del mensaje de error.
 * @returns {boolean} true si es válido.
 */
function validarDepartamentoEmprendimiento(campoDepartamento, elementoError) {
  if (!campoDepartamento) {

    return false;
  }
  
  const departamento = campoDepartamento.value ? campoDepartamento.value.trim() : '';
  
  
  
  if (!departamento || departamento === '') {
    mostrarErrorEmprendimiento(campoDepartamento, elementoError, 'El departamento es obligatorio');
    return false;
  }
  
  // Validar que el departamento sea una opción válida
  if (!validarOpcionValidaEmprendimiento(campoDepartamento, departamento)) {
    mostrarErrorEmprendimiento(campoDepartamento, elementoError, 'Debe seleccionar un departamento válido de la lista');
    return false;
  }
  
  mostrarExitoEmprendimiento(campoDepartamento, elementoError);
  return true;
}

/**
 * Valida el archivo del logo.
 * - Opcional por defecto
 * - Tipos permitidos: JPG, PNG, GIF, WebP, SVG
 * - Tamaño máximo: 25MB
 * @param {HTMLInputElement} campoLogo - Input file del logo.
 * @param {HTMLElement|null} elementoError - Contenedor del mensaje de error.
 * @param {boolean} esOpcional - Si el campo puede estar vacío.
 * @returns {boolean} true si es válido o vacío cuando es opcional.
 */
function validarLogoEmprendimiento(campoLogo, elementoError, esOpcional = true) {
  if (!campoLogo) return esOpcional;
  
  const logo = campoLogo.files[0];
  
  // El logo es opcional en la mayoría de casos
  if (!logo) {
    mostrarExitoEmprendimiento(campoLogo, elementoError);
    return true;
  }
  
  // Validar tipo de archivo
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!tiposPermitidos.includes(logo.type)) {
    mostrarErrorEmprendimiento(campoLogo, elementoError, 'Solo se permiten imágenes (JPG, PNG, GIF, WebP, SVG)');
    return false;
  }
  
  // Validar tamaño (5MB máximo)
  const tamanoMaximo = 25 * 1024 * 1024; // 5MB en bytes
  if (logo.size > tamanoMaximo) {
    mostrarErrorEmprendimiento(campoLogo, elementoError, 'La imagen no puede superar los 25MB');
    return false;
  }
  
  mostrarExitoEmprendimiento(campoLogo, elementoError);
  return true;
}

/**
 * Valida el estado (activo/inactivo) del emprendimiento.
 * @param {HTMLElement} campoEstado - Campo que contiene el estado.
 * @param {HTMLElement|null} elementoError - Contenedor del mensaje de error.
 * @returns {boolean} true si el estado es 'true' o 'false'.
 */
function validarEstadoEmprendimiento(campoEstado, elementoError) {
  if (!campoEstado) return false;
  
  const estado = campoEstado.value;
  
  if (estado !== 'true' && estado !== 'false') {
    mostrarErrorEmprendimiento(campoEstado, elementoError, 'Debe seleccionar un estado válido');
    return false;
  }
  
  mostrarExitoEmprendimiento(campoEstado, elementoError);
  return true;
}

// ===============================
// FUNCIÓN PARA INICIALIZAR VALIDACIONES DE EDITAR (LLAMADA DINÁMICAMENTE)
// ===============================

/**
 * Inicializa validaciones para el formulario de editar emprendimiento.
 * Esta función se exporta globalmente para ser llamada desde otros scripts.
 */
function inicializarValidacionesEditarEmprendimiento() {

  
  const formularioEditarEmprendimiento = document.getElementById('form-editar-emprendimiento-modal');
  
  if (!formularioEditarEmprendimiento) {
    console.error('Formulario de editar emprendimiento no encontrado');
    return;
  }
  
  
  // Elementos del formulario de editar (usando IDs con prefijo me-)
  const campoNombreEdit = document.getElementById('me-nombre');
  const campoDescripcionEdit = document.getElementById('me-descripcion');
  const campoCiudadEdit = document.getElementById('me-ubic-ciudad');
  const campoDepartamentoEdit = document.getElementById('me-ubic-departamento');
  const campoLogoEdit = document.getElementById('me-logo-input');
  const campoEstadoEdit = document.getElementById('me-activo');
  
  // Crear elementos de error para el formulario de editar
  const errorNombreEdit = crearElementoErrorEmprendimiento(campoNombreEdit, 'me-nombreError');
  const errorDescripcionEdit = crearElementoErrorEmprendimiento(campoDescripcionEdit, 'me-descripcionError');
  const errorCiudadEdit = crearElementoErrorEmprendimiento(campoCiudadEdit, 'me-ciudadError');
  const errorDepartamentoEdit = crearElementoErrorEmprendimiento(campoDepartamentoEdit, 'me-departamentoError');
  const errorLogoEdit = crearElementoErrorEmprendimiento(campoLogoEdit, 'me-logoError');
  const errorEstadoEdit = crearElementoErrorEmprendimiento(campoEstadoEdit, 'me-estadoError');
  
  // Funciones de validación locales que llaman a las reutilizables
  const validarNombreEditar = () => validarNombreEmprendimiento(campoNombreEdit, errorNombreEdit);
  const validarDescripcionEditar = () => validarDescripcionEmprendimiento(campoDescripcionEdit, errorDescripcionEdit);
  const validarCiudadEditar = () => validarCiudadEmprendimiento(campoCiudadEdit, errorCiudadEdit);
  const validarDepartamentoEditar = () => validarDepartamentoEmprendimiento(campoDepartamentoEdit, errorDepartamentoEdit);
  const validarLogoEditar = () => validarLogoEmprendimiento(campoLogoEdit, errorLogoEdit, true);
  const validarEstadoEditar = () => validarEstadoEmprendimiento(campoEstadoEdit, errorEstadoEdit);
  
  // Event listeners para validación en tiempo real - Editar
  if (campoNombreEdit) {
    campoNombreEdit.addEventListener('blur', validarNombreEditar);
    campoNombreEdit.addEventListener('input', () => {
      const nombre = campoNombreEdit.value.trim();
      if (nombre.length > 100) {
        validarNombreEditar();
      }
    });
  }
  
  if (campoDescripcionEdit) {
    campoDescripcionEdit.addEventListener('blur', validarDescripcionEditar);
    campoDescripcionEdit.addEventListener('input', () => {
      const descripcion = campoDescripcionEdit.value.trim();
      if (descripcion.length > 500) {
        validarDescripcionEditar();
      }
    });
  }
  
  if (campoCiudadEdit) {
    campoCiudadEdit.addEventListener('change', validarCiudadEditar);
    campoCiudadEdit.addEventListener('blur', validarCiudadEditar);
    // Observer para cambios programáticos
    const observerCiudad = new MutationObserver(() => {
      setTimeout(validarCiudadEditar, 100); // Pequeño delay para que se actualice el DOM
    });
    observerCiudad.observe(campoCiudadEdit, { attributes: true, attributeFilter: ['value', 'disabled'] });
  }
  
  if (campoDepartamentoEdit) {
    campoDepartamentoEdit.addEventListener('change', validarDepartamentoEditar);
    campoDepartamentoEdit.addEventListener('blur', validarDepartamentoEditar);
    // Observer para cambios programáticos
    const observerDepartamento = new MutationObserver(() => {
      setTimeout(validarDepartamentoEditar, 100); // Pequeño delay para que se actualice el DOM
    });
    observerDepartamento.observe(campoDepartamentoEdit, { attributes: true, attributeFilter: ['value', 'disabled'] });
  }
  
  if (campoLogoEdit) {
    campoLogoEdit.addEventListener('change', validarLogoEditar);
  }
  
  if (campoEstadoEdit) {
    campoEstadoEdit.addEventListener('change', validarEstadoEditar);
  }
  
  // Deshabilitar validación HTML nativa para usar solo nuestras validaciones personalizadas
  formularioEditarEmprendimiento.setAttribute('novalidate', 'true');
  
  // Validación al enviar el formulario de editar
  formularioEditarEmprendimiento.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    
    
    // Ejecutar todas las validaciones
    const validaciones = [
      validarNombreEditar(),
      validarDescripcionEditar(),
      validarCiudadEditar(),
      validarDepartamentoEditar(),
      validarLogoEditar(),
      validarEstadoEditar()
    ];
    
    
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
      window.mostrarToast('Actualizando emprendimiento...', 'info');
    }
    
    // Temporalmente habilitar validación HTML para el envío real
    formularioEditarEmprendimiento.removeAttribute('novalidate');
    
    // Enviar formulario
    formularioEditarEmprendimiento.submit();
  });

}

// Hacer la función disponible globalmente
window.inicializarValidacionesEditarEmprendimiento = inicializarValidacionesEditarEmprendimiento;

document.addEventListener('DOMContentLoaded', () => {

  // ===============================
  // VALIDACIONES DEL FORMULARIO CREAR EMPRENDIMIENTO (ESTÁTICO)
  // ===============================
  const formularioCrearEmprendimiento = document.getElementById('form-crear-emprendimiento');
  
  if (formularioCrearEmprendimiento) {

    
    // Elementos del formulario
    const campoNombre = document.getElementById('nombreEmprendimiento');
    const campoDescripcion = document.getElementById('descripcionEmprendimiento');
    const campoCiudad = document.getElementById('ubicacionCiudad');
    const campoDepartamento = document.getElementById('ubicacionDepartamento');
    const campoLogo = document.getElementById('logo');
    
    // Crear elementos de error usando la función global
    const errorNombre = crearElementoErrorEmprendimiento(campoNombre, 'nombreEmprendimientoError');
    const errorDescripcion = crearElementoErrorEmprendimiento(campoDescripcion, 'descripcionEmprendimientoError');
    const errorCiudad = crearElementoErrorEmprendimiento(campoCiudad, 'ubicacionCiudadError');
    const errorDepartamento = crearElementoErrorEmprendimiento(campoDepartamento, 'ubicacionDepartamentoError');
    const errorLogo = crearElementoErrorEmprendimiento(campoLogo, 'logoError');
    
    // Funciones de validación locales que usan las funciones globales
    const validarNombreCrear = () => validarNombreEmprendimiento(campoNombre, errorNombre);
    const validarDescripcionCrear = () => validarDescripcionEmprendimiento(campoDescripcion, errorDescripcion);
    const validarCiudadCrear = () => validarCiudadEmprendimiento(campoCiudad, errorCiudad);
    const validarDepartamentoCrear = () => validarDepartamentoEmprendimiento(campoDepartamento, errorDepartamento);
    const validarLogoCrear = () => validarLogoEmprendimiento(campoLogo, errorLogo, true);
    
    // Event listeners para validación en tiempo real
    if (campoNombre) {
      campoNombre.addEventListener('blur', validarNombreCrear);
      campoNombre.addEventListener('input', () => {
        // Validar mientras escribe para mostrar el contador de caracteres
        const nombre = campoNombre.value.trim();
        if (nombre.length > 100) {
          validarNombreCrear();
        }
      });
    }
    
    if (campoDescripcion) {
      campoDescripcion.addEventListener('blur', validarDescripcionCrear);
      campoDescripcion.addEventListener('input', () => {
        // Validar mientras escribe para mostrar el contador de caracteres
        const descripcion = campoDescripcion.value.trim();
        if (descripcion.length > 500) {
          validarDescripcionCrear();
        }
      });
    }
    
    if (campoCiudad) {
      campoCiudad.addEventListener('change', validarCiudadCrear);
    }
    
    if (campoDepartamento) {
      campoDepartamento.addEventListener('change', validarDepartamentoCrear);
    }
    
    if (campoLogo) {
      campoLogo.addEventListener('change', validarLogoCrear);
    }
    
    // Deshabilitar validación HTML nativa para usar solo nuestras validaciones personalizadas
    formularioCrearEmprendimiento.setAttribute('novalidate', 'true');
    
    // Validación al enviar el formulario
    formularioCrearEmprendimiento.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      evento.stopPropagation();

      
      // Ejecutar todas las validaciones
      const validaciones = [
        validarNombreCrear(),
        validarDescripcionCrear(),
        validarCiudadCrear(),
        validarDepartamentoCrear(),
        validarLogoCrear()
      ];

      
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
        window.mostrarToast('Creando emprendimiento...', 'info');
      }
      
      // Temporalmente habilitar validación HTML para el envío real
      formularioCrearEmprendimiento.removeAttribute('novalidate');
      
      // Enviar formulario
      formularioCrearEmprendimiento.submit();
    });
  }
  
  // ===============================
  // NOTA: Las validaciones del formulario editar se inicializan dinámicamente
  // desde perfilEmprendimientos.js cuando se carga el modal
  // ===============================
});
