/* Redirigir a la categoría seleccionada en el navbar */
function redirigirCategoria() {
    // Si ya existe, no hacemos nada
    if (window && window.mostrarProductosPorCategoria) return;

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

/* Lógica de filtros en el partial filtro-productos.ejs */
function inicializarFiltrosCliente() {
    const btnAplicar = document.getElementById('btnAplicarFiltros');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    if (!btnAplicar) return; // no existe el partial en esta página

    // Al aplicar: si estamos en una página de categoria o búsqueda, redirigimos a la misma ruta y agregamos los filtros en querystring, para que el servidor aplique los filtros sobre el subconjunto actual.
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
document.addEventListener('DOMContentLoaded', inicializarFiltrosCliente);

/* Lógica de filtros en el partial filtro-productos.ejs */
// Construye query string a partir de los campos del partial y redirige
function construirQueryFiltros() {
    const ordenar = document.getElementById('ordenPrecio')?.value || '';
    const min = document.getElementById('precioMin')?.value || '';
    const max = document.getElementById('precioMax')?.value || '';
    const params = new URLSearchParams();
    if (ordenar) params.set('ordenar', ordenar);
    if (min) params.set('min', min);
    if (max) params.set('max', max);
    return params.toString();
}

function inicializarFiltrosCliente() {
    const btnAplicar = document.getElementById('btnAplicarFiltros');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    if (!btnAplicar) return; // no existe el partial en esta página

    // Al aplicar: si estamos en una página de categoria o búsqueda, redirigimos
    // a la misma ruta y agregamos los filtros en querystring, para que el
    // servidor aplique los filtros sobre el subconjunto actual.
    btnAplicar.addEventListener('click', function () {
        const qs = construirQueryFiltros();
        // Ruta actual
        const pathname = window.location.pathname || '';
        let destino = '';

        // Si estamos en /productos/categoria/:id mantenemos esa ruta
        if (/^\/productos\/categoria\//.test(pathname)) {
            destino = pathname + (qs ? `?${qs}` : '');
        }
        // Si estamos en /productos/buscar/:termino mantenemos esa ruta
        else if (/^\/productos\/buscar\//.test(pathname)) {
            destino = pathname + (qs ? `?${qs}` : '');
        }
        // Si no estamos en una ruta específica, usamos el endpoint general de filtrar
        else {
            const base = '/productos/filtrar';
            destino = qs ? `${base}?${qs}` : base;
        }

        window.location.href = destino;
    });

    // Limpiar: volver a productos sin query
    btnLimpiar.addEventListener('click', function () {
        // limpiar inputs del formulario
        const form = document.getElementById('filtroForm');
        if (form) form.reset();
        // volver a la lista principal
        window.location.href = '/productos';
    });
}

document.addEventListener('DOMContentLoaded', inicializarFiltrosCliente);

/* Lógica de filtros en el partial filtro-productos.ejs */
// Construye query string a partir de los campos del partial y redirige
function construirQueryFiltros() {
    const ordenar = document.getElementById('ordenPrecio')?.value || '';
    const min = document.getElementById('precioMin')?.value || '';
    const max = document.getElementById('precioMax')?.value || '';
    const params = new URLSearchParams();
    if (ordenar) params.set('ordenar', ordenar);
    if (min) params.set('min', min);
    if (max) params.set('max', max);
    return params.toString();
}

function inicializarFiltrosCliente() {
    const btnAplicar = document.getElementById('btnAplicarFiltros');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    if (!btnAplicar) return; // no existe el partial en esta página

    // Al aplicar: si estamos en una página de categoria o búsqueda, redirigimos
    // a la misma ruta y agregamos los filtros en querystring, para que el
    // servidor aplique los filtros sobre el subconjunto actual.
    btnAplicar.addEventListener('click', function () {
        const qs = construirQueryFiltros();
        // Ruta actual
        const pathname = window.location.pathname || '';
        let destino = '';

        // Si estamos en /productos/categoria/:id mantenemos esa ruta
        if (/^\/productos\/categoria\//.test(pathname)) {
            destino = pathname + (qs ? `?${qs}` : '');
        }
        // Si estamos en /productos/buscar/:termino mantenemos esa ruta
        else if (/^\/productos\/buscar\//.test(pathname)) {
            destino = pathname + (qs ? `?${qs}` : '');
        }
        // Si no estamos en una ruta específica, usamos el endpoint general de filtrar
        else {
            const base = '/productos/filtrar';
            destino = qs ? `${base}?${qs}` : base;
        }

        window.location.href = destino;
    });

    // Limpiar: volver a productos sin query
    btnLimpiar.addEventListener('click', function () {
        // limpiar inputs del formulario
        const form = document.getElementById('filtroForm');
        if (form) form.reset();
        // volver a la lista principal
        window.location.href = '/productos';
    });
}

document.addEventListener('DOMContentLoaded', inicializarFiltrosCliente);

/* Cargar departamentos en el select de filtro de ubicación */
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
