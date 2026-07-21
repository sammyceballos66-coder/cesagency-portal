import { BUSINESS } from "@/lib/business";
import { getTodaysQualifiedLeads, type Lead } from "@/lib/conversations";

// Mismo mecanismo de envío que /api/whatsapp — ver ese archivo para el
// porqué de usar Twilio en vez de Meta Cloud API por ahora.
async function sendWhatsAppMessage(to: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    return { sent: false, reason: "Credenciales de Twilio no configuradas" };
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

  if (!res.ok) return { sent: false, reason: `Twilio respondió ${res.status}` };
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

// Disparado por el cron job en vercel.json (ver ese archivo para el
// horario). Protegido con CRON_SECRET para que no cualquiera pueda pedir el
// resumen — Vercel manda ese header automáticamente en sus propios crons.
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

  return Response.json({ ok: true, leadCount: leads.length, recipients: recipients.length, results });
}
