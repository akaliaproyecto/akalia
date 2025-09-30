// Iniciar pedido desde la página de producto: redirige a la vista para iniciar un pedido
window.iniciarPedido = function (idProducto) {
  if (!idProducto) return;
  // Redirige a la ruta que mostrará la vista pedidos-iniciar.ejs
  window.location.href = `/usuario-pedidos/iniciar/${idProducto}`;
};
