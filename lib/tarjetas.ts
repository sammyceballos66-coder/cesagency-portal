// Tarjetas NFC con número: la tarjeta lleva impreso (en el QR) y grabado (en el
// chip) el enlace https://www.cesagencia.co/r/<numero>, y la tabla
// `tarjetas_nfc` dice a dónde manda cada número. Ver supabase/tarjetas-nfc.sql.
//
// Así las tarjetas se imprimen en lote antes de venderlas, y el día de la venta
// solo se asigna el número desde /admin/tarjetas, en el celular, en menos de un
// minuto. Ni la imprenta ni NFC Tools se vuelven a tocar.

export const DOMINIO_TARJETAS = "https://www.cesagencia.co";

export function enlaceDeTarjeta(numero: number | string): string {
  return `${DOMINIO_TARJETAS}/r/${numero}`;
}

// El QR de muestra que sale en la página de CES. No lleva a ningún negocio:
// si llevara a la ficha de un cliente real, cualquier visitante que lo
// escaneara por curiosidad le dejaría una reseña sin haber ido nunca, y eso es
// justo lo que Google castiga.
export const NUMERO_MUESTRA = "muestra";

export const DESTINOS = [
  { id: "google", nombre: "Reseñas de Google" },
  { id: "whatsapp", nombre: "WhatsApp" },
  { id: "instagram", nombre: "Instagram" },
  { id: "facebook", nombre: "Facebook" },
  { id: "tiktok", nombre: "TikTok" },
  { id: "web", nombre: "Página web" },
] as const;

export type DestinoId = (typeof DESTINOS)[number]["id"];

export function esDestino(valor: string): valor is DestinoId {
  return DESTINOS.some((d) => d.id === valor);
}

export function nombreDestino(id: string | null): string {
  return DESTINOS.find((d) => d.id === id)?.nombre ?? "";
}

export type Tarjeta = {
  numero: number;
  negocio: string | null;
  destino: DestinoId | null;
  url: string | null;
};

const MAX_URL = 2000;

/**
 * Limpia lo que se pegó en el campo del enlace y devuelve una URL segura, o
 * null si no sirve.
 *
 * Solo http y https: esta URL termina en un redirect que abre el celular de un
 * desconocido, y un `javascript:` o un `data:` ahí sería un problema.
 *
 * Para WhatsApp se acepta también el número suelto, porque en plena venta es
 * más rápido que pedirle al dueño un enlace: "3001234567" se vuelve
 * https://wa.me/573001234567.
 */
export function normalizarUrl(entrada: string, destino: DestinoId): string | null {
  let texto = entrada.trim();
  if (!texto) return null;

  if (destino === "whatsapp" && /^[\d\s+()-]+$/.test(texto)) {
    let digitos = texto.replace(/\D/g, "");
    // Celular colombiano sin indicativo: 10 dígitos que empiezan por 3.
    if (digitos.length === 10 && digitos.startsWith("3")) digitos = `57${digitos}`;
    if (digitos.length < 11 || digitos.length > 15) return null;
    return `https://wa.me/${digitos}`;
  }

  // Al copiar de Google Maps a veces viene el nombre del negocio antes del
  // enlace ("Restaurante Pedro https://maps.app.goo.gl/..."). Se toma el enlace.
  const encontrado = texto.match(/https?:\/\/\S+/i);
  if (encontrado) texto = encontrado[0];
  else if (!/^[a-z][a-z0-9+.-]*:/i.test(texto)) texto = `https://${texto}`;

  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!url.hostname.includes(".")) return null;
  const limpia = url.toString();
  return limpia.length > MAX_URL ? null : limpia;
}

/**
 * Lee "7, 8", "7 8" o "7-10" y devuelve los números, o null si hay algo raro.
 * El tope de 50 por vez es para que un dedazo ("1-1000") no reasigne media
 * tabla.
 */
export function leerNumeros(entrada: string): number[] | null {
  const partes = entrada.split(/[\s,;y]+/).filter(Boolean);
  if (partes.length === 0) return null;

  const numeros = new Set<number>();
  for (const parte of partes) {
    const rango = parte.match(/^(\d{1,6})-(\d{1,6})$/);
    if (rango) {
      const desde = Number(rango[1]);
      const hasta = Number(rango[2]);
      if (desde < 1 || hasta < desde || hasta - desde >= 50) return null;
      for (let n = desde; n <= hasta; n++) numeros.add(n);
    } else if (/^\d{1,6}$/.test(parte) && Number(parte) > 0) {
      numeros.add(Number(parte));
    } else {
      return null;
    }
  }
  return numeros.size > 50 ? null : [...numeros].sort((a, b) => a - b);
}
