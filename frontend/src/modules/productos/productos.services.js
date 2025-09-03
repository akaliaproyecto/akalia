// Servicios relacionados con productos (lógica de negocio / controlador simple)
// Este archivo contiene funciones que realizan la lógica y que son llamadas
// desde los archivos de rutas. Mantener la lógica aquí ayuda a organizar el
// proyecto y es una práctica recomendada para proyectos escalables.


exports.listarProductosUsuario = async (req, res) => {
  const idParam = req.params.id;
  const idUsuario = idParam || (req.usuarioAutenticado && req.usuarioAutenticado.idPersona) || '';
  const usuario = req.usuarioAutenticado || { idPersona: idUsuario };

  // Lista de productos vacía por defecto (mock).
  // Un estudiante puede reemplazar esto por una llamada a la API o BD.
  const productos = [];

  // Datos simulados para evitar errores de variables no definidas
  const emprendimientos = [
    { idEmprendimiento: "1", nombreEmprendimiento: "Mi Emprendimiento" }
  ];
  const categorias = [
    { idCategoria: "1", nombreCategoria: "Categoría 1" },
    { idCategoria: "2", nombreCategoria: "Categoría 2" }
  ];
  const etiquetas = [
    { value: "Etiqueta1" },
    { value: "Etiqueta2" }
  ];

  return res.render('pages/usuario-productos-listar', {
    usuario,
    productos,
    emprendimientos,
    categorias,
    etiquetas
  });
};
