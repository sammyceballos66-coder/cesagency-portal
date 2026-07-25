// Recibe los registros del formulario "Regístrate" de la página. Por ahora
// solo valida y confirma — falta conectarlo a la hoja de Google Sheets donde
// Samuel y Emmanuel ven los prospectos (siguiente paso planeado).

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

  // TODO: guardar en la hoja de Google Sheets compartida de prospectos.
  console.log("Nuevo registro:", body);

  return Response.json({ ok: true });
}
