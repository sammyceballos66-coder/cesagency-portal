import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// A donde llega quien escanea una tarjeta NFC que todavía no se ha vendido, o
// cuando la base no responde. Lo ve el CLIENTE del negocio, no el dueño: por
// eso no le habla de números ni de tablas, y no le pide nada.

export const metadata: Metadata = {
  title: "Tarjeta sin activar | CES Agencia",
  robots: { index: false, follow: false },
};

export default async function TarjetaSinActivar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const fallo = error === "1";

  return (
    <>
      <div className="field" />
      <main className="relative z-10 min-h-dvh flex items-center justify-center px-6 py-16">
        <div className="max-w-[420px] text-center">
          <Image src="/logo.png" alt="CES Agencia" width={642} height={205} className="mx-auto mb-10 h-auto w-[120px]" />
          <h1 className="text-[28px] leading-[1.15] font-bold text-ink mb-4 text-balance">
            {fallo ? "No pudimos abrir el enlace" : "Esta tarjeta todavía no está activada"}
          </h1>
          <p className="text-[16px] leading-[1.65] text-ink-muted mb-9">
            {fallo
              ? "Fue un problema de nuestro lado. Vuelve a acercar el celular o a escanear el código en un momento."
              : "Si estás en un negocio, pídele al personal que te ayude. Si eres el dueño y la acabas de recibir, escríbenos y te la dejamos lista."}
          </p>
          <Link href="/" className="btn-ghost">
            Conocer CES Agencia
          </Link>
        </div>
      </main>
    </>
  );
}
