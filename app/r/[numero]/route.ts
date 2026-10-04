import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { NUMERO_MUESTRA } from "@/lib/tarjetas";

// El enlace que llevan el QR y el chip de cada tarjeta NFC. Busca el número en
// `tarjetas_nfc` y manda a la persona a donde diga, sin mostrar nada de CES.
//
// 302 y no 301/308 A PROPÓSITO: un redirect permanente lo guarda el navegador,
// y entonces si el negocio cambia de enlace, el celular de quien ya escaneó
// la tarjeta seguiría yendo al viejo. Por lo mismo, no-store.
//
// No se guarda nada de quien escanea: ni IP ni conteo. Ver
// supabase/tarjetas-nfc.sql.

const SIN_CACHE = { "Cache-Control": "no-store" };

function irA(destino: string | URL) {
  return NextResponse.redirect(destino, { status: 302, headers: SIN_CACHE });
}

export async function GET(request: NextRequest, ctx: RouteContext<"/r/[numero]">) {
  const { numero } = await ctx.params;

  if (numero === NUMERO_MUESTRA) {
    return irA(new URL("/#tarjeta-nfc", request.url));
  }

  const sinActivar = new URL("/tarjeta-sin-activar", request.url);
  if (!/^\d{1,6}$/.test(numero)) return irA(sinActivar);

  const { data, error } = await supabase
    .from("tarjetas_nfc")
    .select("url")
    .eq("numero", Number(numero))
    .maybeSingle();

  if (error) {
    console.error("[tarjetas] no se pudo leer la tarjeta", numero, error.message);
    sinActivar.searchParams.set("error", "1");
    return irA(sinActivar);
  }

  // La tabla solo acepta http(s) y el admin lo vuelve a validar al guardar,
  // pero esto abre el celular de un desconocido: se revisa una vez más.
  const url = data?.url;
  if (!url || !/^https?:\/\//i.test(url)) return irA(sinActivar);

  return irA(url);
}
