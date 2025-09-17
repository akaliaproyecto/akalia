const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// Base URL de la API (intenta leer de variables de entorno, con fallback)
const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
// Headers mínimos (no exponemos API KEY al cliente, solo la usamos para backend->backend)
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Listar productos de un usuario */
exports.listarProductosUsuario = async (req, res) => {
  // Obtener id del usuario 
  const id = req.usuarioAutenticado.idPersona;
  const usuario = req.usuarioAutenticado;

  // Valores por defecto para la vista (nombres locales explicitos)
  let listaProductos = [];
  let listaEmprendimientos = [];
  let listaCategorias = [];
  let listaEtiquetas = [];

  // Función para convertir respuestas de la API en arrays 
  const obtenerArray = async (ruta) => {
    try {
      const resp = await axios.get(ruta, { headers: HEADERS });
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
    const categoriasRespuesta = await obtenerArray(`${API_BASE_URL}/categorias`);
    // Si la respuesta es un array lo usamos, si no dejamos la lista vacía
    listaCategorias = Array.isArray(categoriasRespuesta) ? categoriasRespuesta : [];
    // Obtener etiquetas desde la API del backend (colección 'etiquetas')
    const etiquetasRespuesta = await obtenerArray(`${API_BASE_URL}/etiquetas`);
    // Si la respuesta es un array lo usamos, si no dejamos la lista vacía
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
  try {
    // Obtener id del producto desde la URL y usuario autenticado
    const idProducto = req.params.id;
    const usuario = req.usuarioAutenticado;

    // Petición al backend para obtener detalle del producto
    const respuesta = await axios.get(`${API_BASE_URL}/productos/${idProducto}`, { headers: HEADERS });

    // Si se obtiene el producto se renderiza la vista      
    if (respuesta && respuesta.status === 200 && respuesta.data) {
      const producto = respuesta.data;

      // obtener nombre de la categoría
      try {
        if (producto && producto.categoria) {
          // Se hace la petición a la API para obtener el nombre de la categoría
          const respCategoria = await axios.get(`${API_BASE_URL}/categorias/${producto.categoria}`, { headers: HEADERS });
          if (respCategoria && respCategoria.status === 200 && respCategoria.data) {
            // Guarda el nombre en una propiedad nueva `categoriaNombre` para usarla en la vista.
            producto.categoriaNombre = respCategoria.data.nombreCategoria
          }
        } else {
          // Si no hay categoría, dejamos un texto vacío
          producto.categoriaNombre = '';
        }
      } catch (errCat) {
        if (producto.categoria) {
          producto.categoriaNombre = String(producto.categoria);
        } else {
          producto.categoriaNombre = '';
        }
      }
      // muestra la página “usuario-producto-ver” y le pasa los datos del producto y del usuario para que la plantilla los muestre dinámicamente.
      return res.render('pages/usuario-producto-ver', { producto, usuario });
    } else {
      return res.status(404).render('pages/error', { error: 'Producto no encontrado' });
    }
  } catch (error) {
    return res.status(500).render('pages/error', { error: 'Error al obtener detalle de producto', message: error.message || String(error) });
  }
};

/* Cargar datos de producto desde el backend para mostrarlos en la vista de edición */
exports.mostrarEditarProducto = async (req, res) => {
  try {
    const idProducto = req.params.id; // id del producto a editar
    const usuario = req.usuarioAutenticado; // usuario que está autenticado

    // Pide datos al backend usando axios
    const pedirLista = async (url) => {
      const r = await axios.get(url, { headers: HEADERS });
      return r.data;
    };

    // Pedir producto al backend
    const respuesta = await axios.get(`${API_BASE_URL}/productos/${idProducto}`, { headers: HEADERS });
    if (respuesta.status !== 200 || !respuesta.data) return res.status(404).send('Producto no encontrado');

    const producto = respuesta.data;  // datos del producto recibido

    // Pedir listas relacionadas
    const listaEmprendimientos = await pedirLista(`${API_BASE_URL}/emprendimientos/usuario/${usuario.idPersona}`);
    const listaCategorias = await pedirLista(`${API_BASE_URL}/categorias`);
    const listaEtiquetas = await pedirLista(`${API_BASE_URL}/etiquetas`);

    // Renderizar el partial que se insertará en el modal
    return res.render('partials/usuario-producto-editar', {
      usuario,
      producto,
      imagenes: producto.imagenes || [],
      emprendimientos: listaEmprendimientos,
      categorias: listaCategorias,
      etiquetas: listaEtiquetas || []
    });

  } catch (error) {
    // Error inesperado
    return res.status(500).send('Error al obtener datos del producto');
  }
};

/* Editar producto: valida datos, arma FormData y actualiza en backend */
exports.procesarEditarProducto = async (req, res) => {
  try {
    const idProducto = req.params.id; // id del producto a editar
    const datos = req.body; // datos enviados desde el formulario
    const formData = new FormData(); // objeto para enviar datos al backend

    // Campos de texto principales
    const camposTexto = {
      tituloProducto: datos.tituloProducto,
      descripcionProducto: datos.descripcionProducto,
      precio: datos.precio,
      idEmprendimiento: datos.idEmprendimiento,
      categoria: datos.categoria
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
    const cabeceras = formData.getHeaders();
    if (process.env.API_KEY) cabeceras['akalia-api-key'] = process.env.API_KEY;

    // Petición PUT al backend para actualizar producto
    const ruta = `${API_BASE_URL}/productos/${idProducto}`;
    const respuesta = await axios.put(ruta, formData, { headers: cabeceras, maxBodyLength: Infinity });

    // Validar respuesta
    if (respuesta?.status === 200 || respuesta?.status === 201) {
      return res.redirect('/productos/usuario-productos'); // redirige al listado
    }
    return res.status(500).send('Respuesta inesperada del backend al actualizar producto');

  } catch (error) {
    // Captura de errores y log en consola
    console.error('Error en procesarEditarProducto:', error.response?.data || error.message || error);
    return res.status(500).send('Error procesando la edición del producto');
  }
};

/* Crear un nuevo producto */
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
    const cabeceras = formData.getHeaders();

    // Añadir API KEY 
    if (process.env.API_KEY) {
      cabeceras['akalia-api-key'] = process.env.API_KEY;
    }

    // Enviar al backend usando axios.
    const rutaCrearProducto = `${API_BASE_URL}/productos`;
    const respuestaBackend = await axios.post(rutaCrearProducto, formData, { headers: cabeceras, maxBodyLength: Infinity });

    // Si el backend responde con creado (201) o similar, redirigimos a la lista de productos
    if (respuestaBackend && (respuestaBackend.status === 200 || respuestaBackend.status === 201)) {
      // Redirigimos al usuario a la vista donde están sus productos
      return res.redirect('/productos/usuario-productos');
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