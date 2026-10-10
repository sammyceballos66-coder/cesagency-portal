import { BUSINESS } from "@/lib/business";
import { getTodaysQualifiedLeads, type Lead } from "@/lib/conversations";
import { enviarWhatsApp, numerosFundadores, textoSeguro } from "@/lib/twilio-envio";

// El resumen de cada lead lo escribe el modelo, guiado por lo que el cliente
// le dijo: es texto de un desconocido, aunque llegue desde nuestro propio
// número. Se recorta, se le quitan los enlaces y los caracteres de formato, y
// se pone un tope de filas. Sin esto (auditoría del 5 de octubre de 2026) un
// cliente podía meter un enlace de estafa en el mensaje que reciben los
// fundadores, o inundar el resumen hasta que WhatsApp lo rechazara y esa noche
// no llegara nada.
const MAX_FILAS = 25;
const MAX_RESUMEN = 120;

function resumenSeguro(texto: string | undefined): string {
  return textoSeguro(texto, MAX_RESUMEN) || "Quiere hablar personalmente";
}

// Solo dígitos y el "+". Desde que el webhook valida el remitente esto ya
// viene limpio, pero las filas viejas se guardaron sin esa validación.
const telefonoSeguro = (phone: string) => phone.replace(/^whatsapp:/, "").replace(/[^\d+]/g, "").slice(0, 16);

function buildDigestMessage(leads: Lead[]): string {
  if (leads.length === 0) {
    return `📋 *Resumen del día: ${BUSINESS.name}*\n\nHoy no hubo clientes que pidieran hablar personalmente.`;
  }

  const rows = leads.slice(0, MAX_FILAS).map((l) => `${telefonoSeguro(l.phone)}  ${resumenSeguro(l.leadSummary)}`);
  const resto = leads.length - MAX_FILAS;

  return [
    `📋 *Resumen del día: ${BUSINESS.name}*`,
    "",
    `${leads.length} ${leads.length === 1 ? "cliente quiere" : "clientes quieren"} hablar personalmente:`,
    "```",
    rows.join("\n"),
    "```",
    ...(resto > 0 ? ["", `Y ${resto} más. Revísalos en Supabase.`] : []),
  ].join("\n");
}

// Disparado por el cron job en vercel.json, a las 4:00 UTC = 11:00 p.m. de
// Colombia, para que alcance a cubrir la jornada completa del día (la
// ventana la define startOfBogotaToday en lib/conversations.ts). Protegido
// con CRON_SECRET para que no cualquiera pueda pedir el resumen — Vercel
// manda ese header automáticamente en sus propios crons.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const leads = await getTodaysQualifiedLeads();
  const message = buildDigestMessage(leads);

  const recipients = numerosFundadores();

  const results = await Promise.all(recipients.map((to) => enviarWhatsApp(to, message, "digest")));
  console.log(
    `[digest] ${leads.length} lead(s) del día · ${results.filter((r) => r.sent).length}/${recipients.length} avisos enviados`
  );

  return Response.json({ ok: true, leadCount: leads.length, recipients: recipients.length, results });
}
