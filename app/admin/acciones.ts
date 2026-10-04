"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { entrar, haySesion, salir } from "@/lib/admin-sesion";
import { supabase } from "@/lib/supabase";
import { esDestino, leerNumeros, nombreDestino, normalizarUrl } from "@/lib/tarjetas";

// Las acciones son endpoints públicos aunque solo se llamen desde la página
// privada: cualquiera puede mandarles un POST. Por eso cada una revisa la
// sesión ella misma, en vez de confiar en que la página ya lo hizo.

export type Estado = {
  error?: string;
  listo?: string;
  /** Las tarjetas que se acaban de asignar, para el botón de probarlas. */
  numeros?: number[];
};

export async function accionEntrar(_prev: Estado, datos: FormData): Promise<Estado> {
  const resultado = await entrar(String(datos.get("clave") ?? ""));
  if (resultado === "ok") redirect("/admin/tarjetas");
  if (resultado === "bloqueado") return { error: "Demasiados intentos. Espera 15 minutos." };
  if (resultado === "deshabilitado") {
    return { error: "Falta configurar la clave (TARJETAS_CLAVE) en Vercel." };
  }
  return { error: "Clave incorrecta." };
}

export async function accionSalir(): Promise<void> {
  await salir();
  redirect("/admin/entrar");
}

const NEGOCIO_MAX = 120;

function mismoNegocio(a: string | null, b: string): boolean {
  return (a ?? "").trim().toLowerCase() === b.trim().toLowerCase();
}

export async function accionAsignar(_prev: Estado, datos: FormData): Promise<Estado> {
  if (!(await haySesion())) redirect("/admin/entrar");

  const numeros = leerNumeros(String(datos.get("numeros") ?? ""));
  const negocio = String(datos.get("negocio") ?? "").trim();
  const destino = String(datos.get("destino") ?? "");
  const editando = Number(datos.get("editando") ?? 0);

  if (!numeros) return { error: "Escribe el número de la tarjeta, por ejemplo 7, o 7 y 8 si son dos." };
  if (!negocio || negocio.length > NEGOCIO_MAX) return { error: "Escribe el nombre del negocio." };
  if (!esDestino(destino)) return { error: "Escoge a dónde lleva la tarjeta." };

  const url = normalizarUrl(String(datos.get("url") ?? ""), destino);
  if (!url) {
    return {
      error:
        destino === "whatsapp"
          ? "Ese enlace o número no sirve. Pega el número de WhatsApp (ej. 300 123 4567) o un enlace que empiece por https://"
          : "Ese enlace no sirve. Debe ser una dirección de internet, como https://…",
    };
  }

  const { data: actuales, error: errorLectura } = await supabase
    .from("tarjetas_nfc")
    .select("numero, negocio")
    .in("numero", numeros);
  if (errorLectura) return { error: "No se pudo leer la base. Intenta de nuevo." };

  const existentes = new Map(actuales.map((t) => [t.numero as number, t.negocio as string | null]));
  const faltan = numeros.filter((n) => !existentes.has(n));
  if (faltan.length) {
    return { error: `La tarjeta ${faltan.join(", ")} no existe todavía. Agrégala abajo en "Agregar tarjetas".` };
  }

  // Un dedazo en el número le quitaría la tarjeta a otro negocio sin que nadie
  // se diera cuenta: su tarjeta del mostrador empezaría a mandar a la ficha de
  // otro. Por eso una tarjeta ya vendida solo se cambia editándola desde la
  // lista, no escribiendo su número en una venta nueva.
  const ajenas = numeros.filter((n) => {
    const dueño = existentes.get(n);
    return dueño && !mismoNegocio(dueño, negocio) && n !== editando;
  });
  if (ajenas.length) {
    const n = ajenas[0];
    return {
      error: `La tarjeta ${n} ya es de ${existentes.get(n)}. Revisa el número. Si de verdad quieres cambiarla, tócala en la lista y edítala.`,
    };
  }

  const { error } = await supabase
    .from("tarjetas_nfc")
    .update({ negocio, destino, url, actualizada_en: new Date().toISOString() })
    .in("numero", numeros);
  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath("/admin/tarjetas");
  const cuales = numeros.length === 1 ? `La tarjeta ${numeros[0]} ahora lleva` : `Las tarjetas ${numeros.join(", ")} ahora llevan`;
  return { listo: `${cuales} a ${nombreDestino(destino)} de ${negocio}.`, numeros };
}

export async function accionLiberar(datos: FormData): Promise<void> {
  if (!(await haySesion())) redirect("/admin/entrar");
  const numero = Number(datos.get("numero"));
  if (!Number.isInteger(numero) || numero < 1) return;

  await supabase
    .from("tarjetas_nfc")
    .update({ negocio: null, destino: null, url: null, actualizada_en: new Date().toISOString() })
    .eq("numero", numero);
  revalidatePath("/admin/tarjetas");
}

export async function accionAgregar(_prev: Estado, datos: FormData): Promise<Estado> {
  if (!(await haySesion())) redirect("/admin/entrar");
  const cantidad = Number(datos.get("cantidad"));
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 100) {
    return { error: "Escribe cuántas tarjetas nuevas mandaste a imprimir (entre 1 y 100)." };
  }

  const { data: ultima, error: errorLectura } = await supabase
    .from("tarjetas_nfc")
    .select("numero")
    .order("numero", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (errorLectura) return { error: "No se pudo leer la base. Intenta de nuevo." };

  const desde = (ultima?.numero ?? 0) + 1;
  const filas = Array.from({ length: cantidad }, (_, i) => ({ numero: desde + i }));
  const { error } = await supabase.from("tarjetas_nfc").insert(filas);
  if (error) return { error: "No se pudieron agregar. Intenta de nuevo." };

  revalidatePath("/admin/tarjetas");
  const hasta = desde + cantidad - 1;
  return {
    listo:
      cantidad === 1
        ? `Agregada la tarjeta ${desde}.`
        : `Agregadas las tarjetas ${desde} a ${hasta}. Esos son los números que van impresos en el lote nuevo.`,
  };
}
