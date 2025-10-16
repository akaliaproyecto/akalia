/**
 * @file filtros.js
 * @description Lógica de filtros y redirecciones desde el partial de productos.
 * - Contiene helpers para redirigir por categoría y construir la URL con filtros.
 * - Diseñado para un estudiante: claro y con funciones sencillas.
 */

/**
 * Inicializa la función que permite redirigir al usuario cuando puls
 * una categoría en el navbar.
 * - Expone `window.mostrarProductosPorCategoria` para que los enlaces funcionen.
 */
/* Redirigir a la categoría seleccionada en el navbar */
function redirigirCategoria() {
    // Si ya existe, no hacemos nada
    if (window && window.mostrarProductosPorCategoria) return;

    /**
     * Redirige al frontend a la página que muestra productos de una categoría.
     * - Se expone en `window` para ser llamado desde atributos `onclick` en el navbar.
     * @param {string|number} idCategoria - Id de la categoría a mostrar
     */
    // Función simple que redirige a la ruta frontend que muestra productos por categoría
    function mostrarProductosPorCategoria(idCategoria) {
        try {
            if (!idCategoria) return;
            // Redirige al servidor frontend, que renderiza la vista filtrada (SSR)
            window.location.href = '/productos/categoria/' + idCategoria;
        } catch (err) {
            console.error('Error en mostrarProductosPorCategoria (navbar fallback):', err);
        }
    }

    // Exponer en window para que los onclick de los links funcionen
    window.mostrarProductosPorCategoria = mostrarProductosPorCategoria;
};
redirigirCategoria();

/**
 * Inicializa la lógica de filtros del partial `filtro-productos.ejs`.
 * - Lee inputs de orden y rango de precio, ubicación y construye querystring.
 * - Redirige a la ruta correcta según la página actual (categoría, búsqueda o lista general).
 */
/* Lógica de filtros en el partial filtro-productos.ejs */
function inicializarFiltrosCliente() {
    const btnAplicar = document.getElementById('btnAplicarFiltros');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    if (!btnAplicar) return; // no existe el partial en esta página

    // Al aplicar: si estamos en una página de categoria o búsqueda, redirigimos a la misma ruta y agregamos los filtros en querystring, para que el servidor aplique los filtros sobre el subconjunto actual.
    /**
     * Handler para el botón "Aplicar filtros".
     * - Construye la query con los filtros seleccionados y redirige a la URL resultante.
     */
    btnAplicar.addEventListener('click', function () {
        // Construimos params desde los inputs actuales (incluye ubicación)
        const params = new URLSearchParams();
        const ordenar = document.getElementById('ordenPrecio')?.value || '';
        const min = document.getElementById('precioMin')?.value || '';
        const max = document.getElementById('precioMax')?.value || '';
        const depto = document.getElementById('ubicacionDepartamento')?.value || '';
        const ciudad = document.getElementById('ubicacionCiudad')?.value || '';
        if (ordenar) params.set('ordenar', ordenar);
        if (min) params.set('min', min);
        if (max) params.set('max', max);
        if (depto) params.set('ubicacionEmprendimiento.departamento', depto);
        if (ciudad) params.set('ubicacionEmprendimiento.ciudad', ciudad);

        // Ruta actual
        const pathname = window.location.pathname || '';
        const currentSearch = new URLSearchParams(window.location.search || '');
        let destino = '';

        // Si estamos en /productos/categoria/:id mantenemos esa ruta y agregamos filtros
        if (/^\/productos\/categoria\//.test(pathname)) {
            destino = pathname + (params.toString() ? `?${params.toString()}` : '');
        }
        // Si estamos en /productos/buscar/:termino mantenemos esa ruta (el término está en la ruta)
        else if (/^\/productos\/buscar\//.test(pathname)) {
            destino = pathname + (params.toString() ? `?${params.toString()}` : '');
        }
        // Si estamos en /buscar (ruta actual que usa q en querystring) preservamos q
        else if (/^\/buscar/.test(pathname)) {
            const q = currentSearch.get('q');
            if (q) params.set('q', q);
            destino = pathname + (params.toString() ? `?${params.toString()}` : '');
        }
        // Si no estamos en una ruta específica, usamos el endpoint general de filtrar
        else {
            const base = '/productos/filtrar';
            destino = params.toString() ? `${base}?${params.toString()}` : base;
        }

        // Redirigir a la URL resultante
        window.location.href = destino;
    });

    // Limpiar: volver a productos sin query
    /**
     * Handler para el botón "Limpiar filtros".
     * - Resetea el formulario y redirige a la ruta adecuada (categoría o lista general).
     */
    btnLimpiar.addEventListener('click', function () {
        // limpiar inputs del formulario
        const form = document.getElementById('filtroForm');
        if (form) form.reset();
        // Si estamos en una página de categoría (/productos/categoria/:id) recargar esa misma página sin querystring (mantener contexto de categoría)
        const pathname = window.location.pathname || '';
        if (/^\/productos\/categoria\//.test(pathname)) {
            // redirigir a la misma ruta (sin query)
            window.location.href = pathname;
            return;
        }

        // En otros casos, volver a la lista principal
        window.location.href = '/productos';
    });
}

/* Inicializar filtros en el cliente */
/**
 * Inicializa la UI de filtros cuando el DOM está cargado.
 */
document.addEventListener('DOMContentLoaded', inicializarFiltrosCliente);

/* Cargar departamentos en el select de filtro de ubicación */
/**
 * Carga los selects de departamento y ciudad para el filtro de ubicación.
 * - Intenta usar un helper global `inicializarSelectorUbicaciones` si existe.
 * - Si no, usa `ubicacionesService` como fallback para llenar departamentos.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar selects de departamento y ciudad usando el servicio global
    // IDs esperados en el partial: 'ubicacionDepartamento' y 'ubicacionCiudad'
    try {
        if (typeof window.inicializarSelectorUbicaciones === 'function') {
            // Intentar leer valores iniciales desde el atributo data-filtros del formulario
            let valoresIniciales = {};
            try {
                const form = document.getElementById('filtroForm');
                if (form) {
                    const datos = form.getAttribute('data-filtros');
                    if (datos) {
                        const parsed = JSON.parse(datos);
                        valoresIniciales.departamento = parsed['ubicacionEmprendimiento.departamento'] || '';
                        valoresIniciales.municipio = parsed['ubicacionEmprendimiento.ciudad'] || '';
                    }
                }
            } catch (e) {
                console.warn('No se pudieron leer filtros iniciales:', e);
                valoresIniciales = {};
            }
            // Llamar al helper con valores (puede estar vacío)
            window.inicializarSelectorUbicaciones('ubicacionDepartamento', 'ubicacionCiudad', valoresIniciales);
        } else if (window.ubicacionesService && typeof window.ubicacionesService.obtenerDepartamentos === 'function') {
            // Fallback: solo llenar departamentos si el helper no existe
            window.ubicacionesService.obtenerDepartamentos()
                .then(departamentos => {
                    const selectDepto = document.getElementById('ubicacionDepartamento');
                    if (selectDepto) {
                        window.ubicacionesService.llenarSelect(selectDepto, departamentos, null, null, 'Seleccionar departamento...');
                    } else {
                        console.warn('Select de departamento no encontrado en la página');
                    }
                })
                .catch(err => console.error('Error cargando departamentos:', err));
        } else {
            console.warn('ubicacionesService no disponible. Asegúrate de que /js/ubicaciones.service.js se cargue.');
        }
    } catch (err) {
        console.error('Error inicializando selects de ubicaciones:', err);
    }
});