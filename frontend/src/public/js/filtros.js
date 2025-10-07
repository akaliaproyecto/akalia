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

/* Búsqueda por nombre desde el input del navbar*/
function inicializarBusquedaNavbar() {
    // Buscar el input por su atributo name="search" dentro del documento
    const inputBusqueda = document.querySelector('input[name="search"]');

    // Función que redirige a la ruta de búsqueda con el término
    function mostrarProductosPorBusqueda(termino) {
        if (!termino) return; // si término vacío no redirigimos
        // Escapar el término para usarlo en la URL (simple)
        const terminoSeguro = encodeURIComponent(termino.trim());
        // Redirigimos a la ruta que renderiza productos-filtros.ejs
        window.location.href = '/productos/buscar/' + terminoSeguro;
    }

    // Escuchar la tecla Enter en el input para disparar la búsqueda
    inputBusqueda.addEventListener('keydown', function (ev) {
        if (!ev) return;
        if (ev.key === 'Enter') {
            ev.preventDefault();
            const termino = inputBusqueda.value || '';
            mostrarProductosPorBusqueda(termino);
        }
    });
}
inicializarBusquedaNavbar()

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
    if (window.ubicacionesService && typeof window.ubicacionesService.obtenerDepartamentos === 'function') {
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
});

