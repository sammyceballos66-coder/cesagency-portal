import { createHmac, timingSafeEqual } from "node:crypto";

// Verificación de la firma que Twilio pone en cada webhook (X-Twilio-Signature).
//
// POR QUÉ EXISTE: hasta el 5 de octubre de 2026 /api/whatsapp aceptaba
// cualquier POST. Una auditoría de seguridad confirmó que cualquiera en
// internet podía hacerse pasar por WhatsApp y con eso gastar sin límite en
// Anthropic, escribir en la conversación de cualquier número y meter texto en
// el resumen diario de los fundadores. Sin una firma válida, el webhook ya no
// hace nada.
//
// CÓMO FIRMA TWILIO: Base64(HMAC-SHA1(auth token, URL + cada parámetro POST
// como nombre+valor, ordenados por nombre)). La URL es la que está configurada
// en Twilio, no la que ve el servidor: si Twilio apunta a cesagencia.co y
// Vercel la manda a www, la URL del request ya no coincide. Por eso se prueba
// contra un conjunto fijo de direcciones propias. Aceptar varias no debilita
// nada: sin el auth token nadie puede producir la firma para ninguna.

function firmaPara(url: string, params: [string, string][], token: string): string {
  const ordenados = [...params].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const datos = url + ordenados.map(([k, v]) => k + v).join("");
  return createHmac("sha1", token).update(datos, "utf8").digest("base64");
}

function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Las direcciones con las que Twilio pudo haber firmado este webhook. */
function urlsCandidatas(urlDelRequest: string, ruta: string): string[] {
  const urls = new Set<string>();
  const fija = process.env.TWILIO_WEBHOOK_URL?.trim();
  if (fija) urls.add(fija);
  urls.add(urlDelRequest);
  for (const host of ["https://cesagencia.co", "https://www.cesagencia.co"]) {
    urls.add(host + ruta);
  }
  return [...urls];
}

/**
 * true solo si la firma corresponde al auth token de Twilio. Sin token
 * configurado devuelve false: un webhook sin forma de verificar se cierra, no
 * se abre.
 */
export function firmaTwilioValida(request: Request, params: [string, string][]): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const firma = request.headers.get("x-twilio-signature");
  if (!token || !firma) return false;

  const ruta = new URL(request.url).pathname;
  return urlsCandidatas(request.url, ruta).some((url) => iguales(firmaPara(url, params, token), firma));
}
