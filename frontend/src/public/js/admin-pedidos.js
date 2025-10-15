/* JavaScript para gestión de pedidos en panel admin */

async function verDetallePedido(pedidoId) {
  try {
    const response = await fetch(`${apiBaseUrl}/admin/pedidos/${pedidoId}`, {
        credentials: 'include', 
      headers: {
        'akalia-api-key': apiKey,
        'Cookie': document.cookie
      }
    });

    if (!response.ok) throw new Error('Error al cargar pedido');

    const data = await response.json();
    const p = data.pedido;
    // Crear modal dinámico
    const modalHTML = `
      <div class="modal fade" id="modalDetallePedido" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalle del Pedido</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <strong>Comprador:</strong>
                  <p>${p.idUsuarioComprador?.nombreUsuario} ${p.idUsuarioComprador?.apellidoUsuario}</p>
                  <small class="text-muted">${p.idUsuarioComprador?.correo}</small>
                </div>
                <div class="col-md-6 mb-3">
                  <strong>Vendedor:</strong>
                  <p>${p.idUsuarioVendedor?.nombreUsuario} ${p.idUsuarioVendedor?.apellidoUsuario}</p>
                  <small class="text-muted">${p.idUsuarioVendedor?.correo}</small>
                </div>
                <div class="col-12 mb-3">
                  <strong>Producto:</strong>
                  <p>${p.detallePedido.idProducto?.tituloProducto || 'N/A'}</p>
                  <small class="text-muted">${p.idProducto?.descripcionProducto || ''}</small>
                </div>
                <div class="col-md-4 mb-3">
                  <strong>Cantidad:</strong>
                  <p>${p.cantidad || 1}</p>
                </div>
                <div class="col-md-4 mb-3">
                  <strong>Precio Unitario:</strong>
                  <p>$${p.detallePedido?.precioPactado || 'N/A'}</p>
                </div>
                <div class="col-md-4 mb-3">
                  <strong>Total:</strong>
                  <p class="fw-bold">$${p.total || (p.detallePedido?.precioPactado * (p.detallePedido?.unidades || 1))}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <strong>Estado:</strong>
                  <p>
                    <span class="badge bg-${
                      p.estadoPedido === 'completado' ? 'success' : 
                      p.estadoPedido === 'pendiente' ? 'warning' : 
                      p.estadoPedido === 'en_proceso' ? 'info' : 'secondary'
                    }">
                      ${p.estadoPedido}
                    </span>
                  </p>
                </div>
                <div class="col-md-6 mb-3">
                  <strong>Fecha del Pedido:</strong>
                  <p>${new Date(p.createdAt).toLocaleDateString('es-ES', { 
                    year: 'numeric', month: 'long', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  })}</p>
                </div>
                ${p.direccionEntrega ? `
                  <div class="col-12 mb-3">
                    <strong>Dirección de Entrega:</strong>
                    <p>${p.direccionEntrega}</p>
                  </div>
                ` : ''}
                ${p.notas ? `
                  <div class="col-12 mb-3">
                    <strong>Notas:</strong>
                    <p>${p.notas}</p>
                  </div>
                ` : ''}
              </div>
              
              <!-- Cambiar estado del pedido -->
              <div class="row mt-3">
                <div class="col-12">
                  <label class="form-label"><strong>Cambiar Estado:</strong></label>
                  <select class="form-select" id="nuevoEstadoPedido">
                    <option value="pendiente" ${p.estadoPedido === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="en_proceso" ${p.estadoPedido === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="completado" ${p.estadoPedido === 'completado' ? 'selected' : ''}>Completado</option>
                    <option value="cancelado" ${p.estadoPedido === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" class="btn btn-terracota" onclick="actualizarEstadoPedido('${p._id}')">
                Actualizar Estado
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Limpiar y mostrar modal
    const modalAnterior = document.getElementById('modalDetallePedido');
    if (modalAnterior) modalAnterior.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('modalDetallePedido'));
    modal.show();

  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar los detalles del pedido');
  }
}

async function actualizarEstadoPedido(pedidoId) {
  const nuevoEstado = document.getElementById('nuevoEstadoPedido').value;

  try {
    const response = await fetch(`${apiBaseUrl}/admin/pedidos/${pedidoId}`, {
      method: 'PUT',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
        'akalia-api-key': apiKey,
        'Cookie': document.cookie
      },
      body: JSON.stringify({ estadoPedido: nuevoEstado })
    });

    if (!response.ok) throw new Error('Error al actualizar pedido');

    alert('Estado del pedido actualizado correctamente');
    window.location.reload();

  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el estado del pedido');
  }
}
