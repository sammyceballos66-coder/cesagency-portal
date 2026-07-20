import { BUSINESS } from "@/lib/business";
import { getTodaysQualifiedLeads, type Lead } from "@/lib/conversations";

async function sendWhatsAppMessage(to: string, message: string) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WHATSAPP_TOKEN;
  if (!phoneNumberId || !accessToken) {
    return { sent: false, reason: "Credenciales de Meta no configuradas" };
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body: message },
    }),
  });

  if (!res.ok) return { sent: false, reason: `Meta respondió ${res.status}` };
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
