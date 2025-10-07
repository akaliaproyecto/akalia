/* IMPORTANTE: AL HABER CAMBIADO EL SCHEMA, estadoProducto NO ES VÁLIDO, POR ENDE, DEBE SER ELIMINADO EN UNA ETAPA MAS ADELANTADA DE DESARROLLO */

// Importar el modelo de productos
const modeloProducto = require("./productos.model");
const uploadImage = require('../servicios/subirImagen');
const mongoose = require('mongoose');
const Log = require('../middlewares/logs');
const {
  validarIdMongoDB,
  productoExistePorId,
  validarDatosCreacionProducto,
  validarDatosActualizacionProducto
} = require('./productos.validations');

/*Consultar todos los productos*/
exports.obtenerProductos = async (req, res) => {
  try {
    const productosEncontrados = await modeloProducto.find({
      $or: [
        { estadoProducto: 'activo' },
        { productoActivo: true, productoEliminado: false }
      ]
    });

    if (productosEncontrados && productosEncontrados.length > 0) {
      return res.status(200).json(productosEncontrados);
    } else {
      return res.status(404).json({ mensaje: "No se encontraron productos" });
    }
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al consultar productos", detalle: error.message });
  }
};

/*Consultar un producto por su id*/
exports.obtenerProductoPorId = async (req, res) => {
  let idProducto = req.params.id;
  console.log('Sessioooon detalle producto', req.session)
  try {
    // Validar formato de id antes de consultar
    if (!validarIdMongoDB(idProducto)) {
      return res.status(400).json({ mensaje: 'Id de producto inválido' });
    }

    // Buscamos el producto por id y aceptamos ambos esquemas de estado
    const productoEncontrado = await modeloProducto.findOne({
      _id: idProducto,
       productoEliminado: false 
      }).populate('idEmprendimiento');
    if (productoEncontrado) {
      res.status(200).json(productoEncontrado);
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar producto", detalle: error.message });
  }
};

/*Consultar un producto por su nombre*/
exports.obtenerProductoPorNombre = async (req, res) => {
  // Nombre buscado (desde params)
  const nombreProducto = req.params.nombre;

  try {
    // Normalizamos y creamos regex case-insensitive
    const regex = new RegExp(String(nombreProducto), 'i');

    // Leer filtros desde querystring
    const ordenarRaw = String(req.query.ordenar || '');
    let ordenar = null;
    if (ordenarRaw.includes('asc')) { ordenar = 'asc' }
    else if (ordenarRaw.includes('desc')) { ordenar = 'desc' }

    let min = null;
    if (req.query.min !== undefined && req.query.min !== '') {
      const valorMin = Number(req.query.min); // convertir cadena a número
      if (!Number.isNaN(valorMin)) min = valorMin; // asignar solo si es un número válido
    }

    let max = null;
    if (req.query.max !== undefined && req.query.max !== '') {
      const valorMax = Number(req.query.max);
      if (!Number.isNaN(valorMax)) max = valorMax;
    }

    // Construir pipeline de aggregation para aplicar regex + filtros de precio + orden
    const pipeline = [];

    // 1) Match por título usando regex y productos activos
    pipeline.push({
      $match: {
        tituloProducto: { $regex: regex },
        $or: [{ productoActivo: true, productoEliminado: false }, { estadoProducto: 'activo' }]
      }
    });

    // 2) Filtrar por rango de precio si aplica
    if (min !== null || max !== null) {
      const rango = {};
      if (min !== null) rango.$gte = min;
      if (max !== null) rango.$lte = max;
      if (Object.keys(rango).length) pipeline.push({ $match: { precio: rango } });
    }

    // 3) Proyección mínima para rendimiento (la vista solo necesita campos básicos)
    pipeline.push({
      $project: {
        tituloProducto: 1,
        descripcionProducto: 1,
        precio: 1,
        idEmprendimiento: 1,
        categoria: 1,
        imagenes: 1,
        productoActivo: 1
      }
    });

    // 4) Ordenamiento si se solicita
    if (ordenar === 'asc' || ordenar === 'desc') {
      const dir = ordenar === 'asc' ? 1 : -1;
      pipeline.push({ $sort: { precio: dir } });
    }

    const productosEncontrados = await modeloProducto.aggregate(pipeline).exec();

    if (productosEncontrados && productosEncontrados.length > 0) {
      return res.status(200).json(productosEncontrados);
    }

    // Si no hay resultados, devolver 404 para mantener comportamiento previo
    return res.status(404).json({ mensaje: "No se encontraron productos con ese nombre/parcial" });
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al consultar producto", detalle: error.message });
  }
};

/*Crear un nuevo producto*/
exports.crearProducto = async (req, res) => {
  // datos enviados por el cliente (formulario)
  const datosProducto = req.body;

  try {
    // Guardamos URLs de las imágenes subidas (si hay)
    let imagenes = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file, "productos");
        imagenes.push(url);
      }
    }

    // Construimos el documento con los datos y las URLs de imagen
    const nuevoProducto = new modeloProducto({ ...datosProducto, imagenes });
    const productoGuardado = await nuevoProducto.save();

    //Registrar log
    Log.generateLog('producto.log', `Un producto ha sido creado: ${productoGuardado._id}, información: ${productoGuardado}  fecha: ${new Date()}`);

    return res.status(201).json(productoGuardado);
  } catch (error) {
    // Sanitizar y loggear el error completo (truncando HTML si apareciera)
    try {
      const raw = String(error && error.message ? error.message : error);
      const isHtml = raw.trim().toLowerCase().startsWith('<!doctype') || raw.trim().toLowerCase().startsWith('<html');
      const safe = isHtml ? (raw.slice(0, 200) + '... [HTML truncated]') : raw;
      console.error('Error en crearProducto:', safe);
      if (error && error.stack) console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    } catch (logErr) {
      console.error('Error al loggear el error en crearProducto:', error && error.message ? error.message : error);
    }

    return res.status(500).json({ mensaje: "Error al crear producto", detalle: error.message });
  }
};

/*editar un producto por su id*/
exports.actualizarProducto = async (req, res) => {
  let idProducto = req.params.idProducto || req.params.id;  // leer el id desde la URL 
  const datosProducto = req.body; // datos que llegan con el request
  try {

    let imagenes = [];
    //Si hay nuevas imagenes en la request
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file, "productos");
        imagenes.push(url);
      }
      datosProducto.imagenes = imagenes; // reemplazar completamente
    }
    // Validar id antes de actualizar
    if (!mongoose.isValidObjectId(idProducto)) {
      return res.status(400).json({ mensaje: 'Id de producto inválido' });
    }

    // actualizar y devolver el documento actualizado (new:true)
    const productoActualizado = await modeloProducto.findByIdAndUpdate(idProducto, datosProducto, { new: true });

    //Registrar log
    Log.generateLog('producto.log', `Un producto ha sido actualizado: ${productoActualizado}, fecha: ${new Date()}`);

    if (productoActualizado) {
      res.status(200).json(productoActualizado);
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    try {
      const raw = String(error && error.message ? error.message : error);
      const isHtml = raw.trim().toLowerCase().startsWith('<!doctype') || raw.trim().toLowerCase().startsWith('<html');
      const safe = isHtml ? (raw.slice(0, 200) + '... [HTML truncated]') : raw;
      console.error('Error en actualizarProducto:', safe);
      if (error && error.stack) console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    } catch (logErr) {
      console.error('Error al loggear el error en actualizarProducto:', error && error.message ? error.message : error);
    }

    res.status(500).json({ mensaje: "Error al actualizar producto", detalle: error.message });
  }
};

/*Borrado lógico de un producto por su id*/
exports.eliminarProducto = async (req, res) => {
  let idProducto = req.params.id;
  try {
    if (!mongoose.isValidObjectId(idProducto)) {
      return res.status(400).json({ mensaje: 'Id de producto inválido' });
    }
    // En lugar de eliminar físicamente, marcamos el producto como 'eliminado'.
    // Actualizamos ambos formatos: añadimos/actualizamos `estadoProducto` y
    // también `productoActivo`/`productoEliminado` para contemplar ambos esquemas.
    const productoActualizado = await modeloProducto.findByIdAndUpdate(
      idProducto,
      {
        estadoProducto: 'eliminado',
        productoActivo: false,
        productoEliminado: true
      },
      { new: true }
    );

    if (productoActualizado) {
      //Registrar log solo si existe el producto actualizado
      Log.generateLog('producto.log', `Un producto ha sido eliminado: ${productoActualizado._id}, fecha: ${new Date()}`);

      res.status(200).json({
        mensaje: "Producto eliminado lógicamente y desactivado",
        producto: productoActualizado
      });
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar producto", detalle: error.message });
  }
};

/* obtener Productos por Emprendimiento */
exports.obtenerProductosEmprendimiento = async (req, res) => {
  const idEmprendimiento = req.params.idEmprendimiento || req.params.id;
  try {
    if (!idEmprendimiento || !mongoose.isValidObjectId(idEmprendimiento)) {
      return res.status(400).json({ mensaje: 'Id de emprendimiento inválido' });
    }

    const productosDelEmprendimiento = await modeloProducto.find({
      idEmprendimiento: idEmprendimiento,
    });

    return res.status(200).json(productosDelEmprendimiento);
  } catch (error) {
    console.error('Error al obtener productos por emprendimiento:', error);
    return res.status(500).json({ mensaje: 'Error al obtener productos del emprendimiento', detalle: error.message });
  }
};

/* Obtener productos por usuario (todos los productos de los emprendimientos del usuario) */
exports.obtenerProductosPorUsuario = async (req, res) => {
  const idUsuario = req.params.id;
  try {
    console.log('Sesion lista productis: ',req.session)
    // Validar idUsuario si es necesario
    // Importamos modelo de emprendimiento dinámicamente para evitar ciclos
    const ModeloEmpr = require('../emprendimientos/emprendimiento.model');
    const mongoose = require('mongoose');

    // Obtener emprendimientos del usuario
    const emprendimientosUsuario = await ModeloEmpr.find({ usuario: new mongoose.Types.ObjectId(idUsuario), emprendimientoEliminado: false });
    const listaIdsEmpr = emprendimientosUsuario.map(e => e._id ? String(e._id) : null).filter(Boolean);

    if (listaIdsEmpr.length === 0) {
      return res.status(200).json([]); // el usuario no tiene emprendimientos
    }

    // Buscar productos cuyos idEmprendimiento estén en la lista
    const productosUsuario = await modeloProducto.find({
      idEmprendimiento: { $in: listaIdsEmpr },
      productoEliminado: false
    });

    return res.status(200).json(productosUsuario);
  } catch (error) {
    console.error('Error al obtener productos por usuario:', error);
    return res.status(500).json({ mensaje: 'Error al obtener productos por usuario', detalle: error.message });
  }
};

/* Obtener productos de una categoría específica  */
exports.obtenerProductosPorCategoria = async (req, res) => {
  const idCategoria = req.params.idCategoria || req.params.id;
  try {
    // Buscar la categoría en la colección `categorias` 
    const ModeloCategoria = require('../categorias/categorias.model');
    let categoriaEncontrada = null;
    if (idCategoria) {
      categoriaEncontrada = await ModeloCategoria.findById(idCategoria).lean();
    }

    if (!categoriaEncontrada || !categoriaEncontrada.nombreCategoria) {
      // Si no existe la categoría solicitada, devolvemos 404 en lugar de provocar un error
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    const nombreCategoria = String(categoriaEncontrada.nombreCategoria).trim();

    // Parámetros de filtro desde querystring, El frontend puede enviar valores como 'precio_asc' o 'precio_desc'
    const ordenarRaw = String(req.query.ordenar || '');
    // Normalizar cualquier variante que contenga 'asc' o 'desc'
    let ordenar = null;
    if (ordenarRaw.includes('asc')) ordenar = 'asc';
    else if (ordenarRaw.includes('desc')) ordenar = 'desc';

    // Parseo robusto de min/max (acepta '', null o valores no numéricos)
    let min = null;
    const valorMin = Number(req.query.min);
    if (!Number.isNaN(valorMin)) {
      min = valorMin;
    } else {
      // si no es un número válido, mantener null (ignorar filtro)
      min = null;
    }

    let max = null;
    const valorMax = Number(req.query.max);
    if (!Number.isNaN(valorMax)) {
      max = valorMax;
    } else {
      // si no es un número válido, mantener null (ignorar filtro)
      max = null;
    }

    // Pipeline de aggregation simple y claro:
    const pipeline = [];
    // 1) Match: categoría (comparación case-insensitive usando $expr/$toLower) y productos activos
    pipeline.push({
      $match: {
        $expr: {
          $eq: [{ $toLower: '$categoria' }, nombreCategoria.toLowerCase()]
        },
        $or: [{ productoActivo: true, productoEliminado: false }, { estadoProducto: 'activo' }]
      }
    });

    // 2) Si hay filtros de precio, aplicarlos
    if (min !== null || max !== null) {
      const rangoPrecio = {};
      if (min !== null && !Number.isNaN(min)) rangoPrecio.$gte = min;
      if (max !== null && !Number.isNaN(max)) rangoPrecio.$lte = max;
      if (Object.keys(rangoPrecio).length) {
        pipeline.push({ $match: { precio: rangoPrecio } });
      }
    }

    // 3) FILTRADO POR UBICACIÓN (opcional): departamento y/o ciudad
    // Si el cliente envía ?ubicacionEmprendimiento.departamento=... o ?ubicacionEmprendimiento.ciudad=...
    // hacemos un lookup simple a la colección 'emprendimientos' para leer su ubicación
    const depto = req.query['ubicacionEmprendimiento.departamento'] || req.query['departamento'] || null;
    const ciudad = req.query['ubicacionEmprendimiento.ciudad'] || req.query['ciudad'] || null;

    if (depto || ciudad) {
      // helper pequeño para escapar texto en RegExp
      const escapeRegexLocal = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Agregar lookup para traer la ubicacion del emprendimiento asociado
      pipeline.push({
        $lookup: {
          from: 'emprendimientos',
          let: { idEmpr: '$idEmprendimiento' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$_id', '$$idEmpr'] },
                    { $eq: [{ $toString: '$_id' }, '$$idEmpr'] }
                  ]
                }
              }
            },
            { $project: { ubicacionEmprendimiento: 1 } }
          ],
          as: 'emprendimiento'
        }
      });

      // Aplanar resultado del lookup
      pipeline.push({ $unwind: { path: '$emprendimiento', preserveNullAndEmptyArrays: true } });

      // Construir condiciones de match simples y claras para estudiantes
      const condicionesUbic = [];
      if (depto && ciudad) {
        const deptoR = new RegExp('^' + escapeRegexLocal(depto) + '$', 'i');
        const ciudadR = new RegExp('^' + escapeRegexLocal(ciudad) + '$', 'i');
        // coincidencia en campos de producto (si existen) o en el emprendimiento
        condicionesUbic.push({ $and: [ { 'ubicacionEmprendimiento.departamento': deptoR }, { 'ubicacionEmprendimiento.ciudad': ciudadR } ] });
        condicionesUbic.push({ $and: [ { 'emprendimiento.ubicacionEmprendimiento.departamento': deptoR }, { 'emprendimiento.ubicacionEmprendimiento.ciudad': ciudadR } ] });
        // fallback: buscar "Departamento, Ciudad" dentro de la descripcion del producto
        try {
          const textoExacto = `${depto}, ${ciudad}`;
          condicionesUbic.push({ descripcionProducto: { $regex: new RegExp(escapeRegexLocal(textoExacto), 'i') } });
        } catch (e) { /* si falla el regex, simplemente no usamos el fallback */ }
      } else if (depto) {
        const deptoR = new RegExp('^' + escapeRegexLocal(depto) + '$', 'i');
        condicionesUbic.push({ 'ubicacionEmprendimiento.departamento': deptoR });
        condicionesUbic.push({ 'emprendimiento.ubicacionEmprendimiento.departamento': deptoR });
        try { condicionesUbic.push({ descripcionProducto: { $regex: new RegExp(escapeRegexLocal(depto), 'i') } }); } catch (e) {}
      } else if (ciudad) {
        const ciudadR = new RegExp('^' + escapeRegexLocal(ciudad) + '$', 'i');
        condicionesUbic.push({ 'ubicacionEmprendimiento.ciudad': ciudadR });
        condicionesUbic.push({ 'emprendimiento.ubicacionEmprendimiento.ciudad': ciudadR });
        try { condicionesUbic.push({ descripcionProducto: { $regex: new RegExp(escapeRegexLocal(ciudad), 'i') } }); } catch (e) {}
      }

      if (condicionesUbic.length) {
        pipeline.push({ $match: { $or: condicionesUbic } });
      }
    }

    // 4) Ordenamiento si se solicita (ahora viene después de filtros)
    if (ordenar === 'asc' || ordenar === 'desc') {
      const direccion = ordenar === 'asc' ? 1 : -1;
      pipeline.push({ $sort: { precio: direccion } });
    }

    // Ejecutar aggregation con los filtros aplicados
    const productosEncontrados = await modeloProducto.aggregate(pipeline).exec();

    return res.status(200).json(productosEncontrados);
  } catch (error) {
    console.error('Error en obtenerProductosPorCategoria:', error);
    return res.status(500).json({ mensaje: "Error al consultar productos por categoría", detalle: error.message });
  }
};

/* Filtrar listado de todos los productos */
exports.filtrarProductos = async (req, res) => {
  try {
    // Helper pequeño para escapar texto en RegExp
    const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Leer parámetros desde querystring: ordenar, min, max
    const ordenarRaw = String(req.query.ordenar || '').toLowerCase();
    let ordenar = null;
    if (ordenarRaw.includes('asc')) ordenar = 'asc';
    else if (ordenarRaw.includes('desc')) ordenar = 'desc';

    // Parseo seguro de min/max
    let min = null;
    if (req.query.min !== undefined && req.query.min !== '') {
      const valorMin = Number(req.query.min);
      if (!Number.isNaN(valorMin)) min = valorMin;
    }
    let max = null;
    if (req.query.max !== undefined && req.query.max !== '') {
      const valorMax = Number(req.query.max);
      if (!Number.isNaN(valorMax)) max = valorMax;
    }

    // Pipeline de aggregation para todos los productos activos
    const pipeline = [];

    // 1) Match: productos activos (compatibilidad con ambos esquemas de estado)
    pipeline.push({
      $match: {
        $or: [{ productoActivo: true, productoEliminado: false }, { estadoProducto: 'activo' }]
      }
    });

    // 2) Filtrado por rango de precio si aplica
    if (min !== null || max !== null) {
      const rango = {};
      if (min !== null) rango.$gte = min;
      if (max !== null) rango.$lte = max;
      if (Object.keys(rango).length) pipeline.push({ $match: { precio: rango } });
    }

    // 2.b) Filtrado por ubicación (departamento/ciudad) si vienen en la query
    const depto = req.query['ubicacionEmprendimiento.departamento'] || req.query['departamento'] || null;
    const ciudad = req.query['ubicacionEmprendimiento.ciudad'] || req.query['ciudad'] || null;

    if (depto || ciudad) {
      // Hacemos lookup a la colección de emprendimientos para leer su ubicación
      // Usamos pipeline en el $lookup para intentar emparejar aunque id sea string u ObjectId
      pipeline.push({
        $lookup: {
          from: 'emprendimientos',
          let: { idEmpr: '$idEmprendimiento' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    // si idEmprendimiento guarda el mismo tipo que _id
                    { $eq: ['$_id', '$$idEmpr'] },
                    // o si idEmpr es string, comparamos con toString(_id)
                    { $eq: [{ $toString: '$_id' }, '$$idEmpr'] }
                  ]
                }
              }
            },
            { $project: { ubicacionEmprendimiento: 1 } }
          ],
          as: 'emprendimiento'
        }
      });

      // Aplanamos el array del lookup para facilitar los matches (puede no existir)
      pipeline.push({ $unwind: { path: '$emprendimiento', preserveNullAndEmptyArrays: true } });

      // Construir condiciones de match para ubicación
      const condiciones = [];

      if (depto && ciudad) {
        // ambos: departamento Y ciudad deben coincidir (en el producto o en el emprendimiento)
        // Usar RegExp anclado para coincidencia exacta case-insensitive
        const deptoRegex = new RegExp('^' + escapeRegex(depto) + '$', 'i');
        const ciudadRegex = new RegExp('^' + escapeRegex(ciudad) + '$', 'i');
        condiciones.push({ $and: [ { 'ubicacionEmprendimiento.departamento': deptoRegex }, { 'ubicacionEmprendimiento.ciudad': ciudadRegex } ] });
        condiciones.push({ $and: [ { 'emprendimiento.ubicacionEmprendimiento.departamento': deptoRegex }, { 'emprendimiento.ubicacionEmprendimiento.ciudad': ciudadRegex } ] });
        // Fallback: si la descripción del producto contiene "departamento, ciudad"
        try {
          const textoExacto = `${depto}, ${ciudad}`;
          condiciones.push({ descripcionProducto: { $regex: new RegExp(escapeRegex(textoExacto), 'i') } });
        } catch (e) {
          // si Regex falla, ignoramos este fallback
        }
      } else if (depto) {
        // solo departamento
        const deptoRegexSolo = new RegExp('^' + escapeRegex(depto) + '$', 'i');
        condiciones.push({ 'ubicacionEmprendimiento.departamento': deptoRegexSolo });
        condiciones.push({ 'emprendimiento.ubicacionEmprendimiento.departamento': deptoRegexSolo });
        // Fallback: descripción contiene el departamento
        try {
          condiciones.push({ descripcionProducto: { $regex: new RegExp(escapeRegex(depto), 'i') } });
        } catch (e) { }
      } else if (ciudad) {
        // solo ciudad
        const ciudadRegexSolo = new RegExp('^' + escapeRegex(ciudad) + '$', 'i');
        condiciones.push({ 'ubicacionEmprendimiento.ciudad': ciudadRegexSolo });
        condiciones.push({ 'emprendimiento.ubicacionEmprendimiento.ciudad': ciudadRegexSolo });
        // Fallback: descripción contiene la ciudad
        try {
          condiciones.push({ descripcionProducto: { $regex: new RegExp(escapeRegex(ciudad), 'i') } });
        } catch (e) { }
      }

      if (condiciones.length) {
        pipeline.push({ $match: { $or: condiciones } });
      }
    }

    // 3) Proyección mínima para la vista (se hace después del lookup y matches)
    pipeline.push({
      $project: {
        tituloProducto: 1,
        descripcionProducto: 1,
        precio: 1,
        idEmprendimiento: 1,
        categoria: 1,
        imagenes: 1,
        productoActivo: 1
      }
    });

    // 4) Ordenamiento si se solicita
    if (ordenar === 'asc' || ordenar === 'desc') {
      const dir = ordenar === 'asc' ? 1 : -1;
      pipeline.push({ $sort: { precio: dir } });
    }

    const resultados = await modeloProducto.aggregate(pipeline).exec();
    return res.status(200).json(resultados);
  } catch (error) {
    console.error('Error en filtrarProductos (aggregation):', error);
    return res.status(500).json({ mensaje: 'Error al filtrar productos', detalle: error.message });
  }
};