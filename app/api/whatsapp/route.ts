import { getConversation, saveTurn } from "@/lib/conversations";
import { getAgentReply, type ConversationMessage } from "@/lib/whatsapp-agent";

// Envía la respuesta por Twilio (mismo canal ya probado y funcionando en
// el proyecto de la barbería). Meta Cloud API quedó bloqueada por ahora
// (verificación de cuenta pendiente) — si más adelante se aprueba un
// número de WhatsApp Business directo con Meta, esta es la única función
// que habría que volver a adaptar.
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

// Twilio manda el mensaje entrante como application/x-www-form-urlencoded
// (no JSON como Meta) — el remitente viene en "From" ("whatsapp:+57...") y
// el texto en "Body". Configura esta URL como el webhook "WHEN A MESSAGE
// COMES IN" en Twilio (Messaging → Try it out → Sandbox settings).
export async function POST(request: Request) {
  const form = await request.formData();
  const from = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "").trim();

  if (!from || !body) {
    return new Response("", { status: 200 });
  }

  const history = await getConversation(from);
  const nextHistory: ConversationMessage[] = [...history, { role: "user", content: body }];

  const agentResult = await getAgentReply(nextHistory);
  if (!agentResult) {
    return Response.json({ ok: true, note: "Agente no configurado (falta ANTHROPIC_API_KEY)" });
  }

  const withReply: ConversationMessage[] = [
    ...nextHistory,
    { role: "assistant", content: agentResult.message },
  ];

  await saveTurn(from, withReply, agentResult.wantsHuman, agentResult.leadSummary);
  const sendResult = await sendWhatsAppMessage(from, agentResult.message);

  return Response.json({ ok: true, sendResult });
}
