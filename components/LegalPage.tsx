import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";

// Caparazón compartido de /terminos y /privacidad. Repite el fondo y el
// stacking de app/page.tsx a propósito: el z-index positivo en el contenido,
// en vez de uno negativo en el fondo, es lo que evita el bug de WebKit móvil
// donde el degradado solo aparecía durante el rebote del overscroll.
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="field" />
      <div className="drift" />
      <div className="relative z-10">
        <Header />
        <main className="wrap max-w-[1180px] mx-auto px-7">
          <article className="max-w-[68ch] mx-auto py-14 sm:py-20">
            <Link
              href="/"
              className="text-[13px] text-ink-muted hover:text-blue-bright transition-colors"
            >
              ← Volver al inicio
            </Link>
            <h1 className="mt-6 text-[clamp(2rem,1.4rem+2.4vw,3rem)] font-semibold tracking-tight text-ink text-balance">
              {title}
            </h1>
            <p className="mt-3 text-[13px] text-ink-faint">
              Última actualización: {updated}
            </p>
            <div className="legal-prose mt-10">{children}</div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
