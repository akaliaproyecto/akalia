/**
 * Servicio para manejar ubicaciones (departamentos y municipios)
 * Maneja las llamadas a la API para obtener los datos geográficos
 */

/**
 * Servicio para manejar ubicaciones (departamentos y municipios)
 * - Carga datos desde el backend y ayuda a popular selects en formularios
 */
class UbicacionesService {
  /**
   * Crear una nueva instancia del servicio
   */
  constructor() {
    this.municipiosData = null;
    this.API_BASE_URL = window.API_BASE_URL;
}
/**
 * Obtiene todos los datos de municipios por departamento
 * @returns {Promise<Object>} Objeto con departamentos y sus municipios
*/
async obtenerMunicipios() {
    try {
        if (this.municipiosData) {
            return this.municipiosData;
        }
        
        const response = await fetch(`${this.API_BASE_URL}/api/municipios`);
        console.log('aqui estoy imp api base', this.API_BASE_URL)
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      this.municipiosData = await response.json();
      return this.municipiosData;
    } catch (error) {
      console.error('Error al obtener municipios:', error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de departamentos
   * @returns {Promise<Array>} Array de nombres de departamentos ordenados alfabéticamente
   */
  /**
   * Obtener lista de departamentos disponibles
   * @returns {Promise<string[]>} Array de nombres de departamentos
   */
  async obtenerDepartamentos() {
    try {
      const municipiosData = await this.obtenerMunicipios();
      return Object.keys(municipiosData).sort();
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
      return [];
    }
  }

  /**
   * Obtiene los municipios de un departamento específico
   * @param {string} departamento - Nombre del departamento
   * @returns {Promise<Array>} Array de municipios ordenados por nombre
   */
  /**
   * Obtener municipios de un departamento
   * @param {string} departamento - Nombre del departamento
   * @returns {Promise<Array>} Lista de municipios
   */
  async obtenerMunicipiosPorDepartamento(departamento) {
    try {
      const municipiosData = await this.obtenerMunicipios();
      
      if (!municipiosData[departamento]) {
        console.warn(`Departamento '${departamento}' no encontrado`);
        return [];
      }

      return municipiosData[departamento].sort((a, b) => a.nombre.localeCompare(b.nombre));
    } catch (error) {
      console.error(`Error al obtener municipios para ${departamento}:`, error);
      return [];
    }
  }

  /**
   * Llena un select con opciones
   * @param {HTMLSelectElement} selectElement - Elemento select a llenar
   * @param {Array} opciones - Array de opciones
   * @param {string} valorTexto - Propiedad para el texto (por defecto el mismo valor)
   * @param {string} valorValue - Propiedad para el value (por defecto el mismo valor)
   * @param {string} placeholder - Texto del placeholder
   */
  /**
   * Llenar un elemento <select> con opciones
   * @param {HTMLSelectElement} selectElement
   * @param {Array} opciones
   * @param {string|null} valorTexto
   * @param {string|null} valorValue
   * @param {string} placeholder
   */
  llenarSelect(selectElement, opciones, valorTexto = null, valorValue = null, placeholder = 'Seleccionar...') {
    if (!selectElement) {
      console.error('Elemento select no encontrado');
      return;
    }

    // Limpiar opciones existentes
    selectElement.innerHTML = '';

    // Agregar opción placeholder
    const optionPlaceholder = document.createElement('option');
    optionPlaceholder.value = '';
    optionPlaceholder.textContent = placeholder;
    optionPlaceholder.disabled = true;
    optionPlaceholder.selected = true;
    selectElement.appendChild(optionPlaceholder);

    // Agregar opciones
    opciones.forEach(opcion => {
      const optionElement = document.createElement('option');
      
      if (typeof opcion === 'string') {
        optionElement.value = opcion;
        optionElement.textContent = opcion;
      } else {
        optionElement.value = valorValue ? opcion[valorValue] : opcion.nombre;
        optionElement.textContent = valorTexto ? opcion[valorTexto] : opcion.nombre;
      }
      
      selectElement.appendChild(optionElement);
    });
  }

  /**
   * Inicializa los selects de departamento y municipio
   * @param {string} selectDepartamentoId - ID del select de departamentos
   * @param {string} selectMunicipioId - ID del select de municipios
   * @param {Object} valoresIniciales - Valores iniciales para preseleccionar
   */
  /**
   * Inicializar selects de departamento y municipio en la interfaz
   * @param {string} selectDepartamentoId - id del select de departamentos
   * @param {string} selectMunicipioId - id del select de municipios
   * @param {Object} valoresIniciales - { departamento, municipio }
   */
  async inicializarSelects(selectDepartamentoId, selectMunicipioId, valoresIniciales = {}) {
    try {
      const selectDepartamento = document.getElementById(selectDepartamentoId);
      const selectMunicipio = document.getElementById(selectMunicipioId);

      if (!selectDepartamento || !selectMunicipio) {
        console.error('Selects no encontrados:', { selectDepartamentoId, selectMunicipioId });
        return;
      }

      // Cargar departamentos
      const departamentos = await this.obtenerDepartamentos();
      this.llenarSelect(selectDepartamento, departamentos, null, null, 'Selecionar departamento...');

      // Configurar evento de cambio para departamento
      selectDepartamento.addEventListener('change', async (event) => {
        const departamentoSeleccionado = event.target.value;
        
        if (departamentoSeleccionado) {
          const municipios = await this.obtenerMunicipiosPorDepartamento(departamentoSeleccionado);
          this.llenarSelect(selectMunicipio, municipios, 'nombre', 'nombre', 'Seleccionar municipio...');
          selectMunicipio.disabled = false;
        } else {
          selectMunicipio.innerHTML = '<option value="" disabled selected>Primero selecciona un departamento</option>';
          selectMunicipio.disabled = true;
        }
      });

      // Preseleccionar valores si se proporcionan
      if (valoresIniciales.departamento) {
        selectDepartamento.value = valoresIniciales.departamento;
        
        // Cargar municipios del departamento preseleccionado
        const municipios = await this.obtenerMunicipiosPorDepartamento(valoresIniciales.departamento);
        this.llenarSelect(selectMunicipio, municipios, 'nombre', 'nombre', 'Seleccionar municipio...');
        selectMunicipio.disabled = false;
        
        // Preseleccionar municipio si se proporciona
        if (valoresIniciales.municipio) {
          selectMunicipio.value = valoresIniciales.municipio;
        }
      } else {
        // Deshabilitar select de municipios inicialmente
        selectMunicipio.innerHTML = '<option value="" disabled selected>Primero selecciona un departamento</option>';
        selectMunicipio.disabled = true;
      }

    } catch (error) {
      console.error('Error al inicializar selects:', error);
    }
  }
}

// Crear instancia global del servicio
window.ubicacionesService = new UbicacionesService();

// Función global para facilitar la inicialización
window.inicializarSelectorUbicaciones = function(selectDepartamentoId, selectMunicipioId, valoresIniciales = {}) {
  return window.ubicacionesService.inicializarSelects(selectDepartamentoId, selectMunicipioId, valoresIniciales);
};
