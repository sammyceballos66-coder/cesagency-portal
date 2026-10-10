// Envío de WhatsApp por Twilio para los avisos a los fundadores: el resumen
// diario de leads (/api/whatsapp/digest) y el aviso de registro nuevo
// (/api/register). Antes vivía dentro del resumen; se sacó aquí el 10 oct 2026
// para no copiarlo.
//
// OJO: hoy sale por el sandbox de Twilio. Solo le llega a quien haya mandado
// el `join <código>` al sandbox, y esa sesión expira. Cuando CES tenga su
// WhatsApp Business por API (verificación de Meta), cambia TWILIO_WHATSAPP_FROM
// y esto sigue igual.

export async function enviarWhatsApp(to: string, message: string, etiqueta: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    // Nombrar la variable ausente: estos envíos no los ve nadie en pantalla, y
    // un motivo genérico deja el fallo invisible.
    const faltan = [
      !sid && "TWILIO_ACCOUNT_SID",
      !token && "TWILIO_AUTH_TOKEN",
      !from && "TWILIO_WHATSAPP_FROM",
    ].filter(Boolean).join(", ");
    const reason = `Credenciales de Twilio incompletas: falta ${faltan}`;
    console.error(`[${etiqueta}] ${reason}`);
    return { sent: false, reason };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
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
  });

  if (!res.ok) {
    // Twilio explica la causa real en el cuerpo (número fuera de la ventana de
    // 24h, credenciales inválidas, etc.); quedarse con el status la pierde.
    const detalle = await res.text().catch(() => "");
    const reason = `Twilio respondió ${res.status}: ${detalle.slice(0, 300)}`;
    console.error(`[${etiqueta}] envío fallido a ...${to.slice(-4)} — ${reason}`);
    return { sent: false, reason };
  }

  // Que Twilio acepte no significa que llegue: guardar el SID permite ir a
  // buscar ese mensaje en la consola, y la cuenta responde de una la pregunta
  // de "¿por cuál de las dos cuentas salió?".
  try {
    const b = await res.clone().json();
    console.log(
      `[${etiqueta}] aceptado — sid=${b.sid} status=${b.status} from=${b.from} cuenta=${String(b.account_sid).slice(0, 10)}…`,
    );
  } catch {
    // El log es un extra; el envío ya se hizo.
  }
  return { sent: true };
}

/** Los números de los fundadores que reciben los avisos (AGENCY_WHATSAPP_NUMBERS). */
export function numerosFundadores(): string[] {
  return (process.env.AGENCY_WHATSAPP_NUMBERS ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

/**
 * Texto que escribió un desconocido (un formulario, un cliente por WhatsApp)
 * y va a terminar en el celular de los fundadores: sin enlaces, sin
 * caracteres de formato, en una línea y recortado. Auditoría del 5 oct 2026.
 */
export function textoSeguro(texto: string | null | undefined, max: number): string {
  const limpio = (texto ?? "")
    .replace(/https?:\/\/\S+|www\.\S+/gi, "[enlace]")
    .replace(/[`*_~\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return limpio.length > max ? `${limpio.slice(0, max - 1)}…` : limpio;
}
