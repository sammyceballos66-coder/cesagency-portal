import Image from "next/image";
import { redirect } from "next/navigation";
import { haySesion } from "@/lib/admin-sesion";
import { FormEntrar } from "./FormEntrar";

export default async function Entrar() {
  if (await haySesion()) redirect("/admin/tarjetas");

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[360px]">
        <Image src="/logo.png" alt="CES Agencia" width={642} height={205} className="mx-auto mb-10 h-auto w-[120px]" />
        <h1 className="text-[24px] font-bold text-ink text-center mb-2">Tarjetas NFC</h1>
        <p className="text-[14px] text-ink-muted text-center mb-8">Solo para el equipo de CES.</p>
        <FormEntrar />
      </div>
    </main>
  );
}
