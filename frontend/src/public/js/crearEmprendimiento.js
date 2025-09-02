// // ========================== SCRIPT PARA CREAR EMPRENDIMIENTOS ==========================
// // Este archivo maneja toda la lógica para crear emprendimientos desde el modal

// // Esperar a que el DOM esté completamente cargado
// document.addEventListener("DOMContentLoaded", function () {
//   console.log("📋 Script de creación de emprendimientos cargado");

//   // === ELEMENTOS DEL DOM QUE VAMOS A USAR ===
//   const modalCrearEmprendimiento = document.getElementById('modalCrearEmprendimiento');
//   const formularioCrearEmprendimiento = document.getElementById('formularioCrearEmprendimiento');
//   const btnGuardarEmprendimiento = document.getElementById('btnGuardarEmprendimiento');
//   const mensajeEstadoEmprendimiento = document.getElementById('mensajeEstadoEmprendimiento');

//   // === FUNCIÓN QUE SE EJECUTA CUANDO SE ABRE EL MODAL ===
//   if (modalCrearEmprendimiento) {
//     // Evento que se dispara cuando el modal se está abriendo
//     modalCrearEmprendimiento.addEventListener('show.bs.modal', function (evento) {
//       console.log("📂 Abriendo modal de crear emprendimiento");

//       // Obtener el botón que activó el modal
//       const botonQueAbrio = evento.relatedTarget;

//       // Extraer el ID del usuario desde el atributo data-usuario-id del botón
//       const idUsuario = botonQueAbrio.getAttribute('data-usuario-id');

//       // Asignar el ID del usuario al campo oculto del formulario
//       const campoIdUsuario = document.getElementById('idUsuarioEmprendimiento');
//       if (campoIdUsuario && idUsuario) {
//         campoIdUsuario.value = idUsuario;
//         console.log("👤 ID de usuario asignado al formulario:", idUsuario);
//       } else {
//         console.warn("⚠️ No se pudo obtener el ID del usuario");
//         console.log("Botón que abrió:", botonQueAbrio);
//         console.log("ID usuario encontrado:", idUsuario);
//       }

//       // Limpiar el formulario cada vez que se abre el modal
//       limpiarFormularioEmprendimiento();
//     });
//   }

//   // === FUNCIÓN PARA LIMPIAR EL FORMULARIO ===
//   function limpiarFormularioEmprendimiento() {
//     console.log("🧹 Limpiando formulario de emprendimiento");

//     // Limpiar todos los campos del formulario (excepto el ID del usuario)
//     const campos = [
//       'nombreEmprendimientoModal',
//       'logoEmprendimientoModal',
//       'descripcionEmprendimientoModal',
//       'departamentoModal',
//       'ciudadModal'
//     ];

//     campos.forEach(function (idCampo) {
//       const campo = document.getElementById(idCampo);
//       if (campo) {
//         campo.value = '';
//       }
//     });

//     // Ocultar mensaje de estado
//     if (mensajeEstadoEmprendimiento) {
//       mensajeEstadoEmprendimiento.classList.add('d-none');
//     }

//     console.log("✅ Formulario limpiado");
//   }

//   // === FUNCIÓN PRINCIPAL PARA GUARDAR EL EMPRENDIMIENTO ===
//   if (btnGuardarEmprendimiento && formularioCrearEmprendimiento) {
//     btnGuardarEmprendimiento.addEventListener('click', async function () {
//       console.log("💾 Iniciando proceso de creación de emprendimiento");

//       // PASO 1: Validar que los campos obligatorios estén llenos
//       const nombreEmprendimiento = document.getElementById('nombreEmprendimientoModal').value.trim();
//       const descripcionEmprendimiento = document.getElementById('descripcionEmprendimientoModal').value.trim();
//       const idUsuario = document.getElementById('idUsuarioEmprendimiento').value;

//       // Mostrar en consola los valores para debugging
//       console.log("📝 Datos del formulario:");
//       console.log("- Nombre:", nombreEmprendimiento);
//       console.log("- Descripción:", descripcionEmprendimiento);
//       console.log("- ID Usuario:", idUsuario);

//       // Verificar campos obligatorios
//       if (!nombreEmprendimiento) {
//         mostrarMensajeEstado('error', 'El nombre del emprendimiento es obligatorio');
//         return;
//       }

//       if (!descripcionEmprendimiento) {
//         mostrarMensajeEstado('error', 'La descripción del emprendimiento es obligatoria');
//         return;
//       }

//       if (!idUsuario) {
//         mostrarMensajeEstado('error', 'Error: No se pudo identificar el usuario. Intenta cerrar y abrir el modal nuevamente.');
//         return;
//       }

//       // PASO 2: Preparar los datos para enviar al servidor
//       console.log("📦 Preparando datos para enviar al servidor");

//       // Crear objeto con los datos del emprendimiento
//       const datosEmprendimiento = {
//         usuario: idUsuario,
//         nombreEmprendimiento: nombreEmprendimiento,
//         descripcionEmprendimiento: descripcionEmprendimiento,
//         'ubicacionEmprendimiento.departamento': document.getElementById('departamentoModal').value.trim(),
//         'ubicacionEmprendimiento.ciudad': document.getElementById('ciudadModal').value.trim()
//       };

//       console.log("📋 Objeto de datos preparado:", datosEmprendimiento);

//       // PASO 3: Mostrar indicador de carga
//       btnGuardarEmprendimiento.disabled = true;
//       btnGuardarEmprendimiento.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando...';

//       try {
//         // PASO 4: Enviar datos al servidor usando fetch
//         console.log("🚀 Enviando datos al servidor...");

//         const respuestaServidor = await fetch('/emprendimientos', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(datosEmprendimiento)
//         });

//         console.log("📡 Respuesta del servidor - Status:", respuestaServidor.status);

//         if (respuestaServidor.ok) {
//           // ÉXITO: El emprendimiento se creó correctamente
//           const datosRespuesta = await respuestaServidor.json();
//           console.log("✅ Emprendimiento creado exitosamente:", datosRespuesta);

//           mostrarMensajeEstado('success', '¡Emprendimiento creado exitosamente! Actualizando página...');

//           // Esperar 2 segundos y recargar la página para mostrar el nuevo emprendimiento
//           setTimeout(function () {
//             window.location.reload();
//           }, 2000);

//         } else {
//           // ERROR: Hubo un problema en el servidor
//           const datosError = await respuestaServidor.json();
//           const mensajeError = datosError.mensaje || datosError.error || 'Error desconocido al crear el emprendimiento';

//           console.error("❌ Error del servidor:", datosError);
//           mostrarMensajeEstado('error', `Error al crear el emprendimiento: ${mensajeError}`);
//         }

//       } catch (errorConexion) {
//         // ERROR DE CONEXIÓN: No se pudo conectar con el servidor
//         console.error("🌐 Error de conexión completo:", errorConexion);
//         mostrarMensajeEstado('error', 'Error de conexión con el servidor. Verifica tu conexión e intenta nuevamente.');

//       } finally {
//         // PASO 5: Restaurar el botón a su estado original
//         btnGuardarEmprendimiento.disabled = false;
//         btnGuardarEmprendimiento.innerHTML = '<i class="fas fa-save me-1"></i>Crear Emprendimiento';
//       }
//     });
//   }

//   // === FUNCIÓN PARA MOSTRAR MENSAJES DE ESTADO ===
//   function mostrarMensajeEstado(tipoMensaje, textoMensaje) {
//     if (mensajeEstadoEmprendimiento) {
//       // Limpiar clases anteriores
//       mensajeEstadoEmprendimiento.className = 'alert';

//       // Agregar clase según el tipo de mensaje
//       if (tipoMensaje === 'success') {
//         mensajeEstadoEmprendimiento.classList.add('alert-success');
//       } else if (tipoMensaje === 'error') {
//         mensajeEstadoEmprendimiento.classList.add('alert-danger');
//       } else if (tipoMensaje === 'info') {
//         mensajeEstadoEmprendimiento.classList.add('alert-info');
//       }

//       // Mostrar el mensaje
//       mensajeEstadoEmprendimiento.textContent = textoMensaje;
//       mensajeEstadoEmprendimiento.classList.remove('d-none');

//       console.log(`📢 Mensaje ${tipoMensaje}:`, textoMensaje);
//     }
//   }

// });
