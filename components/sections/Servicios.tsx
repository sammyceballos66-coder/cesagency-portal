import {
  CONTENIDO,
  PLANS,
  TARJETA_NFC,
  formatCOP,
  pricingFor,
  type PromoActiva,
} from "@/lib/business";

// Resumen de todo lo que vende CES, justo debajo del hero.
//
// Existe porque CES dejó de vender solo páginas: hoy son páginas, contenido
// para redes y tarjetas NFC, pero cada servicio estaba en su propia sección
// más abajo. Quien entraba veía una agencia de páginas web y tenía que bajar
// casi hasta el final para enterarse del resto. Las agencias de IA que se
// revisaron como referencia (octubre de 2026) muestran todo su catálogo en la
// primera pantalla después del hero, y con razón.
//
// Los precios salen de lib/business.ts, nunca escritos aquí. El de las páginas
// depende de si hay promoción, así que se recibe `promo` desde app/page.tsx,
// que es el único que mira el reloj.

function IconoPagina() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </svg>
  );
}

function IconoRedes() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 9.5v5l4-2.5z" />
    </svg>
  );
}

function IconoNfc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-6 h-6" aria-hidden="true">
      <path d="M6 8.5a5 5 0 0 1 0 7" />
      <path d="M9.5 6a9 9 0 0 1 0 12" />
      <path d="M13 3.5a13 13 0 0 1 0 17" />
    </svg>
  );
}

// Para quién: los negocios que CES persigue de verdad (la lista de prospectos
// es de barberías, peluquerías y spas, y el siguiente cliente es un
// restaurante). Dice "hecho para", no "trabajamos con": no hay clientes en
// todos esos rubros todavía.
const PARA_QUIEN = ["Barberías", "Peluquerías", "Spas", "Restaurantes", "Tiendas"];

export function Servicios({ promo }: { promo: PromoActiva | null }) {
  const desdePagina = Math.min(...PLANS.map((p) => pricingFor(p, promo !== null).setup));

  const servicios = [
    {
      icono: <IconoPagina />,
      titulo: "Páginas web",
      texto: "Informativa, o con un motor que agenda las citas solo. Lista en minutos y en tu dirección de cesagencia.co.",
      precio: `Desde ${formatCOP(desdePagina)}`,
      detalle: "pago único + mensualidad",
      href: "#planes",
      cta: "Ver planes",
      destacado: true,
    },
    {
      icono: <IconoRedes />,
      titulo: "Contenido para redes",
      texto: "Reels y piezas gráficas hechas con inteligencia artificial, cada mes, para que te encuentren en Instagram y TikTok.",
      precio: `Desde ${formatCOP(CONTENIDO.desde)}`,
      detalle: "al mes",
      href: "#contenido",
      cta: "Ver más",
      destacado: false,
    },
    {
      icono: <IconoNfc />,
      titulo: "Tarjeta NFC",
      texto: "Tus clientes la tocan con el celular y les abre tus reseñas de Google, tu WhatsApp o tus redes.",
      precio: formatCOP(TARJETA_NFC.precio),
      detalle: `pago único · 2 iguales por ${formatCOP(TARJETA_NFC.precioDos)}`,
      href: "#tarjeta-nfc",
      cta: "Ver diseños",
      destacado: false,
    },
  ];

  return (
    <section id="servicios" className="relative z-1 pb-[64px] md:pb-[88px]">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-9 md:mb-11">
        <div>
          <div className="eyebrow mb-5">Lo que hacemos</div>
          <h2 className="text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.1] text-ink max-w-[20ch]">
            Tres formas de que te encuentren
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 md:max-w-[340px] md:justify-end">
          <span className="w-full md:text-right text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint mb-0.5">
            Hecho para
          </span>
          {PARA_QUIEN.map((r) => (
            <span
              key={r}
              className="text-[13px] font-medium text-ink rounded-full border border-line-strong bg-white/70 px-3 py-1"
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {servicios.map((s) => (
          <a
            key={s.titulo}
            href={s.href}
            className={`group relative flex flex-col rounded-[16px] p-6 md:p-7 border transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 ${
              s.destacado
                ? "bg-navy text-white border-white/10 shadow-[0_24px_50px_-28px_rgba(10,19,48,0.8)] hover:shadow-[0_30px_60px_-26px_rgba(10,19,48,0.85)]"
                : "bg-white text-ink border-line shadow-[0_18px_40px_-30px_rgba(11,16,32,0.45)] hover:border-line-strong hover:shadow-[0_24px_48px_-28px_rgba(11,16,32,0.5)]"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl grid place-items-center mb-5 ${
                s.destacado ? "bg-gold/15 text-gold" : "bg-blue/10 text-blue-bright"
              }`}
            >
              {s.icono}
            </div>
            <h3 className={`font-display font-bold text-[20px] mb-2 ${s.destacado ? "text-white" : "text-ink"}`}>
              {s.titulo}
            </h3>
            <p className={`text-[14px] leading-[1.6] mb-6 flex-1 ${s.destacado ? "text-white/70" : "text-ink-muted"}`}>
              {s.texto}
            </p>
            <div>
              <div>
                <div className={`price-now text-[24px] ${s.destacado ? "text-white" : "text-ink"}`}>{s.precio}</div>
                <div className={`text-[12.5px] mt-1 ${s.destacado ? "text-white/55" : "text-ink-faint"}`}>{s.detalle}</div>
              </div>
              {/* El texto dice a dónde lleva ("Ver planes", no solo "Ver"), y el
                  círculo se rellena al pasar sobre la tarjeta entera: toda la
                  tarjeta es el enlace, así que el botón responde a ella y no
                  solo a sí mismo. La flecha baja porque lleva más abajo en la
                  misma página.

                  Va en su propia fila y no al lado del precio: en tablet las
                  tres tarjetas son angostas y lado a lado el botón se salía. */}
              <span
                className={`mt-5 pt-4 border-t w-full flex items-center justify-between gap-3 text-[13.5px] font-semibold ${
                  s.destacado ? "text-gold border-white/12" : "text-blue-bright border-line"
                }`}
              >
                {s.cta}
                <span
                  className={`w-9 h-9 rounded-full grid place-items-center border transition-[background-color,border-color,color,transform] duration-200 ease-out group-hover:scale-105 ${
                    s.destacado
                      ? "border-gold/40 group-hover:bg-gold group-hover:border-gold group-hover:text-navy"
                      : "border-blue/30 bg-blue/5 group-hover:bg-blue-bright group-hover:border-blue-bright group-hover:text-white"
                  }`}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 ease-out group-hover:translate-y-[2px]"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M6 13l6 6 6-6" />
                  </svg>
                </span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
