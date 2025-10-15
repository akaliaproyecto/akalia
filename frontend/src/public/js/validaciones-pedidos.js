/* Validaciones de formularios - Pedidos */



// ===============================
// FUNCIONES UTILITARIAS COMUNES
// ===============================

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
// FUNCIONES DE VALIDACIÓN ASYNC
// ===============================

/**
 * Verificar si el usuario ya tiene un pedido en curso para el mismo producto
 */
async function verificarPedidoExistente(idProducto, idUsuarioComprador) {
    try {
        console.log('Validando pedido existente')
        const response = await fetch(`/pedidos/verificar-activo/${idUsuarioComprador}/${idProducto}`);
        console.log(response)
        if (!response.ok) {
            console.error('Error al verificar pedidos existentes');
            return false;
        }

        const data = await response.json();
        return data.tienePedidoActivo;
    } catch (error) {
        console.error('Error al verificar pedidos existentes:', error);
        return false;
    }
}

// ===============================
// FUNCIONES DE VALIDACIÓN INDIVIDUAL
// ===============================

/**
 * Validar que el usuario tenga una dirección seleccionada
 */
function validarDireccion() {
    const selectDireccion = document.getElementById('direccionEnvio');
    const errorDireccion = document.getElementById('direccionError');

    if (!selectDireccion) {
        if (typeof mostrarToast !== 'undefined') {
            mostrarToast('No tienes direcciones registradas. Debes agregar una dirección desde tu perfil.', 'error');
        }
        return false;
    }

    // Verificar que no esté vacío
    if (!selectDireccion.value || selectDireccion.value.trim() === '') {
        mostrarError(selectDireccion, errorDireccion, 'Debes seleccionar una dirección de envío');
        if (typeof mostrarToast !== 'undefined') {
            mostrarToast('Debes seleccionar una dirección de envío', 'error');
        }
        return false;
    }

    // Verificar que el valor seleccionado sea un JSON válido de dirección
    try {
        const direccionData = JSON.parse(selectDireccion.value);

        // Validar que tenga las propiedades requeridas de una dirección
        if (!direccionData.direccion || !direccionData.ciudad || !direccionData.departamento) {
            mostrarError(selectDireccion, errorDireccion, 'La dirección seleccionada no es válida');
            if (typeof mostrarToast !== 'undefined') {
                mostrarToast('La dirección seleccionada no contiene todos los datos requeridos', 'error');
            }
            return false;
        }

        // Validar que las propiedades no estén vacías
        if (!direccionData.direccion.trim() || !direccionData.ciudad.trim() || !direccionData.departamento.trim()) {
            mostrarError(selectDireccion, errorDireccion, 'La dirección seleccionada tiene campos vacíos');
            if (typeof mostrarToast !== 'undefined') {
                mostrarToast('La dirección seleccionada tiene campos vacíos', 'error');
            }
            return false;
        }

    } catch (error) {
        // Si no es un JSON válido, es porque se manipuló el campo
        mostrarError(selectDireccion, errorDireccion, 'Formato de dirección inválido');
        if (typeof mostrarToast !== 'undefined') {
            mostrarToast('Formato de dirección inválido - selecciona una dirección de la lista', 'error');
        }
        return false;
    }

    mostrarExito(selectDireccion, errorDireccion);
    return true;
}

/**
 * Validar que comprador y vendedor sean diferentes
 */
function validarCompradorVendedor() {
    const idUsuarioComprador = document.getElementById('idUsuarioComprador')?.value;
    const idUsuarioVendedor = document.getElementById('idUsuarioVendedor')?.value;

    if (idUsuarioComprador && idUsuarioVendedor && idUsuarioComprador === idUsuarioVendedor) {
        if (typeof mostrarToast !== 'undefined') {
            mostrarToast('No puedes crear un pedido para tu propio producto', 'error');
        }
        return false;
    }

    return true;
}

/**
 * Validar cantidad de productos
 */
function validarCantidad() {
    const campoUnidades = document.getElementById('unidades');
    const errorUnidades = document.getElementById('unidadesError');

    if (!campoUnidades) return true;

    const cantidad = parseInt(campoUnidades.value);

    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarError(campoUnidades, errorUnidades, 'La cantidad debe ser un número mayor a 0');
        return false;
    }

    if (cantidad > 999) {
        mostrarError(campoUnidades, errorUnidades, 'La cantidad máxima es 999 unidades');
        return false;
    }

    mostrarExito(campoUnidades, errorUnidades);
    return true;
}

/**
 * Validar precios
 */
function validarPrecios() {
    // En editar el campo base se llama 'precio' en lugar de 'basePrice'
    const campoBasePrice = document.getElementById('basePrice') || document.getElementById('precio');
    const campoPrecioPactado = document.getElementById('precioPactado');
    const errorPrecio = document.getElementById('precioError');

    if (!campoPrecioPactado) return true;
    
    // Si no hay campo base, solo validar que el precio pactado sea válido
    if (!campoBasePrice) {
        const precioPactado = parseFloat(campoPrecioPactado.value);
        if (isNaN(precioPactado) || precioPactado <= 0) {
            mostrarError(campoPrecioPactado, errorPrecio, 'El precio debe ser un número mayor a 0');
            return false;
        }
        mostrarExito(campoPrecioPactado, errorPrecio);
        return true;
    }

    const precioBase = parseFloat(campoBasePrice.value);
    const precioPactado = parseFloat(campoPrecioPactado.value);

    // Validar que sean números válidos
    if (isNaN(precioBase) || isNaN(precioPactado)) {
        mostrarError(campoPrecioPactado, errorPrecio, 'Los precios deben ser números válidos');
        return false;
    }

    // Validar que sean positivos
    if (precioBase < 0 || precioPactado < 0) {
        mostrarError(campoPrecioPactado, errorPrecio, 'Los precios deben ser positivos');
        return false;
    }

    // Validar que el precio pactado no sea menor al precio base
    if (precioPactado < precioBase) {
        mostrarError(campoPrecioPactado, errorPrecio, 'El precio nuevo no puede ser menor al precio base');
        return false;
    }

    mostrarExito(campoPrecioPactado, errorPrecio);
    return true;
}

/**
 * Validar detalles del pedido
 */
function validarDetalles() {
    // Buscar tanto 'orderDetails' (crear) como 'descripcion' (editar)
    const campoDetalles = document.getElementById('orderDetails') || document.getElementById('descripcion');
    const errorDetalles = document.getElementById('detallesError') || document.getElementById('descripcionError');

    if (!campoDetalles) return true;

    const detalles = campoDetalles.value.trim();

    if (!detalles || detalles.length === 0) {
        mostrarError(campoDetalles, errorDetalles, 'Los detalles del pedido son obligatorios');
        return false;
    }

    if (detalles.length < 10) {
        mostrarError(campoDetalles, errorDetalles, 'Los detalles deben tener al menos 10 caracteres');
        return false;
    }

    if (detalles.length > 500) {
        mostrarError(campoDetalles, errorDetalles, 'Los detalles no pueden exceder 500 caracteres');
        return false;
    }

    mostrarExito(campoDetalles, errorDetalles);
    return true;
}

/**
 * Validar estado del pedido
 */
function validarEstado() {
    const campoEstado = document.getElementById('estadoPedido');
    const errorEstado = document.getElementById('estadoError');

    if (!campoEstado) return true;

    const estado = campoEstado.value;
    const estadosValidos = ['pendiente', 'aceptado', 'completado', 'cancelado'];

    if (!estadosValidos.includes(estado)) {
        mostrarError(campoEstado, errorEstado, 'Estado de pedido inválido');
        return false;
    }

    mostrarExito(campoEstado, errorEstado);
    return true;
}

// ===============================
// VALIDACIÓN COMPLETA DEL FORMULARIO
// ===============================

/**
 * Validar todo el formulario de creación de pedido
 */
async function validarFormularioPedido(formularioPedido) {
    let esValido = true;

    // Validaciones síncronas
    if (!validarDireccion()) esValido = false;
    if (!validarCompradorVendedor()) esValido = false;
    if (!validarCantidad()) esValido = false;
    if (!validarPrecios()) esValido = false;
    if (!validarDetalles()) esValido = false;
    if (!validarEstado()) esValido = false;
    // Validación asíncrona - verificar pedido existente
    if (esValido && (formularioPedido !== document.getElementById('editar-pedido-form'))) {
        const idProducto = document.getElementById('idProducto')?.value;
        const idUsuarioComprador = document.getElementById('idUsuarioComprador')?.value;

        if (idProducto && idUsuarioComprador) {
            const tienePedidoEnCurso = await verificarPedidoExistente(idProducto, idUsuarioComprador);

            if (tienePedidoEnCurso) {
                if (typeof mostrarToast !== 'undefined') {
                    mostrarToast('Ya tienes un pedido en curso para este producto. No puedes crear otro hasta que el actual sea completado o cancelado.', 'error');
                } else {
                    alert('Ya tienes un pedido en curso para este producto. No puedes crear otro hasta que el actual sea completado o cancelado.');
                }
                esValido = false;
            }
        }
    }

    return esValido;
}

async function validarFormDireccion() {
    let esValido = true;

    // Validaciones síncronas
    if (!validarDireccion()) {
        console.log('Validación de dirección FALLÓ');
        esValido = false;
    }
    console.log('=== Resultado final validación dirección:', esValido, '===');
    return esValido;
}

// ===============================
// INICIALIZACIÓN Y EVENT LISTENERS
// ===============================

// Buscar el formulario de crear pedido
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando sistema de validaciones de pedidos...');

    const formularioPedido = document.getElementById('form-crear-pedido') || document.getElementById('editar-pedido-form');

    if (formularioPedido) {

        // Crear elementos de error si no existen
        const crearElementoError = (inputId, errorId) => {
            const input = document.getElementById(inputId);
            if (input && !document.getElementById(errorId)) {
                const errorDiv = document.createElement('div');
                errorDiv.id = errorId;
                errorDiv.className = 'invalid-feedback';
                errorDiv.style.display = 'none';
                input.parentNode.appendChild(errorDiv);
            }
        };

        // Crear elementos de error para todos los campos
        crearElementoError('direccionEnvio', 'direccionError');
        crearElementoError('unidades', 'unidadesError');
        crearElementoError('precioPactado', 'precioError');
        crearElementoError('orderDetails', 'detallesError'); // Para formulario de creación
        crearElementoError('descripcion', 'descripcionError'); // Para formulario de edición
        crearElementoError('estadoPedido', 'estadoError');

        // Validaciones en tiempo real
        const campoUnidades = document.getElementById('unidades');
        if (campoUnidades) {
            campoUnidades.addEventListener('blur', validarCantidad);
            campoUnidades.addEventListener('input', function () {
                validarCantidad();
                // Recalcular total si existe la función
                if (typeof calcularTotal === 'function') {
                    calcularTotal();
                }
            });
        }

        const campoPrecioPactado = document.getElementById('precioPactado');
        if (campoPrecioPactado) {
            campoPrecioPactado.addEventListener('blur', validarPrecios);
            campoPrecioPactado.addEventListener('input', function () {
                validarPrecios();
                // Recalcular total si existe la función
                if (typeof calcularTotal === 'function') {
                    calcularTotal();
                }
            });
        }

        const campoDetalles = document.getElementById('orderDetails') || document.getElementById('descripcion');
        if (campoDetalles) {
            campoDetalles.addEventListener('blur', validarDetalles);
            campoDetalles.addEventListener('input', function () {
                // Actualizar contador de caracteres si existe
                const contador = document.getElementById('contadorCaracteres');
                if (contador) {
                    contador.textContent = `${campoDetalles.value.length}/500`;
                }
            });
        }

        const selectDireccionValidacion = document.getElementById('direccionEnvio');
        if (selectDireccionValidacion) {
            selectDireccionValidacion.addEventListener('change', validarDireccion);
        }

        // Validación al enviar el formulario
        formularioPedido.addEventListener('submit', async function (e) {
            e.preventDefault();

            console.log('Validando formulario de pedido...');

            if (formularioPedido !== document.getElementById('editar-pedido-form')){

            }
            const esValido = await validarFormularioPedido(formularioPedido);

            if (esValido) {
                console.log('Formulario válido, enviando...');

                // Mostrar loading si hay botón de submit
                const botonSubmit = formularioPedido.querySelector('button[type="submit"]');
                if (botonSubmit) {
                    const textoOriginal = botonSubmit.innerHTML;
                    botonSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creando pedido...';
                    botonSubmit.disabled = true;
                }

                // Enviar formulario
                this.submit();
            } else {
                console.log('Formulario con errores, no se puede enviar');
                if (typeof mostrarToast !== 'undefined') {
                    mostrarToast('Por favor corrige los errores antes de continuar', 'error');
                }
            }
        });

        // Mostrar advertencia si no hay direcciones
        const selectDireccionAdvertencia = document.getElementById('direccionSelect') || document.getElementById('direccionEnvio');
        if (
            (!selectDireccionAdvertencia || 
                !selectDireccionAdvertencia.options || 
                selectDireccionAdvertencia.options.length === 0
            ) && 
            formularioPedido !== document.getElementById('editar-pedido-form')
        ) {
            const advertencia = document.createElement('div');
            advertencia.className = 'alert alert-warning mt-2';
            advertencia.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle me-2" viewBox="0 0 16 16">
          <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-2.008 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
          <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
        </svg>
        <strong>¡Atención!</strong> Necesitas agregar una dirección desde tu perfil antes de poder crear un pedido.
        <a href="/mi-perfil" class="alert-link">Ir a Mi Perfil</a>
      `;

            // Insertar después del elemento de dirección
            const seccionDireccion = document.querySelector('.akalia-card-info h4.akalia-label');
            if (seccionDireccion) {
                seccionDireccion.parentNode.appendChild(advertencia);
            }
        }

        console.log('Sistema de validaciones de pedidos inicializado');
    }

    const actualizarDireccion = document.getElementById('actualizar-direccion-form');
    if (actualizarDireccion) {
        console.log('aqui si estoy entrando 1')
        // Crear elementos de error si no existen
        const crearElementoError = (inputId, errorId) => {
            const input = document.getElementById(inputId);
            if (input && !document.getElementById(errorId)) {
                const errorDiv = document.createElement('div');
                errorDiv.id = errorId;
                errorDiv.className = 'invalid-feedback';
                errorDiv.style.display = 'none';
                input.parentNode.appendChild(errorDiv);
            }
        };

        // Crear elementos de error para todos los campos
        crearElementoError('direccionEnvio', 'direccionError');

        const selectDireccionValidacion = document.getElementById('direccionEnvio');
        if (selectDireccionValidacion) {
            selectDireccionValidacion.addEventListener('change', validarDireccion);
        }

        // Validación al enviar el formulario
        actualizarDireccion.addEventListener('submit', async function (e) {
            e.preventDefault();

            console.log('Validando formulario de direccion...');

            const esValido = await validarFormDireccion();

            if (esValido) {
                console.log('Formulario válido, enviando...');

                // Mostrar loading si hay botón de submit
                const botonSubmit = actualizarDireccion.querySelector('button[type="submit"]');
                if (botonSubmit) {
                    const textoOriginal = botonSubmit.innerHTML;
                    botonSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Actualizando...';
                    botonSubmit.disabled = true;
                }

                // Enviar formulario
                this.submit();
            } else {
                console.log('No se pudo actualizar');
                if (typeof mostrarToast !== 'undefined') {
                    mostrarToast('Por favor corrige los errores antes de continuar', 'error');
                }
            }
        });

        // Mostrar advertencia si no hay direcciones
        const selectDireccionAdvertencia = document.getElementById('direccionSelect') || document.getElementById('direccionEnvio');
        if (!selectDireccionAdvertencia || !selectDireccionAdvertencia.options || selectDireccionAdvertencia.options.length === 0) {
            const advertencia = document.createElement('div');
            advertencia.className = 'alert alert-warning mt-2';
            advertencia.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle me-2" viewBox="0 0 16 16">
          <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-2.008 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
          <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
        </svg>
        <strong>¡Atención!</strong> Necesitas agregar una dirección desde tu perfil antes de poder crear un pedido.
        <a href="/mi-perfil" class="alert-link">Ir a Mi Perfil</a>
      `;

            // Insertar después del elemento de dirección
            const seccionDireccion = document.querySelector('.akalia-card-info h4.akalia-label');
            if (seccionDireccion) {
                seccionDireccion.parentNode.appendChild(advertencia);
            }
        }

        console.log('Sistema de validaciones de direcciones inicializado');
    }
});

// ===============================
// FUNCIONES GLOBALES DISPONIBLES
// ===============================

// Función global para recalcular y validar precios
window.validarPreciosPedido = function () {
    const campoBasePrice = document.getElementById('basePrice');
    const campoPrecioPactado = document.getElementById('precioPactado');

    if (campoBasePrice && campoPrecioPactado) {
        const precioBase = parseFloat(campoBasePrice.value);
        const precioPactado = parseFloat(campoPrecioPactado.value);

        if (!isNaN(precioBase) && !isNaN(precioPactado) && precioPactado < precioBase) {
            campoPrecioPactado.value = precioBase;
            if (typeof mostrarToast !== 'undefined') {
                mostrarToast('El precio se ajustó al precio base mínimo', 'warning');
            }
        }
    }
};
