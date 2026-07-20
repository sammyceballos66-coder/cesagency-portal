import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import type { ConversationMessage } from "./whatsapp-agent";

// Historial de conversaciones de WhatsApp, guardado como un único JSON en
// Vercel Blob — mismo patrón simple usado para las reservas de la barbería.
// El `ifMatch` evita que dos mensajes que lleguen casi al tiempo se
// sobreescriban entre sí.

export type Lead = {
  phone: string;
  messages: ConversationMessage[];
  wantsHuman: boolean;
  leadSummary?: string;
  updatedAt: string; // ISO
};

const CONVERSATIONS_PATHNAME = "whatsapp-conversations.json";
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

async function readConversations(): Promise<{ leads: Lead[]; etag?: string }> {
  try {
    const result = await get(CONVERSATIONS_PATHNAME, {
      access: "private",
      useCache: false,
      token: blobToken,
    });
    if (!result) return { leads: [] };
    const text = await new Response(result.stream).text();
    const leads = text ? (JSON.parse(text) as Lead[]) : [];
    return { leads, etag: result.blob.etag };
  } catch {
    return { leads: [] };
  }
}

export async function getConversation(phone: string): Promise<ConversationMessage[]> {
  const { leads } = await readConversations();
  return leads.find((l) => l.phone === phone)?.messages ?? [];
}

export async function saveTurn(
  phone: string,
  messages: ConversationMessage[],
  wantsHuman: boolean,
  leadSummary?: string,
): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { leads, etag } = await readConversations();
    const existing = leads.find((l) => l.phone === phone);
    const updated: Lead = {
      phone,
      messages,
      // Una vez calificado, se queda calificado el resto del día aunque el
      // siguiente turno no lo vuelva a marcar.
      wantsHuman: wantsHuman || existing?.wantsHuman || false,
      leadSummary: leadSummary ?? existing?.leadSummary,
      updatedAt: new Date().toISOString(),
    };
    const next = existing
      ? leads.map((l) => (l.phone === phone ? updated : l))
      : [...leads, updated];

    try {
      await put(CONVERSATIONS_PATHNAME, JSON.stringify(next), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        ifMatch: etag,
        token: blobToken,
      });
      return;
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError) continue;
      throw err;
    }
  }
}

export async function getTodaysQualifiedLeads(): Promise<Lead[]> {
  const { leads } = await readConversations();
  const todayKey = new Date().toISOString().slice(0, 10);
  return leads.filter((l) => l.wantsHuman && l.updatedAt.slice(0, 10) === todayKey);
}
