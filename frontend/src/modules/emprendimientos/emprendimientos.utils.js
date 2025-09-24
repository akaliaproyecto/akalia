/**
 * Utilidades para emprendimientos - Manejo de formularios y ubicaciones
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // ===============================
  // INICIALIZACIÓN DE UBICACIONES EN FORMULARIOS
  // ===============================
  
  /**
   * Inicializa los selects de ubicación para el formulario de crear emprendimiento
   */
  function inicializarUbicacionesCrear() {
    const modalCrear = document.getElementById('modalCrearEmprendimiento');
    
    if (modalCrear) {
      modalCrear.addEventListener('shown.bs.modal', async function() {
        console.log('Modal crear emprendimiento abierto, inicializando ubicaciones...');
        
        if (window.ubicacionesService) {
          await window.ubicacionesService.inicializarSelects(
            'ubicacionDepartamento',
            'ubicacionCiudad'
          );
        } else {
          console.error('Servicio de ubicaciones no disponible');
        }
      });
    }
  }

  /**
   * Inicializa los selects de ubicación para el formulario de editar emprendimiento
   * @param {Object} emprendimiento - Datos del emprendimiento a editar
   */
  function inicializarUbicacionesEditar(emprendimiento = {}) {
    const modalEditar = document.getElementById('modalEditarEmprendimiento');
    
    if (modalEditar) {
      modalEditar.addEventListener('shown.bs.modal', async function() {
        console.log('Modal editar emprendimiento abierto, inicializando ubicaciones...');
        
        if (window.ubicacionesService) {
          // Obtener valores actuales del emprendimiento
          const valoresIniciales = {};
          
          if (emprendimiento.ubicacionEmprendimiento) {
            valoresIniciales.departamento = emprendimiento.ubicacionEmprendimiento.departamento;
            valoresIniciales.municipio = emprendimiento.ubicacionEmprendimiento.ciudad;
          }
          
          await window.ubicacionesService.inicializarSelects(
            'me-ubic-departamento',
            'me-ubic-ciudad',
            valoresIniciales
          );
        } else {
          console.error('Servicio de ubicaciones no disponible');
        }
      });
    }
  }

  // ===============================
  // FUNCIONES GLOBALES PARA REUTILIZAR
  // ===============================
  
  /**
   * Función global para precargar ubicaciones en el modal de editar
   * Se llama desde otros archivos cuando se abre el modal de editar
   * @param {Object} emprendimiento - Datos del emprendimiento
   */
  window.precargarUbicacionesEditar = async function(emprendimiento) {
    if (window.ubicacionesService && emprendimiento.ubicacionEmprendimiento) {
      const valoresIniciales = {
        departamento: emprendimiento.ubicacionEmprendimiento.departamento,
        municipio: emprendimiento.ubicacionEmprendimiento.ciudad
      };
      
      await window.ubicacionesService.inicializarSelects(
        'me-ubic-departamento',
        'me-ubic-ciudad',
        valoresIniciales
      );
    }
  };

  /**
   * Función para resetear los selects de ubicación
   */
  window.resetearUbicaciones = function(selectDepartamentoId, selectCiudadId) {
    const selectDepartamento = document.getElementById(selectDepartamentoId);
    const selectCiudad = document.getElementById(selectCiudadId);
    
    if (selectDepartamento) {
      selectDepartamento.selectedIndex = 0;
    }
    
    if (selectCiudad) {
      selectCiudad.innerHTML = '<option value="" disabled selected>Primero selecciona un departamento</option>';
      selectCiudad.disabled = true;
    }
  };

  // ===============================
  // VALIDACIONES DE UBICACIÓN
  // ===============================
  
  /**
   * Valida que se hayan seleccionado departamento y ciudad
   * @param {string} selectDepartamentoId - ID del select de departamento
   * @param {string} selectCiudadId - ID del select de ciudad
   * @returns {boolean|Object} true si es válido, objeto con errores si no
   */
  window.validarUbicaciones = function(selectDepartamentoId, selectCiudadId) {
    const selectDepartamento = document.getElementById(selectDepartamentoId);
    const selectCiudad = document.getElementById(selectCiudadId);
    
    const errores = {};
    
    if (!selectDepartamento || !selectDepartamento.value) {
      errores.departamento = 'Debe seleccionar un departamento';
    }
    
    if (!selectCiudad || !selectCiudad.value) {
      errores.ciudad = 'Debe seleccionar una ciudad';
    }
    
    return Object.keys(errores).length === 0 ? true : errores;
  };

  // ===============================
  // INICIALIZACIÓN AUTOMÁTICA
  // ===============================
  
  // Esperar a que se cargue el servicio de ubicaciones
  const esperarServicioUbicaciones = setInterval(() => {
    if (window.ubicacionesService) {
      clearInterval(esperarServicioUbicaciones);
      
      // Inicializar ubicaciones para ambos formularios
      inicializarUbicacionesCrear();
      inicializarUbicacionesEditar();
      
      console.log('Utilidades de emprendimientos inicializadas correctamente');
    }
  }, 100);

  // Timeout para evitar bucle infinito
  setTimeout(() => {
    clearInterval(esperarServicioUbicaciones);
    if (!window.ubicacionesService) {
      console.error('Timeout: Servicio de ubicaciones no se cargó');
    }
  }, 5000);

  // ===============================
  // EVENT LISTENERS PARA FORMULARIOS
  // ===============================

  // Formulario de crear emprendimiento
  const formCrear = document.getElementById('form-crear-emprendimiento');
  if (formCrear) {
    formCrear.addEventListener('submit', function(event) {
      const validacion = window.validarUbicaciones('ubicacionDepartamento', 'ubicacionCiudad');
      
      if (validacion !== true) {
        event.preventDefault();
        
        // Mostrar errores de validación
        if (validacion.departamento) {
          console.error('Error departamento:', validacion.departamento);
          // Aquí podrías agregar lógica para mostrar el error en la UI
        }
        
        if (validacion.ciudad) {
          console.error('Error ciudad:', validacion.ciudad);
          // Aquí podrías agregar lógica para mostrar el error en la UI
        }
        
        // Mostrar mensaje general de error
        if (window.mostrarToast) {
          window.mostrarToast('Por favor, selecciona departamento y ciudad', 'error');
        }
      }
    });
  }

  // Formulario de editar emprendimiento
  const formEditar = document.getElementById('form-editar-emprendimiento-modal');
  if (formEditar) {
    formEditar.addEventListener('submit', function(event) {
      const validacion = window.validarUbicaciones('me-ubic-departamento', 'me-ubic-ciudad');
      
      if (validacion !== true) {
        event.preventDefault();
        
        // Mostrar errores de validación
        if (validacion.departamento) {
          console.error('Error departamento:', validacion.departamento);
        }
        
        if (validacion.ciudad) {
          console.error('Error ciudad:', validacion.ciudad);
        }
        
        // Mostrar mensaje general de error
        if (window.mostrarToast) {
          window.mostrarToast('Por favor, selecciona departamento y ciudad', 'error');
        }
      }
    });
  }

  // ===============================
  // RESET DE FORMULARIOS AL CERRAR MODALES
  // ===============================

  // Reset al cerrar modal de crear
  const modalCrear = document.getElementById('modalCrearEmprendimiento');
  if (modalCrear) {
    modalCrear.addEventListener('hidden.bs.modal', function() {
      window.resetearUbicaciones('ubicacionDepartamento', 'ubicacionCiudad');
    });
  }

  // Reset al cerrar modal de editar
  const modalEditar = document.getElementById('modalEditarEmprendimiento');
  if (modalEditar) {
    modalEditar.addEventListener('hidden.bs.modal', function() {
      window.resetearUbicaciones('me-ubic-departamento', 'me-ubic-ciudad');
    });
  }

});
