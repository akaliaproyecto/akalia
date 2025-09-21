const multer = require('multer');

// Usamos memoryStorage para que el archivo esté en buffer y lo subamos a Supabase
const storage = multer.memoryStorage();

/*
  Lista mínima de tipos MIME aceptados:
  - image/jpeg (.jpg, .jpeg, .jfif)
  - image/png (.png)
  - image/gif (.gif)
  - image/webp (.webp)
  - image/avif (.avif)
  - image/svg+xml (.svg)
  - image/heic / image/heif (.heic, .heif) (puede variar según cliente)

  La validación se hace en fileFilter para rechazar archivos binarios de otros tipos.
*/
const tiposAceptados = [
  'image/jpeg', // .jpg .jpeg
  'image/jfif', // .jfif (a veces se reporta así)
  'image/png',  // .png
  'image/gif',  // .gif
  'image/webp', // .webp
  'image/avif', // .avif
  'image/svg+xml', // .svg
  'image/heic', // .heic (varía según cliente)
  'image/heif'  // .heif (varía según cliente)
];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Comprobamos si el mimetype del archivo está en la lista de aceptados
    const aceptado = tiposAceptados.includes(file.mimetype);
    if (aceptado) {
      cb(null, true);
    } else {
      // Mensaje de error claro para depuración y para mostrar al usuario si se captura
      cb(new Error('Formato no permitido. Solo se aceptan imágenes: .jpg, .jpeg, .jfif, .png, .gif, .webp, .avif, .svg, .heic'), false);
    }
  },
});

module.exports = upload;
