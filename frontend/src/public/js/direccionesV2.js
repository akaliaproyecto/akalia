/**
 * Módulo mejorado para manejo de direcciones de usuario
 * Utiliza el archivo JSON completo de municipios por departamento
 */

class DireccionesManagerV2 {
  constructor() {
    this.municipiosPorDepartamento = null;
    this.direccionesUsuario = [];
    this.init();
  }

  async init() {
    await this.cargarMunicipiosPorDepartamento();
    this.inicializarEventListeners();
    this.cargarDireccionesExistentes();
  }

  async cargarMunicipiosPorDepartamento() {
    try {
      // Llamada a la API para obtener los municipios por departamento
      const response = await fetch('/municipios-por-departamento');
      if (response.ok) {
        this.municipiosPorDepartamento = await response.json();
      } else {
        console.warn('No se pudo cargar el archivo completo, usando datos fallback');
        this.municipiosPorDepartamento = this.getDatosFallback();
      }
    } catch (error) {
      console.error('Error cargando municipios por departamento:', error);
      this.municipiosPorDepartamento = this.getDatosFallback();
    }
  }

  getDatosFallback() {
    return {
      "Amazonas": [
        {id: 91001, nombre: "Leticia"},
        {id: 91540, nombre: "Puerto Nariño"}
      ],
      "Antioquia": [
        {id: 5001, nombre: "Medellín"},
        {id: 5088, nombre: "Bello"},
        {id: 5360, nombre: "Itagüí"},
        {id: 5266, nombre: "Envigado"}
      ],
      "Bogotá D.C.": [
        {id: 11001, nombre: "Bogotá, D.C."}
      ],
      "Bolívar": [
        {id: 13001, nombre: "Cartagena"},
        {id: 13490, nombre: "Magangué"}
      ],
      "Cundinamarca": [
        {id: 25001, nombre: "Agua de Dios"},
        {id: 25019, nombre: "Albán"},
        {id: 25035, nombre: "Anapoima"}
      ]
    };
  }

  inicializarEventListeners() {
    // Botón para mostrar formulario de nueva dirección
    document.getElementById('btnAgregarDireccion')?.addEventListener('click', () => {
      this.mostrarFormularioNuevaDireccion();
    });

    // Botón para ocultar formulario de nueva dirección
    document.getElementById('btnCancelarDireccion')?.addEventListener('click', () => {
      this.ocultarFormularioNuevaDireccion();
    });

    // Botón para guardar nueva dirección
    document.getElementById('btnGuardarDireccion')?.addEventListener('click', () => {
      this.guardarNuevaDireccion();
    });

    // Listener para cambio de departamento (cargar ciudades)
    document.getElementById('nuevoDepartamento')?.addEventListener('change', (e) => {
      this.cargarCiudadesPorDepartamento(e.target.value);
    });

    // Listener del formulario principal para incluir direcciones
    document.getElementById('formEditarPerfil')?.addEventListener('submit', (e) => {
      this.prepararDireccionesParaEnvio(e);
    });
  }

  mostrarFormularioNuevaDireccion() {
    const form = document.getElementById('formNuevaDireccion');
    if (form) {
      form.style.display = 'block';
      this.cargarDepartamentos();
      this.limpiarFormularioNuevaDireccion();
    }
  }

  ocultarFormularioNuevaDireccion() {
    const form = document.getElementById('formNuevaDireccion');
    if (form) {
      form.style.display = 'none';
      this.limpiarFormularioNuevaDireccion();
    }
  }

  limpiarFormularioNuevaDireccion() {
    document.getElementById('nuevaDireccion').value = '';
    document.getElementById('nuevoDepartamento').value = '';
    document.getElementById('nuevaCiudad').value = '';
    document.getElementById('nuevaCiudad').disabled = true;
    document.getElementById('nuevaCiudad').innerHTML = '<option value="">Primero selecciona un departamento</option>';
  }

  cargarDepartamentos() {
    const selectDepartamento = document.getElementById('nuevoDepartamento');
    if (!selectDepartamento || !this.municipiosPorDepartamento) return;

    selectDepartamento.innerHTML = '<option value="">Selecciona un departamento</option>';
    
    Object.keys(this.municipiosPorDepartamento).forEach(departamento => {
      const option = document.createElement('option');
      option.value = departamento;
      option.textContent = departamento;
      selectDepartamento.appendChild(option);
    });
  }

  cargarCiudadesPorDepartamento(departamento) {
    const selectCiudad = document.getElementById('nuevaCiudad');
    if (!selectCiudad || !departamento || !this.municipiosPorDepartamento) return;

    selectCiudad.innerHTML = '<option value="">Selecciona una ciudad</option>';
    selectCiudad.disabled = false;

    const ciudades = this.municipiosPorDepartamento[departamento] || [];
    ciudades.forEach(ciudad => {
      const option = document.createElement('option');
      option.value = ciudad.nombre;
      option.textContent = ciudad.nombre;
      selectCiudad.appendChild(option);
    });
  }

  validarNuevaDireccion() {
    const errores = [];
    
    const direccion = document.getElementById('nuevaDireccion').value.trim();
    const departamento = document.getElementById('nuevoDepartamento').value;
    const ciudad = document.getElementById('nuevaCiudad').value;

    if (!direccion) errores.push('La dirección es requerida');
    if (direccion && direccion.length < 5) errores.push('La dirección debe tener al menos 5 caracteres');
    if (!departamento) errores.push('El departamento es requerido');
    if (!ciudad) errores.push('La ciudad es requerida');

    return errores;
  }

  async guardarNuevaDireccion() {
    const errores = this.validarNuevaDireccion();
    
    if (errores.length > 0) {
      this.mostrarError(errores.join('<br>'));
      return;
    }

    const nuevaDireccion = {
      direccion: document.getElementById('nuevaDireccion').value.trim(),
      departamento: document.getElementById('nuevoDepartamento').value,
      ciudad: document.getElementById('nuevaCiudad').value,
      fechaCreacion: new Date()
    };

    try {
      // Deshabilitar botón mientras se guarda
      const btnGuardar = document.getElementById('btnGuardarDireccion');
      btnGuardar.disabled = true;
      btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Guardando...';

      // Agregar a la lista local
      this.direccionesUsuario.push(nuevaDireccion);
      
      this.mostrarExito('Dirección agregada exitosamente');
      this.actualizarVistaDirectiones();
      this.ocultarFormularioNuevaDireccion();
      
      // Restaurar botón
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = '<i class="fas fa-check me-1"></i> Guardar Dirección';
      
    } catch (error) {
      console.error('Error guardando dirección:', error);
      this.mostrarError('Error al guardar la dirección. Intenta nuevamente.');
      
      // Restaurar botón en caso de error
      const btnGuardar = document.getElementById('btnGuardarDireccion');
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = '<i class="fas fa-check me-1"></i> Guardar Dirección';
    }
  }

  cargarDireccionesExistentes() {
    // Obtener direcciones del usuario desde los datos del DOM o variable global
    try {
      if (window.usuarioDirecciones) {
        this.direccionesUsuario = [...window.usuarioDirecciones];
      } else {
        this.direccionesUsuario = [];
      }
    } catch (error) {
      console.error('Error cargando direcciones existentes:', error);
      this.direccionesUsuario = [];
    }
    
    this.actualizarVistaDirectiones();
  }

  actualizarVistaDirectiones() {
    const container = document.getElementById('direccionesExistentes');
    if (!container) return;

    if (this.direccionesUsuario.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info d-flex align-items-center" role="alert">
          <i class="fas fa-info-circle me-2"></i>
          <span>No hay direcciones registradas aún</span>
        </div>
      `;
      return;
    }

    container.innerHTML = this.direccionesUsuario.map((direccion, index) => `
      <div class="card mb-2">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1">
                <i class="fas fa-map-marker-alt text-muted me-2"></i>
                ${direccion.direccion}
              </h6>
              <small class="text-muted">
                ${direccion.ciudad}, ${direccion.departamento}
              </small>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-danger btn-sm" onclick="window.direccionesManager.eliminarDireccion(${index})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  async eliminarDireccion(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      try {
        // Eliminar de la lista local
        this.direccionesUsuario.splice(index, 1);
        
        this.mostrarExito('Dirección eliminada exitosamente');
        this.actualizarVistaDirectiones();
        
      } catch (error) {
        console.error('Error eliminando dirección:', error);
        this.mostrarError('Error al eliminar la dirección. Intenta nuevamente.');
      }
    }
  }

  prepararDireccionesParaEnvio(event) {
    // Agregar direcciones como campo oculto al formulario
    const form = event.target;
    
    // Remover campos de direcciones existentes para evitar duplicados
    const existingFields = form.querySelectorAll('input[name="direcciones"]');
    existingFields.forEach(field => field.remove());
    
    // Agregar direcciones actuales como campo oculto
    const direccionesInput = document.createElement('input');
    direccionesInput.type = 'hidden';
    direccionesInput.name = 'direcciones';
    direccionesInput.value = JSON.stringify(this.direccionesUsuario);
    form.appendChild(direccionesInput);
  }

  mostrarError(mensaje) {
    this.mostrarAlerta(mensaje, 'alert-danger', 'fas fa-exclamation-circle');
  }

  mostrarExito(mensaje) {
    this.mostrarAlerta(mensaje, 'alert-success', 'fas fa-check-circle');
  }

  mostrarAlerta(mensaje, tipoAlert, icono) {
    const alertContainer = document.getElementById('mensajeEstadoModal');
    if (alertContainer) {
      alertContainer.className = `alert ${tipoAlert}`;
      alertContainer.innerHTML = `<i class="${icono} me-2"></i>${mensaje}`;
      alertContainer.classList.remove('d-none');
      
      // Auto-ocultar después de unos segundos
      const timeout = tipoAlert === 'alert-success' ? 3000 : 5000;
      setTimeout(() => {
        alertContainer.classList.add('d-none');
      }, timeout);
    }
  }

  // Método para obtener las direcciones actuales (útil para el formulario principal)
  obtenerDirecciones() {
    return this.direccionesUsuario;
  }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
  const modalEditarPerfil = document.getElementById('modalEditarPerfil');
  if (modalEditarPerfil) {
    modalEditarPerfil.addEventListener('shown.bs.modal', function() {
      if (!window.direccionesManager) {
        window.direccionesManager = new DireccionesManagerV2();
      }
    });
  }
});
