const axios = require('axios');
axios.defaults.withCredentials = true;
const { setCookie, getUpdatedHeaders } = require('../helpers');

require('dotenv').config();
const formData = require('form-data');

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4006';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };
/* Listar emprendimientos de un usuario y renderizar la vista */
exports.listarEmprendimientosUsuario = async (req, res) => {
  // Preferir id desde sesión/autenticación. Si se pasa en params, lo usamos solo para mostrar
  const id = req.usuarioAutenticado?.idUsuario || req.params?.id;
  if (!id) {
    // Si no hay id conocido, redirigir al login o a una página segura
    return res.redirect('/?error=Debes+iniciar+sesion');
  }
  const usuario = req.usuarioAutenticado || { idUsuario: id };
  let emprendimientos = [];

  try {
    const response = await axios.get(`${API_BASE_URL}/emprendimientos/usuario/${id}`, { headers: getUpdatedHeaders(req) });
    setCookie(response,res);
    if (Array.isArray(response.data)) emprendimientos = response.data;
    // Renderiza la vista con las variables que ya espera el template
    // NOTA: no exponemos la apiKey al cliente para evitar filtración de credenciales.
    return res.render('pages/usuario-emprendimientos-listar', {
      usuario,
      emprendimientos,
      apiBaseUrl: API_BASE_URL
    });

  } catch (error) {
    console.error('Error al listar emprendimiento:', error.message);
    res.status(500).render('pages/error', {
      error: 'Error al listar emprendimiento',
      message: 'No se pudo guardar el emprendimiento. Verifica los datos o intenta más tarde.'
    });
  }
}
/* Agregar un nuevo emprendimiento */
exports.agregarEmprendimiento = async (req, res) => {
  try {
    const { usuario, nombreEmprendimiento, descripcionEmprendimiento } = req.body;
    const ciudad = req.body['ubicacionEmprendimiento.ciudad'];
    const departamento = req.body['ubicacionEmprendimiento.departamento'];

    const formN = new formData();

    const payload = {
      usuario,
      nombreEmprendimiento,
      descripcionEmprendimiento,
      ubicacionEmprendimiento: {
        departamento: departamento,
        ciudad: ciudad
      }
    };

    formN.append('payload', JSON.stringify(payload))
    if (req.file) {
      formN.append('logo', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
    }
    const headers = {
      ... getUpdatedHeaders(req),
      ... formN.getHeaders()
    };

    console.log(headers)
    // Enviar al backend real 
    const resp = await axios.post(`${API_BASE_URL}/emprendimientos`, formN, { headers });
    setCookie(resp,res);
    // Redirigir al listado de emprendimientos del usuario sin exponer el id en la URL.
    // La vista tomará el id desde la sesión (req.usuarioAutenticado) cuando sea necesario.
    res.redirect('/usuario-emprendimientos');
  } catch (error) {
    console.error('Error al crear emprendimiento:', error.message, error.response?.data);
    res.status(500).render('pages/error', {
      error: 'Error al crear emprendimiento',
      message: 'No se pudo guardar el emprendimiento. Verifica los datos o intenta más tarde.'
    });
  }
};

/* Obtener detalle de un emprendimiento + productos (proxy) */
exports.obtenerDetalleEmprendimiento = async (req, res) => {
  const id = req.params?.id;
  if (!id) return res.status(400).json({ error: 'Id requerido' });

  let emprendimiento = null;

  try {
    const resp = await axios.get(`${API_BASE_URL}/emprendimientos/${id}`, { headers: getUpdatedHeaders(req) });
    setCookie(resp,res);
    emprendimiento = Array.isArray(resp.data) ? resp.data[0] : (resp.data.emprendimiento || resp.data.data || resp.data);
    
    const usuario = emprendimiento.usuario;
    const respProd = await axios.get(`${API_BASE_URL}/productos/emprendimiento/${id}`, { headers: getUpdatedHeaders(req) });
    setCookie(respProd,res);
    const listaEtiquetas = await axios.get(`${API_BASE_URL}/etiquetas`, { headers: getUpdatedHeaders(req) });
    setCookie(listaEtiquetas,res);
    const etiquetas = listaEtiquetas.data

    const listaCategorias = await axios.get(`${API_BASE_URL}/categorias`, { headers: getUpdatedHeaders(req) });
    setCookie(listaCategorias,res);

    const categorias = listaCategorias.data
    let productos = [];
    if (respProd && respProd.data) {
      // Esperamos que el backend devuelva un array de productos
      if (Array.isArray(respProd.data)) productos = respProd.data;
      else if (Array.isArray(respProd.data.productos)) productos = respProd.data.productos;
      else if (Array.isArray(respProd.data.data)) productos = respProd.data.data;
    }

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ emprendimiento });
    } else {
      return res.render('pages/usuario-emprendimiento-ver', { emprendimiento, productos, usuario, etiquetas, categorias });
    }
  } catch (error) {
    console.error('Error al mostrar emprendimiento:', error.message);
    res.status(500).render('pages/error', {
      error: 'Error al mostrar emprendimiento',
      message: 'No se pudo mostrar el emprendimiento. Intenta más tarde.'
    });
  }
};

/* Editar un nuevo emprendimiento */
exports.editarEmprendimiento = async (req, res) => {
  try {
    const { usuario, idEmprendimiento, nombreEmprendimiento, descripcionEmprendimiento, emprendimientoActivo } = req.body;
    
    const ciudad = req.body['ubicacionEmprendimiento.ciudad']
    const departamento = req.body['ubicacionEmprendimiento.departamento']

    const formN = new formData();

    const payload = {
      nombreEmprendimiento,
      descripcionEmprendimiento,
      emprendimientoActivo,
      ubicacionEmprendimiento: {
        departamento: departamento,
        ciudad: ciudad
      }
    };

    formN.append('payload', JSON.stringify(payload));

    if (req.file) {
      formN.append('logo', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
    }
    const headers = {
      ... getUpdatedHeaders(req),
      ... formN.getHeaders()
    };
    
    // Enviar al backend real 
    await axios.put(`${API_BASE_URL}/emprendimientos/${idEmprendimiento}`, formN, { headers });

    // Redirigir al listado anterior o al listado principal si no hay referer
    const referer = req.get('referer');
    if (referer) return res.redirect(referer);
    return res.redirect('/usuario-emprendimientos');
  } catch (error) {
    console.error('Error al editar emprendimiento:', error.message);
    res.status(500).render('pages/error', {
      error: 'Error al editar emprendimiento',
      message: 'No se pudo editar el emprendimiento. Verifica los datos o intenta más tarde.'
    });
  }
};

/* Eliminar un nuevo emprendimiento */
exports.eliminarEmprendimiento = async (req, res) => {
  const idEmprendimiento = req.params.id;
  const { usuario, emprendimientoEliminado } = req.body;
  try {
    // Petición PATCH para cambiar estado en el servidor a eliminado:true
    const resp= await axios.patch(`${API_BASE_URL}/emprendimientos/${idEmprendimiento}`,
      { emprendimientoEliminado },
      { headers: getUpdatedHeaders(req) }
    );
    // Redirigir al listado sin exponer id de usuario
    res.redirect('/usuario-emprendimientos');
  } catch (error) {
    console.error('Error al eliminar emprendimiento:', error.message);
    res.status(500).render('pages/error', {
      error: 'Error al eliminar emprendimiento',
      message: 'No se pudo eliminar el emprendimiento. Verifica los datos o intenta más tarde.'
    });
  }
}

/* redirigir a listado de emprendimientos si no hay id en la URL */
exports.redirigirSiNoHayIdEnUrl = async (req, res) => {
  return res.redirect('/usuario-emprendimientos');
};

/* Verificar si un emprendimiento está activo (proxy al backend) */
exports.verificarEmprendimientoActivo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hacer proxy al backend
    const response = await axios.get(`${API_BASE_URL}/emprendimientos/verificar-activo/${id}`, { 
      headers: getUpdatedHeaders(req) 
    });
    
    // Devolver la respuesta del backend
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error al verificar emprendimiento activo:', error.message);
    
    // Si hay respuesta del backend, usar su status y data
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Error de conexión o similar
    res.status(500).json({ 
      activo: false, 
      mensaje: "Error al verificar estado del emprendimiento" 
    });
  }
};