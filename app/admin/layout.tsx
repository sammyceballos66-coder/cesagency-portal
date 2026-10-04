import type { Metadata } from "next";

// Página privada de CES (hoy solo las tarjetas NFC). Fuera de Google: no es
// un secreto que exista, pero no tiene por qué salir en una búsqueda.
export const metadata: Metadata = {
  title: "Privado — CES Agencia",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="field" />
      <div className="relative z-10 min-h-dvh">{children}</div>
    </>
  );
}
