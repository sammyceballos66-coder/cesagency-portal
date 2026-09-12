import type { PromoActiva } from "@/lib/business";

/**
 * Franja de promoción. Va por encima del header y se va con el scroll — el
 * header es el que queda pegado arriba.
 *
 * Recibe la promoción como prop y NO importa las ventanas. Antes leía la
 * constante global: con una sola promoción daba igual, pero con varias
 * ventanas habría acabado mostrando el nombre de una y la fecha de otra.
 * Quién está vigente lo decide `app/page.tsx`, una sola vez.
 */
export function PromoBar({ promo }: { promo: PromoActiva }) {
  return (
    <a href="#planes" className="group relative z-30 block bg-navy text-white overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-7 py-2.5 flex items-center justify-center gap-x-2.5 gap-y-1 flex-wrap text-center">
        <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-gold">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          {promo.label}
        </span>
        <span className="text-[13px] text-white/80">
          Precios rebajados hasta el <strong className="text-white">{promo.hasta}</strong>.{" "}
          <span className="underline underline-offset-2 decoration-white/35 group-hover:decoration-white transition-colors">
            Ver los planes
          </span>
        </span>
      </div>
    </a>
  );
}
