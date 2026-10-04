import { redirect } from "next/navigation";
import { haySesion } from "@/lib/admin-sesion";
import { supabase } from "@/lib/supabase";
import type { Tarjeta } from "@/lib/tarjetas";
import { accionSalir } from "../acciones";
import { Panel } from "./Panel";

// La página que Samuel abre en el celular en plena venta para decir a dónde
// lleva cada tarjeta. Ver lib/tarjetas.ts.

export default async function Tarjetas() {
  if (!(await haySesion())) redirect("/admin/entrar");

  const { data, error } = await supabase
    .from("tarjetas_nfc")
    .select("numero, negocio, destino, url")
    .order("numero");

  return (
    <>
      <header className="bg-navy text-white">
        <div className="max-w-[640px] mx-auto px-5 pt-6 pb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/60">CES · Privado</div>
            <h1 className="text-[22px] font-bold">Mis tarjetas</h1>
          </div>
          <form action={accionSalir}>
            <button type="submit" className="text-[13px] text-white/70 hover:text-white underline underline-offset-4">
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-5 py-6">
        {error ? (
          <p role="alert" className="rounded-[12px] bg-white border border-line p-4 text-[15px] text-accent-red">
            No se pudieron leer las tarjetas. Si es la primera vez, falta correr
            supabase/tarjetas-nfc.sql en Supabase.
          </p>
        ) : (
          <Panel tarjetas={data as Tarjeta[]} />
        )}
      </main>
    </>
  );
}
