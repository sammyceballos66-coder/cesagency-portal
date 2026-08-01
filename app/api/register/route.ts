// Recibe los registros del formulario "Regístrate" de la página y los
// guarda en la tabla `registrations` de Supabase (ver
// supabase/registrations.sql) — el mismo proyecto compartido de CES Agencia,
// no una hoja de Google Sheets aparte, para que Jarvis y cualquier panel
// futuro puedan leerlos con el mismo cliente que ya se usa en el resto de
// la plataforma.

import { supabase } from "@/lib/supabase";

type RegisterBody = {
  contactName: string;
  businessName?: string;
  phone: string;
  email: string;
  description?: string;
  planId: string;
};

function isValidBody(body: unknown): body is RegisterBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.contactName === "string" &&
    b.contactName.trim().length >= 3 &&
    typeof b.phone === "string" &&
    b.phone.trim().length >= 7 &&
    typeof b.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    typeof b.planId === "string" &&
    b.planId.length > 0
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return Response.json({ error: "Datos incompletos o inválidos" }, { status: 400 });
  }

  const { error } = await supabase.from("registrations").insert({
    contact_name: body.contactName.trim(),
    business_name: body.businessName?.trim() || null,
    phone: body.phone.trim(),
    email: body.email.trim(),
    description: body.description?.trim() || null,
    plan_id: body.planId,
  });

  if (error) {
    console.error("Error guardando registro:", error);
    return Response.json({ error: "No se pudo guardar el registro" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
