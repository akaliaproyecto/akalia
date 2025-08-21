const multer = require('multer');

// Usamos memoryStorage para que el archivo esté en buffer y lo subamos a Supabase
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype);
    cb(ok ? null : new Error('Formato no permitido'), ok);
  },
});

module.exports = upload;
