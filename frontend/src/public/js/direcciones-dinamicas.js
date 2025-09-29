/* Manejo dinámico de direcciones de usuario */

let contadorDirecciones = 0;
let direccionesArray = [];

// Función para crear una nueva fila de dirección
function crearFilaDireccion(index, direccionData = {}) {
  const direccionId = `direccion_${index}`;
  
  return `
    <div class="direccion-item border rounded p-3 mb-3" data-index="${index}" id="direccionItem_${index}">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="mb-0 text-terracota">
          <i class="fas fa-map-marker-alt me-2"></i>
          Dirección ${index + 1}
        </h6>
        <button type="button" class="btn btn-outline-danger btn-sm" onclick="eliminarDireccion(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      
      <!-- Campo de dirección -->
      <div class="row mb-2">
        <div class="col-12">
          <label for="${direccionId}_direccion" class="form-label">Dirección</label>
          <input type="text" 
                 class="form-control direccion-input" 
                 id="${direccionId}_direccion" 
                 name="direcciones[${index}][direccion]"
                 placeholder="Ej: Calle 123 #45-67" 
                 value="${direccionData.direccion || ''}">
          <div id="${direccionId}_direccionError" class="invalid-feedback"></div>
        </div>
      </div>
      
      <!-- Departamento y Ciudad -->
      <div class="row">
        <div class="col-md-6 mb-2">
          <label for="${direccionId}_departamento" class="form-label">Departamento</label>
          <select class="form-select departamento-select" 
                  id="${direccionId}_departamento" 
                  name="direcciones[${index}][departamento]"
                  data-index="${index}">
            <option value="">Selecciona un departamento</option>
          </select>
          <div id="${direccionId}_departamentoError" class="invalid-feedback"></div>
        </div>
        <div class="col-md-6 mb-2">
          <label for="${direccionId}_ciudad" class="form-label">Ciudad</label>
          <select class="form-select ciudad-select" 
                  id="${direccionId}_ciudad" 
                  name="direcciones[${index}][ciudad]"
                  data-index="${index}">
            <option value="">Primero selecciona un departamento</option>
          </select>
          <div id="${direccionId}_ciudadError" class="invalid-feedback"></div>
        </div>
      </div>
    </div>
  `;
}

// Función para agregar una nueva dirección
function agregarDireccion(direccionData = {}) {
  const contenedor = document.getElementById('contenedorDirecciones');
  const mensajeSin = document.getElementById('mensajeSinDirecciones');
  
  if (!contenedor) {
    console.error('Contenedor de direcciones no encontrado');
    return;
  }
  
  // Ocultar mensaje "sin direcciones"
  if (mensajeSin) {
    mensajeSin.style.display = 'none';
  }
  
  // Crear nueva fila de dirección
  const nuevaDireccion = document.createElement('div');
  nuevaDireccion.innerHTML = crearFilaDireccion(contadorDirecciones, direccionData);
  contenedor.appendChild(nuevaDireccion.firstElementChild);
  
  // Inicializar selectores de ubicación para esta nueva dirección
  inicializarSelectoresParaDireccion(contadorDirecciones, direccionData);
  
  // Incrementar contador
  contadorDirecciones++;
  
  // Actualizar array de direcciones
  direccionesArray.push(direccionData);
  
  console.log('Dirección agregada:', contadorDirecciones - 1, direccionData);
}

// Función para eliminar una dirección
function eliminarDireccion(index) {
  const direccionItem = document.getElementById(`direccionItem_${index}`);
  if (direccionItem) {
    direccionItem.remove();
    
    // Remover del array
    direccionesArray = direccionesArray.filter((_, i) => i !== index);
    
    // Mostrar mensaje si no quedan direcciones
    const contenedor = document.getElementById('contenedorDirecciones');
    const mensajeSin = document.getElementById('mensajeSinDirecciones');
    
    if (contenedor && contenedor.children.length === 0 && mensajeSin) {
      mensajeSin.style.display = 'block';
    }
    
    console.log('Dirección eliminada:', index);
  }
}

// Función para inicializar los selectores de ubicación para una dirección específica
function inicializarSelectoresParaDireccion(index, direccionData = {}) {
  const direccionId = `direccion_${index}`;
  const selectDepartamento = document.getElementById(`${direccionId}_departamento`);
  const selectCiudad = document.getElementById(`${direccionId}_ciudad`);
  const inputDireccion = document.getElementById(`${direccionId}_direccion`);
  
  if (!selectDepartamento || !selectCiudad || !inputDireccion) {
    console.error('Elementos no encontrados para dirección:', index);
    return;
  }
  
  // Usar el servicio de ubicaciones
  if (window.ubicacionesService) {
    // Cargar departamentos
    window.ubicacionesService.obtenerDepartamentos()
      .then(departamentos => {
        window.ubicacionesService.llenarSelect(selectDepartamento, departamentos, null, null, 'Selecciona un departamento');
        
        // Si hay datos iniciales, seleccionar departamento
        if (direccionData.departamento) {
          selectDepartamento.value = direccionData.departamento;
          
          // Cargar ciudades del departamento seleccionado
          window.ubicacionesService.obtenerMunicipiosPorDepartamento(direccionData.departamento)
            .then(ciudades => {
              window.ubicacionesService.llenarSelect(selectCiudad, ciudades, 'nombre', 'nombre', 'Selecciona una ciudad');
              
              // Seleccionar ciudad si existe
              if (direccionData.ciudad) {
                selectCiudad.value = direccionData.ciudad;
              }
            });
        }
      })
      .catch(error => {
        console.error('Error cargando departamentos:', error);
      });
  }
  
  // Event listener para cambio de departamento
  selectDepartamento.addEventListener('change', function() {
    const departamentoSeleccionado = this.value;
    
    // Limpiar select de ciudades
    selectCiudad.innerHTML = '<option value="">Selecciona una ciudad</option>';
    selectCiudad.value = '';
    
    // Validar departamento cuando cambie
    validarCampoDireccion(this);
    
    if (departamentoSeleccionado && window.ubicacionesService) {
      window.ubicacionesService.obtenerMunicipiosPorDepartamento(departamentoSeleccionado)
        .then(ciudades => {
          window.ubicacionesService.llenarSelect(selectCiudad, ciudades, 'nombre', 'nombre', 'Selecciona una ciudad');
        })
        .catch(error => {
          console.error('Error cargando ciudades:', error);
          selectCiudad.innerHTML = '<option value="">Error cargando ciudades</option>';
        });
    } else {
      selectCiudad.innerHTML = '<option value="">Primero selecciona un departamento</option>';
    }
  });
  
  // Event listeners para validación en tiempo real
  inputDireccion.addEventListener('blur', function() {
    validarCampoDireccion(this);
  });
  
  selectCiudad.addEventListener('change', function() {
    validarCampoDireccion(this);
  });
}

// Función para inicializar el sistema de direcciones dinámicas
function inicializarDireccionesDinamicas(direccionesExistentes = []) {
  console.log('Inicializando direcciones dinámicas con:', direccionesExistentes);
  
  // Resetear contador y array
  contadorDirecciones = 0;
  direccionesArray = [];
  
  // Limpiar contenedor
  const contenedor = document.getElementById('contenedorDirecciones');
  if (contenedor) {
    contenedor.innerHTML = '';
  }
  
  // Event listener para botón agregar
  const btnAgregar = document.getElementById('btnAgregarDireccion');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => agregarDireccion());
  }
  
  // Cargar direcciones existentes
  if (direccionesExistentes && direccionesExistentes.length > 0) {
    direccionesExistentes.forEach(direccion => {
      agregarDireccion(direccion);
    });
  } else {
    // Mostrar mensaje "sin direcciones"
    const mensajeSin = document.getElementById('mensajeSinDirecciones');
    if (mensajeSin) {
      mensajeSin.style.display = 'block';
    }
  }
}

// Función para obtener todas las direcciones del formulario
function obtenerDireccionesDelFormulario() {
  const direcciones = [];
  const contenedor = document.getElementById('contenedorDirecciones');
  
  if (!contenedor) return direcciones;
  
  const direccionItems = contenedor.querySelectorAll('.direccion-item');
  
  direccionItems.forEach((item, index) => {
    const direccionInput = item.querySelector('.direccion-input');
    const departamentoSelect = item.querySelector('.departamento-select');
    const ciudadSelect = item.querySelector('.ciudad-select');
    
    if (direccionInput && departamentoSelect && ciudadSelect) {
      const direccion = direccionInput.value.trim();
      const departamento = departamentoSelect.value;
      const ciudad = ciudadSelect.value;
      
      // Solo agregar si al menos la dirección tiene contenido
      if (direccion) {
        direcciones.push({
          direccion,
          departamento,
          ciudad
        });
      }
    }
  });
  
  return direcciones;
}

// Función para validar todas las direcciones
function validarTodasLasDirecciones() {
  let todasValidas = true;
  const contenedor = document.getElementById('contenedorDirecciones');
  
  if (!contenedor) return true;
  
  const direccionItems = contenedor.querySelectorAll('.direccion-item');
  
  direccionItems.forEach((item, index) => {
    const direccionInput = item.querySelector('.direccion-input');
    const departamentoSelect = item.querySelector('.departamento-select');
    const ciudadSelect = item.querySelector('.ciudad-select');
    
    if (direccionInput && departamentoSelect && ciudadSelect) {
      // Validar cada campo individualmente
      const direccionValida = validarCampoDireccion(direccionInput);
      const departamentoValido = validarCampoDireccion(departamentoSelect);
      const ciudadValida = validarCampoDireccion(ciudadSelect);
      
      if (!direccionValida || !departamentoValido || !ciudadValida) {
        todasValidas = false;
      }
    }
  });
  
  return todasValidas;
}

// Función para validar un campo individual de dirección
function validarCampoDireccion(campo) {
  if (!campo) return true;
  
  const valor = campo.value.trim();
  const tipoCampo = campo.classList.contains('direccion-input') ? 'direccion' : 
                   campo.classList.contains('departamento-select') ? 'departamento' : 'ciudad';
  
  // Obtener el item de dirección padre
  const direccionItem = campo.closest('.direccion-item');
  if (!direccionItem) return true;
  
  const inputDireccion = direccionItem.querySelector('.direccion-input');
  const selectDepartamento = direccionItem.querySelector('.departamento-select');
  const selectCiudad = direccionItem.querySelector('.ciudad-select');
  
  const direccionTexto = inputDireccion?.value.trim() || '';
  const departamentoVal = selectDepartamento?.value.trim() || '';
  const ciudadVal = selectCiudad?.value.trim() || '';
  
  // Si no hay dirección escrita, todos los campos son opcionales
  if (!direccionTexto && tipoCampo !== 'direccion') {
    limpiarErrorDireccion(campo);
    return true;
  }
  
  // Validar según el tipo de campo
  switch (tipoCampo) {
    case 'direccion':
      if (valor && valor.length < 10) {
        mostrarErrorDireccion(campo, 'La dirección debe tener al menos 10 caracteres');
        return false;
      }
      if (valor && valor.length > 100) {
        mostrarErrorDireccion(campo, 'La dirección no puede exceder 100 caracteres');
        return false;
      }
      break;
      
    case 'departamento':
      if (direccionTexto && !valor) {
        mostrarErrorDireccion(campo, 'El departamento es requerido cuando se especifica una dirección');
        return false;
      }
      // Validar que el departamento sea una opción válida
      if (valor && !validarOpcionValida(campo, valor)) {
        mostrarErrorDireccion(campo, 'Debe seleccionar un departamento válido de la lista');
        return false;
      }
      break;
      
    case 'ciudad':
      if (direccionTexto && !departamentoVal) {
        mostrarErrorDireccion(campo, 'Primero selecciona un departamento');
        return false;
      }
      if (direccionTexto && departamentoVal && !valor) {
        mostrarErrorDireccion(campo, 'La ciudad es requerida cuando se especifica una dirección');
        return false;
      }
      // Validar que la ciudad sea una opción válida
      if (valor && !validarOpcionValida(campo, valor)) {
        mostrarErrorDireccion(campo, 'Debe seleccionar una ciudad válida de la lista');
        return false;
      }
      break;
  }
  
  limpiarErrorDireccion(campo);
  return true;
}

// Función para validar que una opción sea válida en un select
function validarOpcionValida(selectElement, valor) {
  if (!selectElement || !valor) return false;
  
  // Verificar si el valor existe como una opción válida en el select
  const opciones = Array.from(selectElement.options);
  return opciones.some(opcion => opcion.value === valor);
}

// Funciones auxiliares para mostrar/limpiar errores
function mostrarErrorDireccion(campo, mensaje) {
  if (campo) {
    campo.classList.add('is-invalid');
    campo.classList.remove('is-valid');
    
    const errorElement = campo.parentNode.querySelector('.invalid-feedback');
    if (errorElement) {
      errorElement.textContent = mensaje;
      errorElement.style.display = 'block';
    }
  }
}

function limpiarErrorDireccion(campo) {
  if (campo) {
    campo.classList.remove('is-invalid');
    campo.classList.add('is-valid');
    
    const errorElement = campo.parentNode.querySelector('.invalid-feedback');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }
}
