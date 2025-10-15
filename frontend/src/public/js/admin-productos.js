/* JavaScript para gestión de productos en panel admin */

async function verDetalleProducto(productoId) {
  try {
    const response = await fetch(`${apiBaseUrl}/admin/productos/${productoId}`, {
    credentials: 'include', 
      headers: {
        'akalia-api-key': apiKey,
        'Cookie': document.cookie
      }
    });

    if (!response.ok) throw new Error('Error al cargar producto');

    const data = await response.json();
    const p = data.producto;

    // Crear modal dinámico para mostrar detalles
    const modalHTML = `
      <div class="modal fade" id="modalDetalleProducto" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalle del Producto</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <strong>Título:</strong>
                  <p>${p.tituloProducto}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <strong>Precio:</strong>
                  <p>$${p.precio}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <strong>Emprendimiento:</strong>
                  <p>${p.idEmprendimiento?.nombreEmprendimiento || 'N/A'}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <strong>Categoría:</strong>
                  <p>${p.categoria}</p>
                </div>
                <div class="col-12 mb-3">
                  <strong>Descripción:</strong>
                  <p>${p.descripcionProducto}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <strong>Estado:</strong>
                  <p><span class="badge bg-${p.productoActivo ? 'success' : 'secondary'}">${p.productoActivo ? 'Activo' : 'Inactivo'}</span></p>
                </div>
                <div class="col-md-6 mb-3">
                  <strong>Fecha de creación:</strong>
                  <p>${new Date(p.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                ${p.etiquetas && p.etiquetas.length > 0 ? `
                  <div class="col-12 mb-3">
                    <strong>Etiquetas:</strong>
                    <div class="mt-2">
                      ${p.etiquetas.map(et => `<span class="badge bg-secondary me-1">${et}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Limpiar modales anteriores
    const modalAnterior = document.getElementById('modalDetalleProducto');
    if (modalAnterior) modalAnterior.remove();

    // Insertar y mostrar modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleProducto'));
    modal.show();

  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar los detalles del producto');
  }
}

async function toggleEstadoProducto(productoId, estadoActual) {
  const nuevoEstado = !estadoActual;
  const accion = nuevoEstado ? 'activar' : 'desactivar';

  if (!confirm(`¿Estás seguro de que deseas ${accion} este producto?`)) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/admin/productos/${productoId}`, {
      method: 'PUT',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
        'akalia-api-key': apiKey,
        'Cookie': document.cookie
      },
      body: JSON.stringify({ productoActivo: nuevoEstado })
    });

    if (!response.ok) throw new Error('Error al actualizar producto');

    alert(`Producto ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente`);
    window.location.reload();

  } catch (error) {
    console.error('Error:', error);
    alert(`Error al ${accion} producto`);
  }
}
