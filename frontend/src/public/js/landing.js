
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
