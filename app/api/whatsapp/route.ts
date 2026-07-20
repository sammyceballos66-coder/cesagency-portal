import { getConversation, saveTurn } from "@/lib/conversations";
import { getAgentReply, type ConversationMessage } from "@/lib/whatsapp-agent";

// Verificación del webhook que pide Meta al conectarlo (Meta for Developers
// → WhatsApp → Configuration → Webhook). Debe devolver el "challenge" tal
// cual si el token coincide con META_WEBHOOK_VERIFY_TOKEN.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

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

type MetaWebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        messages?: { from: string; text?: { body: string } }[];
      };
    }[];
  }[];
};

export async function POST(request: Request) {
  let body: MetaWebhookPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const incoming = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!incoming?.text?.body || !incoming.from) {
    // Meta también manda otros eventos (confirmaciones de entrega, etc.)
    // que no traen un mensaje de texto — no hay nada que responder.
    return Response.json({ ok: true });
  }

  const from = incoming.from;
  const history = await getConversation(from);
  const nextHistory: ConversationMessage[] = [...history, { role: "user", content: incoming.text.body }];

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
