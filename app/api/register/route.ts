// Recibe los registros del formulario "Regístrate" de la página y los
// guarda en la tabla `registrations` de Supabase (ver
// supabase/registrations.sql) — el mismo proyecto compartido de CES Agencia,
// no una hoja de Google Sheets aparte, para que Jarvis y cualquier panel
// futuro puedan leerlos con el mismo cliente que ya se usa en el resto de
// la plataforma.

import { supabase } from "@/lib/supabase";
import { OPCIONES_REGISTRO, precioDeVarios, promoVigente } from "@/lib/business";
import { enviarWhatsApp, numerosFundadores, textoSeguro } from "@/lib/twilio-envio";
import { ipDeLaPeticion, superaElLimite } from "@/lib/rate-limit";

// Cinco registros cada diez minutos desde la misma IP. Nadie llena este
// formulario cinco veces seguidas de buena fe; un bucle sí. Ver los límites
// reales de este freno en lib/rate-limit.ts — es por instancia, no global.
const MAX_POR_VENTANA = 5;
const VENTANA_MS = 10 * 60 * 1000;

// Este endpoint es público y no tiene captcha. Los topes de abajo son lo único
// que impide que alguien llene la base a mano, y la base NO es solo de este
// sitio: es el proyecto compartido donde también viven las reservas de Quality
// Barber Shop, el único cliente que paga. Una descripción de 4 MB entraba
// entera, porque `text` en Postgres no tiene límite y un Route Handler de Next
// tampoco lo pone.
//
// Esto acota el tamaño de cada fila. Lo que NO acota es cuántas filas entran
// por minuto: para eso hace falta una regla de rate limit en el Firewall de
// Vercel sobre /api/register, que se configura en el panel, no aquí.
const MAX_BODY_BYTES = 8_000;
const MAX = {
  contactName: 120,
  businessName: 120,
  phone: 30,
  email: 254,
  description: 2000,
  // Cuántos servicios y qué tan largo puede ser cada id.
  servicios: 6,
  planId: 40,
} as const;

type RegisterBody = {
  contactName: string;
  businessName?: string;
  phone: string;
  email: string;
  description?: string;
  planIds: string[];
};

// Un campo opcional puede no venir, pero si viene tiene que ser texto y caber.
// Sin la comprobación de tipo, un `{"description": 123}` llegaba hasta
// `body.description?.trim()` y reventaba con un 500 sin control en vez de
// devolver un 400 limpio.
function opcional(v: unknown, max: number): boolean {
  return v === undefined || v === null || (typeof v === "string" && v.length <= max);
}

function isValidBody(body: unknown): body is RegisterBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.contactName === "string" &&
    b.contactName.trim().length >= 3 &&
    b.contactName.length <= MAX.contactName &&
    typeof b.phone === "string" &&
    b.phone.trim().length >= 7 &&
    b.phone.length <= MAX.phone &&
    typeof b.email === "string" &&
    b.email.length <= MAX.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    Array.isArray(b.planIds) &&
    b.planIds.length > 0 &&
    b.planIds.length <= MAX.servicios &&
    b.planIds.every((id) => typeof id === "string" && id.length > 0 && id.length <= MAX.planId) &&
    opcional(b.businessName, MAX.businessName) &&
    opcional(b.description, MAX.description)
  );
}

export async function POST(request: Request) {
  // El freno va de primero: antes de leer el cuerpo, antes de parsear y antes
  // de tocar la base. De nada sirve limitar si igual se gastó el trabajo.
  const { bloqueado, faltanSegundos } = superaElLimite(
    ipDeLaPeticion(request),
    MAX_POR_VENTANA,
    VENTANA_MS,
  );
  if (bloqueado) {
    return Response.json(
      { error: "Demasiados intentos. Espera un momento y vuelve a intentar." },
      { status: 429, headers: { "Retry-After": String(faltanSegundos) } },
    );
  }

  // Se corta por tamaño ANTES de parsear. La cabecera se puede mentir o no
  // venir, así que se vuelve a medir sobre el texto ya leído.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return Response.json({ error: "Cuerpo demasiado grande" }, { status: 413 });
  }

  let crudo: string;
  try {
    crudo = await request.text();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (crudo.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Cuerpo demasiado grande" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(crudo);
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Formato de antes del 10 oct 2026 (`planId`, uno solo): lo sigue mandando
  // quien tenga la página abierta desde antes del cambio.
  if (body && typeof body === "object" && !("planIds" in body) && typeof (body as { planId?: unknown }).planId === "string") {
    (body as { planIds?: unknown }).planIds = [(body as { planId: string }).planId];
  }

  if (!isValidBody(body)) {
    return Response.json({ error: "Datos incompletos o inválidos" }, { status: 400 });
  }

  // El servicio tiene que ser uno de los que existen. Antes se guardaba tal
  // cual venía del navegador, así que un POST a mano podía dejar un `plan_id`
  // que no corresponde a nada, y además hace falta el servicio real para saber
  // qué precio se le mostró. Desde el 10 oct 2026 no son solo los dos planes
  // de página: ver OPCIONES_REGISTRO en lib/business.ts.
  // Se quitan repetidos, y "no sé todavía" no se combina con nada.
  const ids = [...new Set(body.planIds)];
  if (ids.includes("no-se") && ids.length > 1) {
    return Response.json({ error: "\"No sé todavía\" va solo" }, { status: 400 });
  }
  const ventana = promoVigente();
  const precio = precioDeVarios(ids, ventana !== null);
  if (!precio) {
    return Response.json({ error: "Ese servicio no existe" }, { status: 400 });
  }

  // El precio se resuelve AQUÍ, en el servidor, y no se acepta del navegador:
  // si viniera en el cuerpo de la petición, cualquiera podría registrarse
  // diciendo que le ofrecieron la página por mil pesos.
  //
  // Puede no coincidir con lo que la persona vio. La portada es estática y el
  // HTML que ya cargó un navegador NO se revalida solo, así que alguien con la
  // pestaña abierta desde ayer puede enviar el formulario viendo precios de una
  // ventana que ya cerró. El desfase no está acotado a los diez minutos del
  // `revalidate`. Queda `created_at` al lado para poder mirarlo si algún día
  // alguien reclama, y el criterio comercial es simple: si la persona dice que
  // vio el precio de promoción y la fecha cuadra, se le respeta.
  // La promoción solo se anota en los planes de página, que son los únicos
  // con ventanas.
  const promo = precio.conPromo ? ventana : null;

  const { error } = await supabase.from("registrations").insert({
    contact_name: body.contactName.trim().slice(0, MAX.contactName),
    business_name: body.businessName?.trim().slice(0, MAX.businessName) || null,
    phone: body.phone.trim().slice(0, MAX.phone),
    email: body.email.trim().slice(0, MAX.email),
    description: body.description?.trim().slice(0, MAX.description) || null,
    plan_id: ids.join(","),
    // Se guardan los dos: el `id` es la llave estable con la que se puede
    // agrupar dentro de un año, y el `label` es el copy exacto que la persona
    // vio. El label se va a reescribir —es texto de venta—, así que por sí
    // solo no sirve para saber de qué ventana salió una fila.
    promo_id: promo?.id ?? null,
    promo_label: promo?.label ?? null,
    setup_cop: precio.setup,
    monthly_cop: precio.monthly,
  });

  if (error) {
    console.error("Error guardando registro:", error);
    return Response.json({ error: "No se pudo guardar el registro" }, { status: 500 });
  }

  // El registro ya quedó guardado; el aviso es aparte. Si Twilio falla o se
  // demora, la persona igual ve "¡Listo!": se espera máximo 4 s y nada más.
  // Se espera (en vez de dispararlo y seguir) porque en Vercel la función se
  // congela al responder y un envío suelto podía no salir nunca.
  try {
    await Promise.race([avisarRegistro(body, ids), new Promise((r) => setTimeout(r, 4000))]);
  } catch (e) {
    console.error("[registro] no se pudo avisar por WhatsApp:", e);
  }

  return Response.json({ ok: true });
}

// Aviso a los fundadores por WhatsApp (pedido de Samuel, 10 oct 2026). Todo lo
// que escribió la persona pasa por textoSeguro(): es un formulario público, y
// sin eso cualquiera podía meter un enlace de estafa en el celular de Samuel.
async function avisarRegistro(body: RegisterBody, ids: string[]) {
  const destinos = numerosFundadores();
  if (destinos.length === 0) {
    console.error("[registro] AGENCY_WHATSAPP_NUMBERS vacío: nadie recibe el aviso");
    return;
  }

  const digitos = body.phone.replace(/\D/g, "").slice(0, 15);
  const celularWa = digitos.length === 10 && digitos.startsWith("3") ? `57${digitos}` : digitos;
  const servicios = ids
    .map((id) => OPCIONES_REGISTRO.find((o) => o.id === id)?.nombre ?? id)
    .join(", ");
  const negocio = textoSeguro(body.businessName, 80);
  const mensaje = textoSeguro(body.description, 200);

  const texto = [
    "🆕 *Registro nuevo en cesagencia.co*",
    "",
    `*Nombre:* ${textoSeguro(body.contactName, 80)}`,
    ...(negocio ? [`*Negocio:* ${negocio}`] : []),
    `*Le interesa:* ${servicios}`,
    `*Celular:* ${digitos}`,
    `*Correo:* ${textoSeguro(body.email, 120)}`,
    ...(mensaje ? [`*Mensaje:* ${mensaje}`] : []),
    "",
    `Escríbele: https://wa.me/${celularWa}`,
  ].join("\n");

  const resultados = await Promise.all(destinos.map((to) => enviarWhatsApp(to, texto, "registro")));
  console.log(`[registro] aviso enviado a ${resultados.filter((r) => r.sent).length}/${destinos.length}`);
}
