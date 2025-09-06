// Función para mostrar el modal de crear producto
// Esta función se llama cuando el usuario da clic en el botón "+ Nuevo Producto"
// El llenado dinámico del select de categorías se realiza en la vista EJS mediante un script
function addNewProduct(idPersona) {
  // Obtenemos el modal por su id
  var modal = document.getElementById('modalCrearProducto');
  // Usamos la API de Bootstrap para obtener o crear la instancia del modal.
  // De esta forma evitamos crear dos instancias (por ejemplo si el botón
  // también usa data-bs-toggle) que pueden dejar un backdrop "pegado".
  var modalBootstrap;
  if (typeof bootstrap.Modal.getOrCreateInstance === 'function') {
    // Método recomendado en Bootstrap 5.2+
    modalBootstrap = bootstrap.Modal.getOrCreateInstance(modal);
  } else {
    // Fallback: intenta obtener la instancia existente o crear una nueva
    modalBootstrap = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
  }

  // Mostrar el modal (si ya está visible, show() no crea un nuevo backdrop)
  modalBootstrap.show();

  // Asegurar limpieza del backdrop y la clase 'modal-open' cuando el modal se oculta.
  // Esto previene que la pantalla quede opaca e inoperable si por alguna razón
  // Bootstrap no elimina correctamente el backdrop.
  modal.addEventListener('hidden.bs.modal', function () {
    // Quitar clase que evita interacciones con la página
    document.body.classList.remove('modal-open');
    // Eliminar cualquier backdrop residual
    var backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  });
}

