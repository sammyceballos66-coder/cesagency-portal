import { createClient } from "@supabase/supabase-js";

// Mismo proyecto de Supabase compartido de CES Agencia que usa
// quality-barber-shop-web (ver ese repo/lib/supabase.ts). Aquí se usa para
// la tabla `registrations` (prospectos del formulario de la página), que no
// va particionada por business_id porque es a nivel de la agencia, no de un
// cliente ya existente. Llave "secret" — solo importar desde server-side.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en las variables de entorno");
}

export const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false },
});
