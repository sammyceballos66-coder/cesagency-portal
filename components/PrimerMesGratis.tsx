import { BUSINESS } from "@/lib/business";

// La píldora verde de "primer mes gratis". Nació en las tarjetas de los planes
// y desde el 27 de octubre de 2026 la usan también la ficha de Google, el
// contenido y la recepcionista (Samuel pidió que se vieran iguales). Se apaga
// sola si BUSINESS.firstMonthFree deja de ser true.
export function PrimerMesGratis({
  oscuro = false,
  texto = "Primer mes de mensualidad gratis",
  className = "",
}: {
  /** true sobre fondos oscuros (plan destacado, banda de contenido). */
  oscuro?: boolean;
  texto?: string;
  className?: string;
}) {
  if (!BUSINESS.firstMonthFree) return null;
  return (
    <div
      className={`self-start inline-flex items-center gap-1.5 text-[12.5px] font-bold px-3 py-1.5 rounded-full ${
        oscuro ? "bg-white/12 text-white" : "bg-accent-green-bg text-accent-green"
      } ${className}`}
    >
      🎁 {texto}
    </div>
  );
}
