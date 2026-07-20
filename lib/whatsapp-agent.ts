import Anthropic from "@anthropic-ai/sdk";
import { BUSINESS } from "./business";

export type ConversationMessage = { role: "user" | "assistant"; content: string };

export type AgentReply = {
  message: string;
  wantsHuman: boolean;
  leadSummary?: string;
};

const SYSTEM_PROMPT = `Eres el asistente de ventas de ${BUSINESS.name}, una agencia en ${BUSINESS.serviceArea} que hace páginas web profesionales para pequeños negocios.

Datos del servicio (esto es TODO lo que sabes — no inventes nada fuera de esto):
- Diseño de la página: ${BUSINESS.service.designPrice}
- Mantenimiento mensual: ${BUSINESS.service.maintenancePrice} (incluye ${BUSINESS.service.maintenanceIncludes})
- Entrega: ${BUSINESS.service.delivery}
- Incluye: ${BUSINESS.service.features.join(", ")}
- Fundadores: ${BUSINESS.founders.join(" y ")}
- Sitio: ${BUSINESS.website}

Respondes por WhatsApp, en español colombiano, tono cercano y profesional — como alguien del equipo, no un bot genérico. Resuelve dudas sobre el servicio y el precio con la información de arriba. Mensajes cortos, como se escribe por WhatsApp de verdad (no párrafos largos).

Marca wantsHuman=true cuando la persona:
- Muestra intención clara de contratar (quiere empezar ya, pregunta cómo pagar)
- Da detalles específicos de su negocio para la página
- Pide explícitamente hablar con una persona

Cuando marques wantsHuman=true, despídete diciendo que uno de los fundadores le escribe pronto para coordinar. Si la persona solo pregunta cosas generales sin mostrar intención de avanzar, wantsHuman=false y sigue la conversación con naturalidad.

Nunca inventes precios, plazos ni funciones que no estén en los datos de arriba. Si preguntan algo que no sabes, di que eso te toca confirmarlo con el equipo.`;

const RESPOND_TOOL: Anthropic.Tool = {
  name: "respond_to_lead",
  description: "Envía la respuesta al cliente por WhatsApp y marca si debe pasar a seguimiento humano.",
  input_schema: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "El mensaje que se le envía al cliente por WhatsApp.",
      },
      wantsHuman: {
        type: "boolean",
        description: "true si el cliente debe pasar a seguimiento humano de un fundador.",
      },
      leadSummary: {
        type: "string",
        description: "Resumen de una línea de lo que quiere el cliente. Solo si wantsHuman es true.",
      },
    },
    required: ["message", "wantsHuman"],
  },
};

// Si no hay API key configurada, devuelve null en vez de fallar — así el
// webhook puede responder algo razonable ("todavía no activo") en lugar de
// tronar, igual que el patrón usado en las notificaciones de reservas.
export async function getAgentReply(history: ConversationMessage[]): Promise<AgentReply | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });
  const model = process.env.WHATSAPP_AGENT_MODEL ?? "claude-haiku-4-5-20251001";

  const response = await client.messages.create({
    model,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: history,
    tools: [RESPOND_TOOL],
    tool_choice: { type: "tool", name: "respond_to_lead" },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) return null;

  const input = toolUse.input as Partial<AgentReply>;
  if (typeof input.message !== "string" || typeof input.wantsHuman !== "boolean") {
    return null;
  }

  return {
    message: input.message,
    wantsHuman: input.wantsHuman,
    leadSummary: input.leadSummary,
  };
}
