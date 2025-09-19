
// landing.js
// Archivo con funciones DOM simples para la landing (SSR).
// Comentarios y nombres en español para que un principiante entienda.

// Mostrar la lista completa de productos. Aquí solo hacemos un scroll hacia
// la sección que contiene los productos para mejorar la usabilidad.
function showListProducts() {
  try {
    const seccion = document.querySelector('.categoria-container');
    if (seccion) {
      seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    // Si falla, no interrumpe la página; registramos para depuración.
    console.error('Error en showListProducts:', err);
  }
}

// Redirigir a la página de detalle de producto. Asumimos que existe
// una ruta en el frontend que muestra detalle: /producto/:id
function showProductDetail(idProducto) {
  try {
    if (!idProducto) return;
    // Construimos la URL con el id del producto y navegamos.
    window.location.href = `/producto/${idProducto}`;
  } catch (err) {
    console.error('Error en showProductDetail:', err);
  }
}

// Exponer funciones en el objeto global para que puedan llamarse desde los
// atributos onclick en las plantillas EJS (por ejemplo: onclick="showProductDetail(...)").
window.showListProducts = showListProducts;
window.showProductDetail = showProductDetail;
