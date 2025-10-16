/**
 * @file supabaseClient.js
 * @description Crea y exporta el cliente de Supabase para uso en el servidor.
 *
 * Notas sencillas:
 * - Usa la URL y la `SERVICE_ROLE_KEY` desde variables de entorno.
 * - `persistSession: false` evita que Supabase intente mantener sesiones en este cliente de servidor.
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Cliente Supabase reutilizable en el backend.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // SOLO en servidor
  { auth: { persistSession: false } }
);

module.exports = supabase;
