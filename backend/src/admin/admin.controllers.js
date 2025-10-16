const Usuario = require('../usuarios/usuarios.model.js');
const Producto = require('../productos/productos.model.js');
const Emprendimiento = require('../emprendimientos/emprendimiento.model.js');
const Pedido = require('../pedidos/pedidos.model.js');
const Categoria = require('../categorias/categorias.model.js');
const Etiqueta = require('../etiquetas/etiquetas.model.js');
const uploadImage = require('../servicios/subirImagen')
/**
 * Controladores de administración
 *
 * Módulo que contiene funciones usadas por el panel de administración.
 * Cada función maneja peticiones (req, res) y se encarga de operaciones CRUD
 * o de consulta sobre usuarios, productos, emprendimientos, pedidos,
 * categorías y etiquetas.
 * Comentarios en español, estilo simple para estudiantes.
 */

// ==================== ESTADÍSTICAS ====================
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const [
      totalUsuarios,
      totalProductos,
      totalEmprendimientos,
      totalPedidos,
      usuariosActivos,
      productosActivos,
      pedidosPendientes,
      pedidosCompletados
    ] = await Promise.all([
      Usuario.countDocuments(),
      Producto.countDocuments(),
      Emprendimiento.countDocuments(),
      Pedido.countDocuments(),
      Usuario.countDocuments({ estadoUsuario: 'activo' }),
      Producto.countDocuments({ productoActivo: true }),
      Pedido.countDocuments({ estadoPedido: 'pendiente' }),
      Pedido.countDocuments({ estadoPedido: 'completado' })
    ]);

    // Últimos registros
    const ultimosUsuarios = await Usuario.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nombreUsuario apellidoUsuario correo createdAt');

    const ultimosPedidos = await Pedido.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('idUsuarioComprador', 'nombreUsuario apellidoUsuario')
      .populate('idUsuarioVendedor', 'nombreUsuario apellidoUsuario')
      .populate('idEmprendimiento', 'nombreEmprendimiento');

    res.json({
      estadisticas: {
        totalUsuarios,
        totalProductos,
        totalEmprendimientos,
        totalPedidos,
        usuariosActivos,
        productosActivos,
        pedidosPendientes,
        pedidosCompletados
      },
      ultimosUsuarios,
      ultimosPedidos
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// ==================== USUARIOS ====================
/**
 * Listar usuarios con paginación y filtros.
 * Query params: page, limit, buscar, estado
 * Devuelve JSON con usuarios y meta de paginación.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 10, buscar = '', estado = '' } = req.query;
    
    const filtros = {};
    if (buscar) {
      filtros.$or = [
        { nombreUsuario: { $regex: buscar, $options: 'i' } },
        { apellidoUsuario: { $regex: buscar, $options: 'i' } },
        { correo: { $regex: buscar, $options: 'i' } }
      ];
    }
    if (estado) {
      filtros.estadoUsuario = estado;
    }

    const usuarios = await Usuario.find(filtros)
      .select('-contrasena')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Usuario.countDocuments(filtros);

    res.json({
      usuarios,
      totalPaginas: Math.ceil(total / limit),
      paginaActual: page,
      total
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

/**
 * Obtener un usuario por su ID.
 * Devuelve el usuario sin la contraseña.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    console.log('hola')
    const usuario = await Usuario.findById(req.params.id).select('-contrasena');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ usuario });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

/**
 * Actualizar campos de un usuario desde el panel admin.
 * Ejemplo: estadoUsuario, rolUsuario
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.actualizarUsuario = async (req, res) => {
  try {
    // CAMBIO: usar rolUsuario en lugar de rol
    const { estadoUsuario, rolUsuario } = req.body;
    
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { estadoUsuario, rolUsuario }, // CAMBIO: rolUsuario
      { new: true, runValidators: true }
    ).select('-contrasena');

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario actualizado', usuario });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

/**
 * Desactivar (eliminar lógicamente) un usuario.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { estadoUsuario: 'inactivo' },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// ==================== PRODUCTOS ====================
/**
 * Listar productos con filtros y paginación para administración.
 * Query params: page, limit, buscar, categoria, estado
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerProductos = async (req, res) => {
  try {
    const { page = 1, limit = 10, buscar = '', categoria = '', estado = '' } = req.query;
    
    const filtros = {};
    if (buscar) {
      filtros.tituloProducto = { $regex: buscar, $options: 'i' };
    }
    if (categoria) {
      filtros.categoria = categoria;
    }
    if (estado !== '') {
      filtros.productoActivo = estado === 'true';
    }

    const productos = await Producto.find(filtros)
      .populate('idEmprendimiento', 'nombreEmprendimiento')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Producto.countDocuments(filtros);

    res.json({
      productos,
      totalPaginas: Math.ceil(total / limit),
      paginaActual: page,
      total
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

/**
 * Obtener detalle de un producto por ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id)
      .populate('idEmprendimiento', 'nombreEmprendimiento');
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ producto });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

/**
 * Actualizar estado o campos de un producto (admin).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.actualizarProducto = async (req, res) => {
  try {
    const { productoActivo } = req.body;
    
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { productoActivo },
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto actualizado', producto });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

/**
 * Eliminar (marcar como eliminado) un producto.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { productoEliminado: true, productoActivo: false },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// ==================== EMPRENDIMIENTOS ====================
/**
 * Listar emprendimientos con filtros y paginación.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerEmprendimientos = async (req, res) => {
  try {
    const { page = 1, limit = 10, buscar = '', estado = '' } = req.query;
    
    const filtros = {};
    if (buscar) {
      filtros.nombreEmprendimiento = { $regex: buscar, $options: 'i' };
    }
    if (estado !== '') {
      filtros.emprendimientoActivo = estado === 'true';
    }

    const emprendimientos = await Emprendimiento.find(filtros)
      .populate('usuario', 'nombreUsuario apellidoUsuario correo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Emprendimiento.countDocuments(filtros);

    res.json({
      emprendimientos,
      totalPaginas: Math.ceil(total / limit),
      paginaActual: page,
      total
    });
  } catch (error) {
    console.error('Error al obtener emprendimientos:', error);
    res.status(500).json({ error: 'Error al obtener emprendimientos' });
  }
};

/**
 * Obtener emprendimiento por ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerEmprendimientoPorId = async (req, res) => {
  try {
    const emprendimiento = await Emprendimiento.findById(req.params.id)
      .populate('usuario', 'nombreUsuario apellidoUsuario correo');
    
    if (!emprendimiento) {
      return res.status(404).json({ error: 'Emprendimiento no encontrado' });
    }
    res.json({ emprendimiento });
  } catch (error) {
    console.error('Error al obtener emprendimiento:', error);
    res.status(500).json({ error: 'Error al obtener emprendimiento' });
  }
};

/**
 * Actualizar estado o datos de un emprendimiento.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.actualizarEmprendimiento = async (req, res) => {
  try {
    const { emprendimientoActivo } = req.body;
    
    const emprendimiento = await Emprendimiento.findByIdAndUpdate(
      req.params.id,
      { emprendimientoActivo },
      { new: true, runValidators: true }
    );

    if (!emprendimiento) {
      return res.status(404).json({ error: 'Emprendimiento no encontrado' });
    }

    res.json({ mensaje: 'Emprendimiento actualizado', emprendimiento });
  } catch (error) {
    console.error('Error al actualizar emprendimiento:', error);
    res.status(500).json({ error: 'Error al actualizar emprendimiento' });
  }
};

/**
 * Eliminar (marcar como eliminado) un emprendimiento.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.eliminarEmprendimiento = async (req, res) => {
  try {
    const emprendimiento = await Emprendimiento.findByIdAndUpdate(
      req.params.id,
      { emprendimientoEliminado: true, emprendimientoActivo: false },
      { new: true }
    );

    if (!emprendimiento) {
      return res.status(404).json({ error: 'Emprendimiento no encontrado' });
    }

    res.json({ mensaje: 'Emprendimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar emprendimiento:', error);
    res.status(500).json({ error: 'Error al eliminar emprendimiento' });
  }
};

// ==================== PEDIDOS ====================
/**
 * Listar pedidos con filtros (estado) y paginación.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerPedidos = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado = '' } = req.query;
    
    const filtros = {};
    if (estado) {
      filtros.estadoPedido = estado;
    }

    const pedidos = await Pedido.find(filtros)
      .populate('idUsuarioComprador', 'nombreUsuario apellidoUsuario correo')
      .populate('idEmprendimiento', 'nombreEmprendimiento')
      .populate('detallePedido.idProducto', 'tituloProducto precio')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pedido.countDocuments(filtros);

    res.json({
      pedidos,
      totalPaginas: Math.ceil(total / limit),
      paginaActual: page,
      total
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

/**
 * Obtener detalle de un pedido por ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('idUsuarioComprador', 'nombreUsuario apellidoUsuario correo telefono')
      .populate('idUsuarioVendedor', 'nombreUsuario apellidoUsuario correo telefono')
      .populate('detallePedido.idProducto', 'tituloProducto descripcionProducto precio');
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ pedido });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

/**
 * Actualizar estado u otros campos de un pedido.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.actualizarPedido = async (req, res) => {
  try {
    const { estadoPedido } = req.body;
    
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estadoPedido },
      { new: true, runValidators: true }
    );

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ mensaje: 'Pedido actualizado', pedido });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
};

// ==================== CATEGORÍAS ====================
/**
 * Listar categorías.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombreCategoria: 1 });
    res.json({ categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

/**
 * Crear una nueva categoría (puede incluir subida de imagen).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.crearCategoria = async (req, res) => {
  try {
    let { nombreCategoria, imagen } = req.body;
    
    // Si hay un archivo subido, usar su URL
    if (req.file) {
      imagen = await uploadImage(req.file, "categorias"); // Cloudinary devuelve la URL en file.path
    }
        console.log('//////////////////////////////////////////////')

    console.log(imagen)
    const categoriaExistente = await Categoria.findOne({ nombreCategoria });
    if (categoriaExistente) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }

    const nuevaCategoria = new Categoria({ nombreCategoria, imagen });
    await nuevaCategoria.save();

    res.status(201).json({ mensaje: 'Categoría creada', categoria: nuevaCategoria });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

/**
 * Actualizar una categoría por ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.actualizarCategoria = async (req, res) => {
  try {
    let { nombreCategoria, imagen } = req.body;
    
    // Si hay un archivo subido, usar su URL
    if (req.file) {
      imagen = await uploadImage(req.file, "categorias");
    }
    
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { nombreCategoria, imagen },
      { new: true, runValidators: true }
    );

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría actualizada', categoria });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

/**
 * Eliminar categoría por ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.eliminarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

// ==================== ETIQUETAS ====================
/**
 * Listar etiquetas.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.obtenerEtiquetas = async (req, res) => {
  try {
    const etiquetas = await Etiqueta.find().sort({ nombreEtiqueta: 1 });
    res.json({ etiquetas });
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({ error: 'Error al obtener etiquetas' });
  }
};

/**
 * Crear una nueva etiqueta.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.crearEtiqueta = async (req, res) => {
  try {
    const { nombreEtiqueta } = req.body;
    
    const etiquetaExistente = await Etiqueta.findOne({ nombreEtiqueta });
    if (etiquetaExistente) {
      return res.status(400).json({ error: 'La etiqueta ya existe' });
    }

    const nuevaEtiqueta = new Etiqueta({ nombreEtiqueta });
    await nuevaEtiqueta.save();

    res.status(201).json({ mensaje: 'Etiqueta creada', etiqueta: nuevaEtiqueta });
  } catch (error) {
    console.error('Error al crear etiqueta:', error);
    res.status(500).json({ error: 'Error al crear etiqueta' });
  }
};

/**
 * Actualizar etiqueta por ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.actualizarEtiqueta = async (req, res) => {
  try {
    const { nombreEtiqueta } = req.body;
    
    const etiqueta = await Etiqueta.findByIdAndUpdate(
      req.params.id,
      { nombreEtiqueta },
      { new: true, runValidators: true }
    );

    if (!etiqueta) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    res.json({ mensaje: 'Etiqueta actualizada', etiqueta });
  } catch (error) {
    console.error('Error al actualizar etiqueta:', error);
    res.status(500).json({ error: 'Error al actualizar etiqueta' });
  }
};

/**
 * Eliminar etiqueta por ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.eliminarEtiqueta = async (req, res) => {
  try {
    const etiqueta = await Etiqueta.findByIdAndDelete(req.params.id);

    if (!etiqueta) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    res.json({ mensaje: 'Etiqueta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar etiqueta:', error);
    res.status(500).json({ error: 'Error al eliminar etiqueta' });
  }
};
