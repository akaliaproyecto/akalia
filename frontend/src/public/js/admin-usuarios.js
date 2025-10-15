// Funciones para gestión de usuarios en panel admin

async function verDetalleUsuario(userId) {
  try {
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleUsuario'));
    const content = document.getElementById('detalleUsuarioContent');
    
    // Mostrar loading
    content.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-terracota" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    `;
    
    modal.show();

    // Obtener datos del usuario - AGREGAR credentials: 'include'
    const response = await fetch(`${apiBaseUrl}/admin/usuarios/${userId}`, {
      method: 'GET',
      credentials: 'include', 
      headers: {
        'akalia-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al cargar usuario');

    const data = await response.json();
    const u = data.usuario;

    // Mostrar detalles
    content.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-3">
          <strong>Nombre:</strong>
          <p>${u.nombreUsuario} ${u.apellidoUsuario}</p>
        </div>
        <div class="col-md-6 mb-3">
          <strong>Email:</strong>
          <p>${u.correo}</p>
        </div>
        <div class="col-md-6 mb-3">
          <strong>Teléfono:</strong>
          <p>${u.telefono || 'No registrado'}</p>
        </div>
        <div class="col-md-6 mb-3">
          <strong>Rol:</strong>
          <p><span class="badge bg-${u.rolUsuario === 'admin' ? 'danger' : 'primary'}">${u.rolUsuario || 'usuario'}</span></p>
        </div>
        <div class="col-md-6 mb-3">
          <strong>Estado:</strong>
          <p><span class="badge bg-${u.estadoUsuario === 'activo' ? 'success' : 'secondary'}">${u.estadoUsuario}</span></p>
        </div>
        <div class="col-md-6 mb-3">
          <strong>Fecha de Registro:</strong>
          <p>${new Date(u.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        ${u.direcciones && u.direcciones.length > 0 ? `
          <div class="col-12 mb-3">
            <strong>Direcciones:</strong>
            ${u.direcciones.map(d => `
              <div class="border rounded p-2 mt-2">
                <p class="mb-1"><strong>${d.direccion}</strong></p>
                <small class="text-muted">${d.ciudad}, ${d.departamento}</small>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

  } catch (error) {
    console.error('Error:', error);
    content.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i>
        Error al cargar los detalles del usuario
      </div>
    `;
  }
}

async function editarUsuario(userId) {
  try {
    console.log('🔍 Editando usuario:', userId);
    
    // Obtener datos actuales
    const response = await fetch(`${apiBaseUrl}/admin/usuarios/${userId}`, {
      method: 'GET',
      credentials: 'include', 
      headers: {
        'akalia-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Error al cargar usuario');
    }

    const data = await response.json();
    console.log(' Datos recibidos:', data);
    
    const u = data.usuario;

    // Llenar formulario
    document.getElementById('editUserId').value = u._id;
    document.getElementById('editEstadoUsuario').value = u.estadoUsuario;
    document.getElementById('editRolUsuario').value = u.rolUsuario || 'usuario';

    console.log('📝 Formulario llenado:', {
      id: u._id,
      estado: u.estadoUsuario,
      rol: u.rolUsuario
    });

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    modal.show();

  } catch (error) {
    console.error('Error completo:', error);
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Error al cargar datos del usuario', 'error');
    } else {
      alert('Error al cargar datos del usuario');
    }
  }
}

// Manejo del formulario de edición
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formEditarUsuario');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const userId = document.getElementById('editUserId').value;
      const estadoUsuario = document.getElementById('editEstadoUsuario').value;
      const rolUsuario = document.getElementById('editRolUsuario').value;

      console.log('💾 Guardando cambios:', { userId, estadoUsuario, rolUsuario });

      // Mostrar spinner
      const spinner = document.getElementById('spinnerGuardarUsuario');
      const btn = form.querySelector('button[type="submit"]');
      if (spinner) spinner.classList.remove('d-none');
      if (btn) btn.disabled = true;

      try {
        const response = await fetch(`${apiBaseUrl}/admin/usuarios/${userId}`, {
          method: 'PUT',
          credentials: 'include', 
          headers: {
            'Content-Type': 'application/json',
            'akalia-api-key': apiKey
          },
          body: JSON.stringify({ estadoUsuario, rolUsuario })
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error al actualizar:', errorData);
          throw new Error(errorData.error || 'Error al actualizar usuario');
        }

        console.log(' Usuario actualizado correctamente');

        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Usuario actualizado correctamente', 'success');
        }

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
        if (modal) modal.hide();

        // Recargar después de un delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } catch (error) {
        console.error('Error:', error);
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast(error.message || 'Error al actualizar usuario', 'error');
        } else {
          alert(error.message || 'Error al actualizar usuario');
        }
      } finally {
        if (spinner) spinner.classList.add('d-none');
        if (btn) btn.disabled = false;
      }
    });
  } else {
    console.warn('⚠️ Formulario formEditarUsuario no encontrado en el DOM');
  }
});
