import { getConversation, saveTurn } from "@/lib/conversations";
import { getAgentReply, type ConversationMessage } from "@/lib/whatsapp-agent";
import { firmaTwilioValida } from "@/lib/twilio-firma";
import { superaElLimite } from "@/lib/rate-limit";

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

// Topes del webhook (auditoría de seguridad, 5 de octubre de 2026). Cada uno
// cierra un abuso que se confirmó en el código:
//
// - MAX_CUERPO: el texto de un mensaje iba entero a Claude, así que un solo
//   POST de 4 MB era una llamada carísima.
// - HISTORIAL_AL_MODELO / HISTORIAL_GUARDADO: el historial nunca se recortaba.
//   Además de encarecer cada turno, pasado el límite de contexto del modelo la
//   llamada fallaba siempre, y ese cliente se quedaba sin respuesta para
//   siempre porque el historial ya no podía achicarse solo.
// - Freno por remitente: 20 mensajes cada 10 minutos. Por instancia, igual que
//   el del formulario (ver lib/rate-limit.ts). Un humano no escribe más que eso.
const MAX_CUERPO = 1_500;
const HISTORIAL_AL_MODELO = 20;
const HISTORIAL_GUARDADO = 60;
const MAX_POR_REMITENTE = 20;
const VENTANA_REMITENTE_MS = 10 * 60 * 1000;

// Solo números de WhatsApp de verdad. El "From" terminaba como llave de la
// conversación y escrito tal cual en el resumen diario de los fundadores, así
// que un From falso con saltos de línea o ``` podía meter cualquier texto ahí.
const REMITENTE_VALIDO = /^whatsapp:\+\d{8,15}$/;

// Respuesta vacía con 200: Twilio no espera nada de vuelta, y un error haría
// que reintente el mismo mensaje.
const vacia = () => new Response("", { status: 200 });

// Twilio manda el mensaje entrante como application/x-www-form-urlencoded
// (no JSON como Meta) — el remitente viene en "From" ("whatsapp:+57...") y
// el texto en "Body". Configura esta URL como el webhook "WHEN A MESSAGE
// COMES IN" en Twilio (Messaging → Try it out → Sandbox settings).
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response("", { status: 400 });
  }
  const params = [...form.entries()].map(([k, v]) => [k, String(v)] as [string, string]);

  // Lo primero, antes de leer la base o llamar a nadie: si no viene de Twilio,
  // no se hace nada. Ver lib/twilio-firma.ts.
  if (!firmaTwilioValida(request, params)) {
    console.warn("[whatsapp] webhook rechazado: firma de Twilio ausente o inválida");
    return new Response("", { status: 403 });
  }

  const from = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "").trim().slice(0, MAX_CUERPO);

  if (!REMITENTE_VALIDO.test(from) || !body) return vacia();

  if (superaElLimite(`wa:${from}`, MAX_POR_REMITENTE, VENTANA_REMITENTE_MS).bloqueado) {
    console.warn(`[whatsapp] freno por remitente: ...${from.slice(-4)}`);
    return vacia();
  }

  const history = await getConversation(from);
  const nextHistory: ConversationMessage[] = [...history, { role: "user", content: body }];

  let agentResult: Awaited<ReturnType<typeof getAgentReply>>;
  try {
    agentResult = await getAgentReply(recortarParaModelo(nextHistory));
  } catch (error) {
    // Sin esto un fallo del modelo era un 500, y Twilio reintentaba el mismo
    // mensaje (y la misma llamada pagada) varias veces.
    console.error("[whatsapp] el agente falló:", error instanceof Error ? error.message : error);
    return vacia();
  }
  if (!agentResult) {
    return Response.json({ ok: true, note: "Agente no configurado (falta ANTHROPIC_API_KEY)" });
  }

  const withReply: ConversationMessage[] = [
    ...nextHistory,
    { role: "assistant" as const, content: agentResult.message },
  ].slice(-HISTORIAL_GUARDADO);

  await saveTurn(from, withReply, agentResult.wantsHuman, agentResult.leadSummary);
  const sendResult = await sendWhatsAppMessage(from, agentResult.message);

  return Response.json({ ok: true, sendResult });
}

// Los últimos mensajes, empezando siempre por uno del cliente: la API de
// Anthropic exige que la conversación arranque con el rol "user".
function recortarParaModelo(historial: ConversationMessage[]): ConversationMessage[] {
  const recorte = historial.slice(-HISTORIAL_AL_MODELO);
  const inicio = recorte.findIndex((m) => m.role === "user");
  return inicio <= 0 ? recorte : recorte.slice(inicio);
}
