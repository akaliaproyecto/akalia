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
    console.error("Error al subir imagen:", err.message);
    throw new Error("No se pudo subir la imagen");
  }
}

module.exports = uploadImage;
