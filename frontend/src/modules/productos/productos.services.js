const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();
const { setCookie, getUpdatedHeaders } = require('../helpers');

// Base URL de la API (intenta leer de variables de entorno, con fallback)
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
// Headers mínimos (no exponemos API KEY al cliente, solo la usamos para backend->backend)
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Listar productos de un usuario */
exports.listarProductosUsuario = async (req, res) => {
  // Obtener id del usuario 
  const id = req.usuarioAutenticado.idUsuario;
  const usuario = req.usuarioAutenticado;

  // Valores por defecto para la vista (nombres locales explicitos)
  let listaProductos = [];
  let listaEmprendimientos = [];
  let listaCategorias = [];
  let listaEtiquetas = [];

  // Función para convertir respuestas de la API en arrays 
  const obtenerArray = async (ruta) => {
    try {
      const resp = await axios.get(ruta, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
      setCookie(resp,res);
      const data = resp.data;
      return data;
    } catch (err) {
      console.error(`Fallo al obtener ${ruta}:`, err.message);
    }
  };

  /* buscar id en objeto */
  function obtenerIdNormalizado(obj, claves = []) {
    // Si no hay objeto válido, devolvemos null
    if (!obj || typeof obj !== 'object') return null;
    // Buscamos la primera clave que tenga un valor no nulo/undef
    const claveEncontrada = claves.find(c => obj[c] !== undefined && obj[c] !== null);
    // Si no encontramos ninguna, retornamos null
    if (!claveEncontrada) return null;
    // Normalizamos a string y retornamos
    return String(obj[claveEncontrada]);
  }

  try {
    // Obtener emprendimientos y productos del usuario
    listaEmprendimientos = await obtenerArray(`${API_BASE_URL}/emprendimientos/usuario/${id}`);
    listaProductos = await obtenerArray(`${API_BASE_URL}/productos/usuarios/${id}`);
    // Obtener categorias desde la API del backend
    const categoriasRespuesta = await obtenerArray(`${API_BASE_URL}/categorias`);    // Si la respuesta es un array lo usamos, si no dejamos la lista vacía
    listaCategorias = Array.isArray(categoriasRespuesta) ? categoriasRespuesta : [];
    // Obtener etiquetas desde la API del backend (colección 'etiquetas')
    const etiquetasRespuesta = await obtenerArray(`${API_BASE_URL}/etiquetas`);    // Si la respuesta es un array lo usamos, si no dejamos la lista vacía
    listaEtiquetas = Array.isArray(etiquetasRespuesta) ? etiquetasRespuesta : [];

    // Objeto donde key = idEmprendimiento, value = nombre
    const mapaNombres = {};
    for (const emp of listaEmprendimientos) {
      const idEmp = obtenerIdNormalizado(emp, ['_id']);
      mapaNombres[String(idEmp)] = emp.nombreEmprendimiento;
    }

    // Recorrer productos y completar nombreEmprendimiento desde el obeto
    for (const producto of listaProductos) {
      const idEmpr = obtenerIdNormalizado(producto, ['idEmprendimiento',]);
      if (idEmpr) {
        producto.nombreEmprendimiento = mapaNombres[String(idEmpr)];
      } else {
        producto.nombreEmprendimiento = '';
      };
    }

    // Render SSR de la vista con los nombres que la vista espera 
    return res.render('pages/usuario-productos-listar', {
      usuario,
      productos: listaProductos,
      emprendimientos: listaEmprendimientos,
      categorias: listaCategorias,
      etiquetas: listaEtiquetas,
      apiBaseUrl: API_BASE_URL
    });
  } catch (error) {
    console.error('Error al listar productos del usuario:', error.message);
  }
};

/* mostrarDetalleProducto */
exports.mostrarDetalleProducto = async (req, res) => {
  console.log('hola soy yo otra vez')
  try {
    // Obtener id del producto desde la URL y usuario autenticado
    const idProducto = req.params.id;
    const usuario = req.usuarioAutenticado;
    // Petición al backend para obtener detalle del producto
    const respuesta = await axios.get(`${API_BASE_URL}/productos/${idProducto}`, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
    setCookie(respuesta,res);
    // Si se obtiene el producto se renderiza la vista      
    if (respuesta && respuesta.status === 200 && respuesta.data) {
      const producto = respuesta.data;
      
      // obtener nombre del emprendimiento
      const resp = await axios.get(`${API_BASE_URL}/emprendimientos/${producto.idEmprendimiento._id}`, { headers: getUpdatedHeaders(req) });
      
      // Pedir listas relacionadas
      const listaEmprendimientos = await axios.get(`${API_BASE_URL}/emprendimientos/usuario/${usuario.idUsuario}`, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
      const listaCategorias = await axios.get(`${API_BASE_URL}/categorias`, { headers: getUpdatedHeaders(req) }, { withCredentials: true });
      const listaEtiquetas = await axios.get(`${API_BASE_URL}/etiquetas`, { headers: getUpdatedHeaders(req) }, { withCredentials: true });

      const emprendimientos = listaEmprendimientos.data;
      const categorias = listaCategorias.data;
      const etiquetas = listaEtiquetas.data

      const imagenes = producto.imagenes
      const emprendimiento = resp.data.nombreEmprendimiento
      console.log(emprendimiento)

      // muestra la página “usuario-producto-ver” y le pasa los datos del producto y del usuario para que la plantilla los muestre dinámicamente.
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ producto, usuario, emprendimiento, emprendimientos, categorias, etiquetas, imagenes });
      } else {
        return res.render('pages/usuario-producto-ver', { producto, usuario, emprendimiento, emprendimientos, categorias, etiquetas, imagenes });
      }
    } else {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    return res.status(500).render('pages/error', { error: 'Error al obtener detalle de producto', message: error.message || String(error) });
  }
};

/* Editar producto: valida datos, arma FormData y actualiza en backend */
exports.procesarEditarProducto = async (req, res) => {
  try {
    const idProducto = req.params.id; // id del producto a editar
    const datos = req.body; // datos enviados desde el formulario
    const formData = new FormData(); // objeto para enviar datos al backend
    const usuario = req.usuarioAutenticado;
    // Campos de texto principales
    
    const camposTexto = {
      tituloProducto: datos.tituloProducto,
      descripcionProducto: datos.descripcionProducto,
      precio: datos.precio,
      idEmprendimiento: datos.idEmprendimiento,
      categoria: datos.categoria,
      productoActivo: datos.productoActivo
    };
    // Agregar al FormData los campos que existan (clave : valor)
    for (const [clave, valor] of Object.entries(camposTexto)) {
      if (valor) formData.append(clave, valor);
    }

    // Manejo de etiquetas (el backend espera array)
    let etiquetas = [];
    try {
      etiquetas = JSON.parse(datos.etiquetas || '[]');
    } catch { }
    // Agregar cada etiqueta individual al FormData
    etiquetas.forEach(et => formData.append('etiquetas', et));

    // Manejo de imágenes (si el usuario subió nuevas)
    if (req.files?.length) {
      req.files.forEach(archivo => {
        formData.append('imagenes', archivo.buffer, {
          filename: archivo.originalname,
          contentType: archivo.mimetype,
          knownLength: archivo.size
        });
      });
    }
    
    // Cabeceras HTTP necesarias para enviar FormData
    const cabeceras = {
      ... getUpdatedHeaders(req),
      ... formData.getHeaders()
    }
    // Petición PUT al backend para actualizar producto
    const ruta = `${API_BASE_URL}/productos/${idProducto}`;
    const respuesta = await axios.put(ruta, formData, { headers: cabeceras , maxBodyLength: Infinity }, { withCredentials: true });
    setCookie(respuesta)
    const producto = respuesta.data
    const emprendimiento = producto.idEmprendimiento
    const imagenes = producto.imagenes
    // Validar respuesta
    if (respuesta?.status === 200 || respuesta?.status === 201) {
      return res.redirect(`/productos/usuario-productos/ver/${idProducto}`); // redirige al listado
    }
    return res.status(500).send('Respuesta inesperada del backend al actualizar producto');

  } catch (error) {
    // Captura de errores y log en consola
    console.error('Error en procesarEditarProducto:', error.response?.data || error.message || error);

    // Manejar error específico de emprendimiento inactivo
    if (error.response?.status === 400 && error.response?.data?.emprendimientoInactivo) {
      return res.status(400).json({
        mensaje: error.response.data.mensaje,
        campo: error.response.data.campo,
        emprendimientoInactivo: true
      });
    }
    return res.status(500).send('Error procesando la edición del producto');
  }
};

/*  Crear un nuevo producto */
exports.procesarCrearProducto = async (req, res) => {
  try {
    // Construir el objeto FormData
    const formData = new FormData();

    // Campos de texto que se esperan según el modal
    const tituloProducto = req.body.tituloProducto;
    const descripcionProducto = req.body.descripcionProducto;
    const precioProducto = req.body.precio;
    const idEmprendimiento = req.body.idEmprendimiento;
    const categoria = req.body.categoria;
    // etiquetas pueden venir como JSON string desde el input hidden
    const etiquetasCampo = req.body.etiquetas || '[]';

    // Añadir los campos de texto al FormData
    if (tituloProducto) formData.append('tituloProducto', tituloProducto);
    if (descripcionProducto) formData.append('descripcionProducto', descripcionProducto);
    if (precioProducto) formData.append('precio', precioProducto);
    if (idEmprendimiento) formData.append('idEmprendimiento', idEmprendimiento);
    if (categoria) formData.append('categoria', categoria);

    // Manejo de etiquetas: el backend espera un array
    let etiquetasArray = [];
    // Intenta interpretar (parsear) etiquetasCampo como JSON
    const parseado = JSON.parse(etiquetasCampo);
    // Si el resultado del parseo es un arreglo, se guarda en etiquetasArray
    if (Array.isArray(parseado)) {
      etiquetasArray = parseado;
    }

    // Añadir cada etiqueta al FormData
    if (etiquetasArray.length > 0) {
      for (const etiqueta of etiquetasArray) {
        formData.append('etiquetas', etiqueta);
      }
    }

    for (const archivo of req.files) {
      // Agrega el archivo al objeto formData, enviando su contenido binario (buffer) junto con metadatos.
      formData.append('imagenes', archivo.buffer, {
        filename: archivo.originalname,//Guarda el nombre original del archivo para conservarlo en el destino.
        contentType: archivo.mimetype, //Indica el tipo MIME real del archivo (ej. image/jpeg).
        knownLength: archivo.size //Especifica el tamaño del archivo en bytes para el servidor receptor.
      });
    }

    // Obtiene las cabeceras HTTP necesarias (como Content-Type con multipart/form-data y su límite) para enviar correctamente el formData en una petición.
  const cabeceras = {
      ... getUpdatedHeaders(req),
      ... formData.getHeaders()
    }
    // Enviar al backend usando axios.
    const rutaCrearProducto = `${API_BASE_URL}/productos`;
    const respuestaBackend = await axios.post(rutaCrearProducto, formData, { headers: cabeceras, maxBodyLength: Infinity }, { withCredentials: true });
    setCookie(respuestaBackend,res);

    // Si el backend responde con creado (201) o similar, refrescamos la página actual
    if (respuestaBackend && (respuestaBackend.status === 200 || respuestaBackend.status === 201)) {
      // Refrescar la página desde donde se creó el producto
      return res.redirect(req.get('referer') || '/');
    } else {
      console.error('Respuesta inesperada del backend al crear producto:', respuestaBackend && respuestaBackend.status);
      return res.status(500).render('pages/error', { error: 'Error al crear producto', message: 'Respuesta inesperada del backend' });
    }

  } catch (error) {
    // Mostrar más detalle si el backend devolvió información
    if (error && error.response && error.response.data) {
      console.error('Error en procesarCrearProducto (frontend). Respuesta del backend:', error.response.status, error.response.data);
    } else {
      console.error('Error en procesarCrearProducto (frontend):', error && error.message ? error.message : error);
    }
    return res.status(500).render('pages/error', { error: 'Fallo al crear producto', message: (error.response && error.response.data && (error.response.data.mensaje || JSON.stringify(error.response.data))) || error.message || String(error) });
  }
};

/* Eliminar un producto */
exports.procesarEliminarProducto = async (req, res) => {
  try {
    const idProducto = req.params.id; // id del producto a eliminar
    // Campos enviados desde el formulario
    const { usuario, productoEliminado } = req.body;

    // Construimos la ruta al backend real
    const rutaBackend = `${API_BASE_URL}/productos/${idProducto}/eliminar`;
    setCookie(rutaBackend,res);

    // Preparar payload simple: { productoEliminado: true }
    const payload = { productoEliminado: productoEliminado === true };

    // Hacemos la petición PATCH al backend
    await axios.patch(rutaBackend, payload, { headers: getUpdatedHeaders(req) }, { withCredentials: true });

    // Redirigimos al listado del usuario (SSR)
    return res.redirect('/productos/usuario-productos');
  } catch (error) {
    console.error('Error al procesar eliminación de producto (frontend):', error.message || error);
    return res.status(500).render('pages/error', { error: 'Error al eliminar producto', message: error.message || String(error) });
  }
};

/* Mostrar productos filtrados por categoría (SSR) */
exports.mostrarProductosPorCategoria = async (req, res) => {
  try {
    const idCategoria = req.params.id;
    // Construir URL con posibles query params
    const qs = [];
    if (req.query.ordenar) qs.push(`ordenar=${encodeURIComponent(req.query.ordenar)}`);
    if (req.query.min) qs.push(`min=${encodeURIComponent(req.query.min)}`);
    if (req.query.max) qs.push(`max=${encodeURIComponent(req.query.max)}`);
  // Incluir filtros de ubicación si vienen desde la querystring
  if (req.query['ubicacionEmprendimiento.departamento']) qs.push(`ubicacionEmprendimiento.departamento=${encodeURIComponent(req.query['ubicacionEmprendimiento.departamento'])}`);
  if (req.query['ubicacionEmprendimiento.ciudad']) qs.push(`ubicacionEmprendimiento.ciudad=${encodeURIComponent(req.query['ubicacionEmprendimiento.ciudad'])}`);
    const ruta = `${API_BASE_URL}/productos/categoria/${idCategoria}${qs.length ? ('?' + qs.join('&')) : ''}`;
    //explicacion: Si req.query = { ordenar: 'precio_desc', min: '10' } y API_BASE_URL = 'http://localhost:4006' y idCategoria = '68a6b7', ruta será: http://localhost:4006/productos/categoria/68a6b7?ordenar=precio_desc&min=10

    // Llamada al backend
    const resp = await axios.get(ruta, { headers: HEADERS });
    const productos = Array.isArray(resp.data) ? resp.data : [];

    // Construir arreglo mínimo de imagenes para la vista: se espera un array de objetos { idProducto, urlImagen }
    const imagenes = [];
    productos.forEach(p => {
      if (Array.isArray(p.imagenes) && p.imagenes.length) {
        // tomar la primera imagen disponible
        imagenes.push({ idProducto: String(p._id || p.id || ''), urlImagen: p.imagenes[0] });
      }
    });

    // Preparamos los valores actuales de filtros para que la vista los mantenga
    const filtrosValores = {
      ordenar: req.query.ordenar || '',
      min: req.query.min || '',
      max: req.query.max || ''
    };
    // Añadir valores de ubicación para que la vista pueda preseleccionar los selects
    filtrosValores['ubicacionEmprendimiento.departamento'] = req.query['ubicacionEmprendimiento.departamento'] || '';
    filtrosValores['ubicacionEmprendimiento.ciudad'] = req.query['ubicacionEmprendimiento.ciudad'] || '';

    // Render SSR: la vista `productos-filtros.ejs` espera `productos`, `imagenes` y `filtrosValores`
    return res.render('pages/productos-filtros', { productos, imagenes, filtrosValores });
  } catch (error) {
    console.error('Error en mostrarProductosPorCategoria (frontend):', error.message || error);
    return res.status(500).render('pages/error', { error: 'Error al obtener productos', message: error.message || String(error) });
  }
};

/* Mostrar todos los productos filtrados */
exports.mostrarProductosFiltrados = async (req, res) => {
  try {
    // Construir querystring para llamar al backend
    const qs = [];
    if (req.query.ordenar) qs.push(`ordenar=${encodeURIComponent(req.query.ordenar)}`);
    if (req.query.min) qs.push(`min=${encodeURIComponent(req.query.min)}`);
    if (req.query.max) qs.push(`max=${encodeURIComponent(req.query.max)}`);
  // Agregar filtros de ubicación cuando existan
  if (req.query['ubicacionEmprendimiento.departamento']) qs.push(`ubicacionEmprendimiento.departamento=${encodeURIComponent(req.query['ubicacionEmprendimiento.departamento'])}`);
  if (req.query['ubicacionEmprendimiento.ciudad']) qs.push(`ubicacionEmprendimiento.ciudad=${encodeURIComponent(req.query['ubicacionEmprendimiento.ciudad'])}`);

    const ruta = `${API_BASE_URL}/productos/filtrar${qs.length ? ('?' + qs.join('&')) : ''}`;
    const resp = await axios.get(ruta, { headers: HEADERS });
    const productos = Array.isArray(resp.data) ? resp.data : [];

    // Construir arreglo simple de imagenes para la vista (primera imagen si existe)
    const imagenes = [];
    productos.forEach(p => {
      if (Array.isArray(p.imagenes) && p.imagenes.length) {
        imagenes.push({ idProducto: String(p._id || p.id || ''), urlImagen: p.imagenes[0] });
      }
    });

    const filtrosValores = {
      ordenar: req.query.ordenar || '',
      min: req.query.min || '',
      max: req.query.max || ''
    };
    // Pasar ubicación a la vista para preseleccionar selects
    filtrosValores['ubicacionEmprendimiento.departamento'] = req.query['ubicacionEmprendimiento.departamento'] || '';
    filtrosValores['ubicacionEmprendimiento.ciudad'] = req.query['ubicacionEmprendimiento.ciudad'] || '';

    // Render SSR: productos.ejs espera `productos` e `imagenes`
    return res.render('pages/productos', { productos, imagenes, filtrosValores });
  } catch (error) {
    console.error('Error en mostrarProductosFiltrados (frontend):', error.message || error);
    return res.status(500).render('pages/error', { error: 'Error al obtener productos', message: error.message || String(error) });
  }
};

/* Mostrar resultados de búsqueda  */
exports.mostrarResultadosBusqueda = async (req, res) => {
  try {
    // Leer término de búsqueda desde querystring (campo 'q' del formulario)
    const termino = (req.query.q || '').trim();

    // Si no hay término, renderizamos la página de productos vacía
    if (!termino) {
      return res.render('pages/productos', { productos: [], imagenes: [], filtrosValores: {} });
    }

  // Construir querystring con filtros opcionales (ordenar, min, max)
  const qs = [];
  if (req.query.ordenar) qs.push(`ordenar=${encodeURIComponent(req.query.ordenar)}`);
  if (req.query.min) qs.push(`min=${encodeURIComponent(req.query.min)}`);
  if (req.query.max) qs.push(`max=${encodeURIComponent(req.query.max)}`);
  // Añadir ubicación si existe en la query
  if (req.query['ubicacionEmprendimiento.departamento']) qs.push(`ubicacionEmprendimiento.departamento=${encodeURIComponent(req.query['ubicacionEmprendimiento.departamento'])}`);
  if (req.query['ubicacionEmprendimiento.ciudad']) qs.push(`ubicacionEmprendimiento.ciudad=${encodeURIComponent(req.query['ubicacionEmprendimiento.ciudad'])}`);

  // Llamada al backend que busca por nombre y aplica filtros: /productos/nombre/:nombre?...
  const ruta = `${API_BASE_URL}/productos/nombre/${encodeURIComponent(termino)}${qs.length ? ('?' + qs.join('&')) : ''}`;
  let productos = [];
  try {
    const resp = await axios.get(ruta, { headers: HEADERS });
    // Asegurar que la respuesta sea un array
    productos = Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    // Si la API responde 404 (no encontrado), lo tratamos como 'sin productos' y renderizamos la vista vacía.
    if (err.response && err.response.status === 404) {
      productos = [];
    } else {
      // Para otros errores, volvemos a lanzar para que el catch externo lo maneje
      throw err;
    }
  }

    // Crear arreglo mínimo de imágenes (primera imagen si existe)
    const imagenes = [];
    productos.forEach(p => {
      if (Array.isArray(p.imagenes) && p.imagenes.length) {
        imagenes.push({ idProducto: String(p._id || p.id || ''), urlImagen: p.imagenes[0] });
      }
    });

    // Preparar valores de filtros para que la vista mantenga los controles
    const filtrosValores = {
      q: termino,
      ordenar: req.query.ordenar || '',
      min: req.query.min || '',
      max: req.query.max || ''
    };
    // Incluir ubicación para la vista
    filtrosValores['ubicacionEmprendimiento.departamento'] = req.query['ubicacionEmprendimiento.departamento'] || '';
    filtrosValores['ubicacionEmprendimiento.ciudad'] = req.query['ubicacionEmprendimiento.ciudad'] || '';

    // Render simple de la vista de productos con los resultados y filtros actuales
    return res.render('pages/productos', { productos, imagenes, filtrosValores });
  } catch (error) {
    console.error('Error en mostrarResultadosBusqueda (frontend):', error.message || error);
    return res.status(500).render('pages/error', { error: 'Error al buscar productos', message: error.message || String(error) });
  }
};