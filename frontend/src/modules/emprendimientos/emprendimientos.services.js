const axios = require('axios');
require('dotenv').config();
const formData = require('form-data');

const API_BASE_URL = process.env.URL_BASE || process.env.API_BASE_URL || 'http://localhost:4000';
const HEADERS = { 'Content-Type': 'application/json', 'akalia-api-key': process.env.API_KEY || '' };

/* Listar emprendimientos de un usuario y renderizar la vista */
exports.listarEmprendimientosUsuario = async (req, res) => {
  const id = req.params?.id || req.usuarioAutenticado?.idPersona;
  if (!id) {
    // Si no hay id conocido, redirigir al login o a una página segura
    return res.redirect('/?error=Debes+iniciar+sesion');
  }
  const usuario = req.usuarioAutenticado || { idPersona: id };
  let emprendimientos = [];

  try {
    const { data } = await axios.get(`${API_BASE_URL}/emprendimientos/usuario/${id}`, { headers: HEADERS });
    if (Array.isArray(data)) emprendimientos = data;

    // Renderiza la vista con las variables que ya espera el template
    return res.render('pages/usuario-emprendimientos-listar', {
      usuario,
      emprendimientos,
      // Pasamos la URL base de la API a la plantilla para que el frontend pueda llamar al backend correcto
      apiBaseUrl: API_BASE_URL,
      // Pasamos la API key para que el cliente la use al hacer POST con fetch (solución simple)
      apiKey: HEADERS['akalia-api-key'] || ''
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
    console.log(req.body)
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
    // Combinar headers
    const headers = {
      ...HEADERS,
      ...formN.getHeaders()
    };

    // Enviar al backend real (puerto 4000)
    const resp = await axios.post(`${API_BASE_URL}/emprendimientos`, formN, { headers });
    console.log('Respuesta backend:', resp.data);

    // Redirigir al listado de emprendimientos del usuario
    res.redirect(`/usuario-emprendimientos/${usuario}`);
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
    const resp = await axios.get(`${API_BASE_URL}/emprendimientos/${id}`, { headers: HEADERS, timeout: 5000 });
    emprendimiento = Array.isArray(resp.data) ? resp.data[0] : (resp.data.emprendimiento || resp.data.data || resp.data);
    const usuario = emprendimiento.usuario;
    const respProd = await axios.get(`${API_BASE_URL}/productos/emprendimiento/${id}`, { headers: HEADERS, timeout: 5000 });
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
      return res.render('pages/usuario-emprendimiento-ver', { emprendimiento, productos, usuario });
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
    // Combinar headers
    const headers = {
      ...HEADERS,
      ...formN.getHeaders()
    };

    // Enviar al backend real (puerto 4000)
    await axios.put(`${API_BASE_URL}/emprendimientos/${idEmprendimiento}`, formN, { headers });

    // Redirigir al listado de emprendimientos del usuario
    res.redirect(req.get('referer'));
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
      await axios.patch(`${API_BASE_URL}/emprendimientos/${idEmprendimiento}`, 
        { emprendimientoEliminado },
        { headers: HEADERS }
      );
      res.redirect(req.get(`/usuario-emprendimientos/${usuario}`));
    } catch (error) {
      console.error('Error al eliminar emprendimiento:', error.message);
  res.status(500).render('pages/error', {
        error: 'Error al eliminar emprendimiento',
        message: 'No se pudo eliminar el emprendimiento. Verifica los datos o intenta más tarde.'
      });
    }
}