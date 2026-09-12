// Freno de peticiones para las rutas públicas de la API.
//
// POR QUÉ EN CÓDIGO Y NO EN EL FIREWALL DE VERCEL: el rate limit del WAF de
// Vercel es de los planes pagos, y este proyecto está en Hobby. O sea que la
// opción "se configura en el panel" no existe aquí. Esto sí funciona hoy.
//
// QUÉ TAN FUERTE ES, SIN ADORNOS: el contador vive en la memoria de la función
// serverless. Vercel puede levantar varias instancias en paralelo y las recicla
// cuando quiere, así que el límite es POR INSTANCIA, no global. Eso frena en
// seco el caso realista —alguien con un bucle desde una sola máquina— pero no
// es una garantía dura contra un ataque repartido entre muchas IP.
//
// Para una garantía de verdad habría que llevar el contador a Supabase, y eso
// significa una tabla nueva y guardar direcciones IP, que son dato personal y
// tocan la política de privacidad. No vale la pena para el tráfico que hay hoy.
// Aquí la IP solo vive en memoria unos minutos y nunca se escribe en ningún
// lado.

type Ventana = { expiraEn: number; conteo: number };

// Techo de claves distintas. Si se pasa, se vacía el mapa entero: prefiero
// perder los contadores a que la memoria crezca sin límite. Un atacante capaz
// de llenar esto ya viene repartido desde miles de IP, y contra eso este freno
// no servía de todos modos.
const MAX_CLAVES = 5_000;

const ventanas = new Map<string, Ventana>();

/** La IP de quien llama, según las cabeceras que pone Vercel por delante. */
export function ipDeLaPeticion(request: Request): string {
  const reenviada = request.headers.get("x-forwarded-for");
  if (reenviada) {
    // Puede venir una cadena "cliente, proxy1, proxy2": el cliente es el primero.
    const primera = reenviada.split(",")[0]?.trim();
    if (primera) return primera;
  }
  return request.headers.get("x-real-ip")?.trim() || "desconocida";
}

/**
 * Suma una petición a la cuenta de `clave` y dice si se pasó del límite.
 * Devuelve también cuántos segundos faltan para que se libere, para poder
 * responder con un `Retry-After` que sirva de algo.
 */
export function superaElLimite(
  clave: string,
  maxPorVentana: number,
  ventanaMs: number,
  ahora: number = Date.now(),
): { bloqueado: boolean; faltanSegundos: number } {
  // Limpieza perezosa: se barren las vencidas al pasar. Con el tráfico de este
  // sitio el mapa nunca tiene más de un puñado de entradas.
  for (const [k, v] of ventanas) {
    if (v.expiraEn <= ahora) ventanas.delete(k);
  }
  if (ventanas.size > MAX_CLAVES) ventanas.clear();

  const actual = ventanas.get(clave);

  if (!actual || actual.expiraEn <= ahora) {
    ventanas.set(clave, { expiraEn: ahora + ventanaMs, conteo: 1 });
    return { bloqueado: false, faltanSegundos: 0 };
  }

  actual.conteo += 1;
  const faltanSegundos = Math.max(1, Math.ceil((actual.expiraEn - ahora) / 1000));
  return { bloqueado: actual.conteo > maxPorVentana, faltanSegundos };
}
