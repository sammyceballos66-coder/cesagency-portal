import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { superaElLimite } from "./rate-limit";

// Sesión de la página privada de las tarjetas (/admin). Solo server-side.
//
// No hay usuarios: hay UNA clave, en la variable de entorno TARJETAS_CLAVE de
// Vercel, que comparten Samuel y Emmanuel. Para una página que usan dos
// personas, montar cuentas sería más código que proteger que lo que protege.
//
// La cookie no guarda la clave: guarda una firma derivada de ella. Eso tiene
// una consecuencia útil: cambiar la clave en Vercel cierra todas las sesiones
// abiertas, porque las firmas viejas dejan de coincidir. Si un celular se
// pierde, eso es lo que hay que hacer.

const COOKIE = "ces_admin";
const DURACION_SEGUNDOS = 60 * 60 * 24 * 30; // 30 días: se entra en la calle, en plena venta.

// Debajo de esto la clave se adivina probando, y el freno de abajo es por
// instancia (ver lib/rate-limit.ts), no una garantía.
const LARGO_MINIMO = 10;

function clave(): string | null {
  const valor = process.env.TARJETAS_CLAVE;
  return valor && valor.length >= LARGO_MINIMO ? valor : null;
}

function firma(claveActual: string): string {
  return createHmac("sha256", claveActual).update("ces-tarjetas-sesion-v1").digest("hex");
}

function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Si la página privada está habilitada (hay clave configurada en Vercel). */
export function adminHabilitado(): boolean {
  return clave() !== null;
}

export async function haySesion(): Promise<boolean> {
  // La cookie se lee ANTES de mirar la clave, aunque no haya clave. Leerla es
  // lo que le dice a Next que la página depende de la petición; si se saltara
  // cuando falta la variable, el build la congelaría como página estática con
  // la respuesta de ese momento, y quedaría así aunque después se configure.
  const valor = (await cookies()).get(COOKIE)?.value;
  const claveActual = clave();
  if (!claveActual) return false;
  return Boolean(valor) && iguales(valor!, firma(claveActual));
}

export type ResultadoEntrar = "ok" | "clave-incorrecta" | "bloqueado" | "deshabilitado";

export async function entrar(intento: string): Promise<ResultadoEntrar> {
  const claveActual = clave();
  if (!claveActual) return "deshabilitado";

  // 5 intentos cada 15 minutos por IP. Va antes de comparar, para que un
  // bucle no pueda seguir probando aunque acierte.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
  if (superaElLimite(`admin:${ip}`, 5, 15 * 60 * 1000).bloqueado) return "bloqueado";

  if (!iguales(intento, claveActual)) return "clave-incorrecta";

  (await cookies()).set(COOKIE, firma(claveActual), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
  return "ok";
}

export async function salir(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
