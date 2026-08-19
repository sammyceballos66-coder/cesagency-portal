import { BUSINESS } from "@/lib/business";
import { getTodaysQualifiedLeads, type Lead } from "@/lib/conversations";

// Mismo mecanismo de envío que /api/whatsapp — ver ese archivo para el
// porqué de usar Twilio en vez de Meta Cloud API por ahora.
async function sendWhatsAppMessage(to: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    // Nombrar la variable ausente: el resumen sale de un cron, donde nadie ve
    // el valor devuelto, y un motivo genérico deja el fallo invisible.
    const faltan = [
      !sid && "TWILIO_ACCOUNT_SID",
      !token && "TWILIO_AUTH_TOKEN",
      !from && "TWILIO_WHATSAPP_FROM",
    ].filter(Boolean).join(", ");
    const reason = `Credenciales de Twilio incompletas: falta ${faltan}`;
    console.error(`[digest] ${reason}`);
    return { sent: false, reason };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
        From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
        Body: message,
      }),
    },
  );

  if (!res.ok) {
    // Twilio explica la causa real en el cuerpo (número fuera de la ventana de
    // 24h, credenciales inválidas, etc.); quedarse con el status la pierde.
    const detalle = await res.text().catch(() => "");
    const reason = `Twilio respondió ${res.status}: ${detalle.slice(0, 300)}`;
    console.error(`[digest] envío fallido a ...${to.slice(-4)} — ${reason}`);
    return { sent: false, reason };
  }

  // Que Twilio acepte no significa que llegue: guardar el SID permite ir a
  // buscar ese mensaje en la consola, y la cuenta responde de una la pregunta
  // de "¿por cuál de las dos cuentas salió?".
  try {
    const b = await res.clone().json();
    console.log(
      `[digest] aceptado — sid=${b.sid} status=${b.status} from=${b.from} cuenta=${String(b.account_sid).slice(0, 10)}…`
    );
  } catch {
    // El log es un extra; el envío ya se hizo.
  }
  return { sent: true };
}

function buildDigestMessage(leads: Lead[]): string {
  if (leads.length === 0) {
    return `📋 *Resumen del día — ${BUSINESS.name}*\n\nHoy no hubo clientes que pidieran hablar personalmente.`;
  }

  const rows = leads.map((l) => {
    const summary = l.leadSummary ?? "Quiere hablar personalmente";
    return `${l.phone}  ${summary}`;
  });

  return [
    `📋 *Resumen del día — ${BUSINESS.name}*`,
    "",
    `${leads.length} ${leads.length === 1 ? "cliente quiere" : "clientes quieren"} hablar personalmente:`,
    "```",
    rows.join("\n"),
    "```",
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

  const recipients = (process.env.AGENCY_WHATSAPP_NUMBERS ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  const results = await Promise.all(recipients.map((to) => sendWhatsAppMessage(to, message)));
  console.log(
    `[digest] ${leads.length} lead(s) del día · ${results.filter((r) => r.sent).length}/${recipients.length} avisos enviados`
  );

  return Response.json({ ok: true, leadCount: leads.length, recipients: recipients.length, results });
}
