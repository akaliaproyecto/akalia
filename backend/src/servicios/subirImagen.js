const supabase = require("../config/supabaseClient");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

async function uploadImage(file, folder = "general") {
  if (!file) return null;

  try {
    // extensión original
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    // procesar con sharp
    const processedImage = await sharp(file.buffer)
      .resize(600) // ancho máximo
      .toFormat("webp", { quality: 80 })
      .toBuffer();

    // subir a supabase
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(`${folder}/${fileName}`, processedImage, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) throw error;

    // devolver URL pública
    return `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${data.path}`;
  } catch (err) {
    // Sanitizamos el error para evitar que se vuelque HTML grande en la consola
    try {
      const maybeHtml = String(err && err.message ? err.message : err);
      const isHtml = maybeHtml.trim().toLowerCase().startsWith('<!doctype') || maybeHtml.trim().toLowerCase().startsWith('<html');
      const safeMessage = isHtml ? (maybeHtml.slice(0, 200) + '... [HTML truncated]') : maybeHtml;
      console.error('Error al subir imagen:', safeMessage);
      if (err && err.stack) console.error(err.stack.split('\n').slice(0, 5).join('\n'));
    } catch (logErr) {
      // En caso de fallo al loguear, mostrar al menos el message original
      console.error('Error al subir imagen (falló sanitizar log):', err && err.message ? err.message : err);
    }

    // Lanzamos un error genérico para que el controlador devuelva un JSON consistente.
    throw new Error('No se pudo subir la imagen');
  }
}

module.exports = uploadImage;
