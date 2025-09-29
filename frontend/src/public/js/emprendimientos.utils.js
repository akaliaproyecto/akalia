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

  // ===============================
  // FUNCIONES GLOBALES PARA REUTILIZAR
  // ===============================
  
  // NOTA: Las ubicaciones para editar se manejan directamente desde perfilEmprendimientos.js

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
      
      // Solo inicializar ubicaciones para crear (editar se maneja desde perfilEmprendimientos.js)
      inicializarUbicacionesCrear();
      
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

  // NOTA: Las validaciones de formularios se manejan en validaciones-emprendimientos.js

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
