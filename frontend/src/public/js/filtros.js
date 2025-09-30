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

