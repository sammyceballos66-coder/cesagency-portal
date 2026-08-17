import { supabase } from "./supabase";
import type { ConversationMessage } from "./whatsapp-agent";

// Historial de conversaciones de WhatsApp en la tabla
// `whatsapp_conversations` de Supabase (ver supabase/whatsapp-conversations.sql).
// Antes era un único JSON en Vercel Blob que cada turno reescribía entero
// para *todos* los leads, con un reintento por `ifMatch` para que dos
// mensajes simultáneos no se pisaran. Con una fila por número ese problema
// desaparece: cada lead se guarda por su lado.

export type Lead = {
  phone: string;
  messages: ConversationMessage[];
  wantsHuman: boolean;
  leadSummary?: string;
  updatedAt: string; // ISO
};

type LeadRow = {
  phone: string;
  messages: ConversationMessage[] | null;
  wants_human: boolean;
  lead_summary: string | null;
  updated_at: string;
};

const TABLE = "whatsapp_conversations";

function toLead(row: LeadRow): Lead {
  return {
    phone: row.phone,
    messages: row.messages ?? [],
    wantsHuman: row.wants_human,
    leadSummary: row.lead_summary ?? undefined,
    updatedAt: row.updated_at,
  };
}

export async function getConversation(phone: string): Promise<ConversationMessage[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("messages")
    .eq("phone", phone)
    .maybeSingle();

  // Igual que la versión de Blob: si la lectura falla, el agente responde
  // sin contexto en vez de dejar al cliente sin respuesta. Se registra para
  // que quede visible en los logs de Vercel.
  if (error) {
    console.error(`No se pudo leer la conversación de ${phone}:`, error.message);
    return [];
  }

  return (data?.messages as ConversationMessage[] | null) ?? [];
}

export async function saveTurn(
  phone: string,
  messages: ConversationMessage[],
  wantsHuman: boolean,
  leadSummary?: string,
): Promise<void> {
  // El upsert reemplaza la fila entera, así que hay que traer lo que ya
  // había: una vez calificado, el lead se queda calificado aunque el
  // siguiente turno no lo vuelva a marcar.
  const { data: existing } = await supabase
    .from(TABLE)
    .select("wants_human, lead_summary")
    .eq("phone", phone)
    .maybeSingle();

  const { error } = await supabase.from(TABLE).upsert(
    {
      phone,
      messages,
      wants_human: wantsHuman || existing?.wants_human || false,
      lead_summary: leadSummary ?? existing?.lead_summary ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "phone" },
  );

  if (error) {
    throw new Error(`No se pudo guardar la conversación de ${phone}: ${error.message}`);
  }
}

// Colombia no tiene horario de verano, así que el desfase es fijo y no hace
// falta una librería de zonas horarias.
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

// Medianoche de hoy en Colombia, en UTC. El resumen es "del día" para
// Samuel y Emmanuel, no para el reloj del servidor: comparar contra el día
// UTC dejaba por fuera casi toda la jornada colombiana.
function startOfBogotaToday(): string {
  const nowInBogota = new Date(Date.now() - BOGOTA_OFFSET_MS);
  const dayKey = nowInBogota.toISOString().slice(0, 10);
  return new Date(`${dayKey}T00:00:00.000-05:00`).toISOString();
}

export async function getTodaysQualifiedLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("phone, messages, wants_human, lead_summary, updated_at")
    .eq("wants_human", true)
    .gte("updated_at", startOfBogotaToday())
    .order("updated_at", { ascending: true });

  // A diferencia de getConversation, aquí sí conviene fallar duro: un
  // resumen vacío por un error de lectura se ve idéntico a un día sin leads.
  if (error) {
    throw new Error(`No se pudieron leer los leads del día: ${error.message}`);
  }

  return (data as LeadRow[]).map(toLead);
}
