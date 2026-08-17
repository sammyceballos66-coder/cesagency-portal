-- Historial de conversaciones del agente de ventas de WhatsApp
-- (lib/conversations.ts, usado por app/api/whatsapp y app/api/whatsapp/digest).
--
-- Antes vivía como un único JSON en Vercel Blob. Una fila por número: el
-- upsert por `phone` es atómico, así que dos leads que escriban al mismo
-- tiempo ya no se pisan el archivo entre sí (era lo que obligaba al
-- reintento con `ifMatch` en la versión de Blob).
--
-- Mismo proyecto de Supabase compartido de CES Agencia. Ejecutar una sola
-- vez en el SQL editor del dashboard de Supabase.

create table whatsapp_conversations (
  -- Tal como lo manda Twilio, con prefijo: "whatsapp:+573001234567".
  phone text primary key,
  -- Arreglo de { role: "user" | "assistant", content: string } — el mismo
  -- ConversationMessage que consume el agente.
  messages jsonb not null default '[]'::jsonb,
  -- Se vuelve true cuando el lead pide hablar con una persona y ya no se
  -- devuelve a false: es lo que alimenta el resumen diario.
  wants_human boolean not null default false,
  lead_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- El resumen diario filtra por wants_human + updated_at dentro del día.
create index whatsapp_conversations_digest_idx
  on whatsapp_conversations (wants_human, updated_at);

-- Las conversaciones traen teléfono y texto de los prospectos, así que la
-- tabla no debe ser legible con la llave publishable. El servidor entra con
-- la llave secreta, que salta RLS — por eso no hace falta ninguna policy.
alter table whatsapp_conversations enable row level security;

-- Este proyecto no le da permisos automáticos a las tablas nuevas, así que
-- hay que concederlos a mano: sin esto PostgREST responde "permission denied
-- for table" incluso con la llave secreta (el GRANT se evalúa antes que RLS).
-- Solo a service_role, que es el rol de la llave secreta: anon y
-- authenticated se quedan por fuera a propósito.
grant select, insert, update, delete on table whatsapp_conversations to service_role;
