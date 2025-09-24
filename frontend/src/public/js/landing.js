
// landing.js
// Archivo con funciones DOM simples para la landing (SSR).

/* Redirigir a la ruta que muestra la lista de productos*/
function showListProducts() {
  try {
    window.location.href = '/productos';
  } catch (err) {
    // Si falla la redirección, imprimimos un error corto
    console.error('Error al redirigir a productos:', err);
  }
}

// Redirigir a la página de detalle de producto*/
function showProductDetail(idProducto) {
  try {
    if (!idProducto) return;
    window.location.href = `/producto/${idProducto}`;
  } catch (err) {
    console.error('Error en showProductDetail:', err);
  }
}

// Exponer funciones en el objeto global para que puedan llamarse desde los
window.showListProducts = showListProducts;
window.showProductDetail = showProductDetail;

/* Inicializar Splide para la vista de producto */
function iniciarSplideProducto() {
  try {
    // Buscar el contenedor principal del carrusel
    let splideEl = document.getElementById('main-carousel');
    if (!splideEl) return;

    // Asegurar que la librería Splide esté cargada
    if (typeof Splide !== 'function') {
      console.warn('Splide no está disponible en esta página.');
      return;
    }

    // Opciones de splide para manejo de imágenes y miniaturas
    let opciones = {
      type: 'loop',       // que el carrusel sea circular
      perPage: 1,         // una imagen visible a la vez
      perMove: 1,         // desplazamiento de uno en uno
      pagination: false,   // mostrar paginación
      arrows: true,       // mostrar flechas
      gap: '1rem',        // espacio entre slides
      // Usar autoHeight para permitir que cada slide ajuste su altura al contenido
      autoHeight: true,
      cover: false,       // no recortar por defecto (importante)
      breakpoints: {      // comportamiento responsivo sencillo
        992: { gap: '1rem' },
        768: { gap: '0.75rem' },
        480: { gap: '0.5rem' }
      }
    };

    // Inicializar Splide
    let splide = new Splide(splideEl, opciones);

    // Hacer que las miniaturas controlen el carrusel
    let thumbs = document.getElementById('thumbnails');
    if (thumbs) {
      // Convertir lista de miniaturas en array y asignar click
      let items = Array.prototype.slice.call(thumbs.querySelectorAll('.thumbnail'));
      items.forEach(function (el, index) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function () {
          splide.go(index);
        });
      });

      // Sincronizar clases de miniatura cuando cambie el slide
      splide.on('move', function (newIndex) {
        items.forEach(function (el, i) {
          if (i === newIndex) {
            el.classList.add('is-active');
          } else {
            el.classList.remove('is-active');
          }
        });
      });
    }

    // Activar Splide
    splide.mount();

  } catch (err) {
    // Mensaje corto y comprensible
    console.error('Error inicializando Splide:', err && err.message ? err.message : err);
  }
}
iniciarSplideProducto();