import { FICHA_GOOGLE, TARJETA_NFC, formatCOP, whatsAppLink } from "@/lib/business";

// Servicio de ficha de Google (Perfil de Negocio), lanzado el 5 de octubre de
// 2026. Precios y lo que incluye salen de FICHA_GOOGLE en lib/business.ts,
// nunca escritos aquí: el agente de WhatsApp y los términos leen de ahí mismo.
//
// Va entre "Cómo funciona" y la banda oscura de contenido: queda cerca de las
// páginas, que es con lo que más se compara, y la página sigue alternando
// claro y oscuro.
//
// Las tres reglas de abajo (contraseña, reseñas, primer lugar) no son
// adorno: un dueño que ya se quemó con una "agencia" que le pidió la clave o
// le compró reseñas pregunta exactamente eso, y es lo que nos diferencia.

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent-green)"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 mt-[3px]"
      aria-hidden="true"
    >
      <path d="M5 12l5 5L20 6" />
    </svg>
  );
}

const REGLAS = [
  "Nunca te pedimos tu contraseña: nos agregas como administradores y la ficha sigue siendo tuya.",
  "No compramos ni inventamos reseñas, y respondemos todas, también las malas.",
  "No prometemos el primer lugar en Google: eso no lo controla nadie.",
];

export function FichaGoogle() {
  return (
    <section id="ficha-google" className="relative z-1 pb-[72px] md:pb-[104px]">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-11 lg:gap-16 items-start">
        <div>
          <div className="eyebrow mb-5">Servicio de ficha de Google</div>
          <h2 className="text-[clamp(28px,3.9vw,42px)] leading-[1.1] font-bold mb-5 text-ink text-balance">
            Que te escojan cuando te <span className="marker">buscan en Google Maps</span>
          </h2>
          <p className="text-[16px] leading-[1.7] text-ink-muted mb-8 max-w-[52ch]">
            Cuando alguien busca &ldquo;barbería cerca de mí&rdquo;, lo primero que ve
            es tu ficha de Google, no tu página. Nosotros la dejamos completa y la
            mantenemos viva cada semana, para que quien te encuentre tenga razones
            para llamarte o llegar.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-[460px] mb-3">
            <div className="rounded-[14px] border border-line bg-white px-4 py-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-ink-faint mb-1.5">
                Montaje
              </div>
              <div className="price-now text-[28px] text-ink">{formatCOP(FICHA_GOOGLE.montaje)}</div>
              <div className="text-[12.5px] text-ink-faint mt-1">pago único</div>
            </div>
            <div className="rounded-[14px] border border-gold/60 bg-gold-bg px-4 py-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-gold-deep mb-1.5">
                Mensualidad
              </div>
              <div className="price-now text-[28px] text-ink">{formatCOP(FICHA_GOOGLE.mensual)}</div>
              <div className="text-[12.5px] text-ink-faint mt-1">al mes</div>
            </div>
          </div>
          <p className="text-[13px] text-ink-faint mb-8 max-w-[52ch]">
            El montaje incluye una tarjeta NFC de reseñas, que sola vale{" "}
            {formatCOP(TARJETA_NFC.precio)}. Se contrata aparte de la página, y
            funciona tengas página o no.
          </p>

          <a
            href={whatsAppLink("Hola, me interesa que manejen la ficha de Google de mi negocio")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Quiero mi ficha al día
          </a>
        </div>

        <div className="rounded-[18px] border border-line bg-white p-7 md:p-8 shadow-[0_24px_50px_-34px_rgba(11,16,32,0.45)]">
          <h3 className="font-display font-bold text-[18px] text-ink mb-4">El montaje</h3>
          <ul className="flex flex-col gap-2.5 mb-7 list-none">
            {FICHA_GOOGLE.montajeIncluye.map((item) => (
              <li key={item} className="flex gap-2.5 text-[14.5px] text-ink">
                <Check />
                {item}
              </li>
            ))}
          </ul>

          <h3 className="font-display font-bold text-[18px] text-ink mb-4">Cada mes</h3>
          <ul className="flex flex-col gap-2.5 mb-7 list-none">
            {FICHA_GOOGLE.mesIncluye.map((item) => (
              <li key={item} className="flex gap-2.5 text-[14.5px] text-ink">
                <Check />
                {item}
              </li>
            ))}
          </ul>

          <div className="rounded-[12px] bg-panel/70 px-5 py-4">
            <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-blue-bright mb-2.5">
              Cómo trabajamos
            </div>
            <ul className="flex flex-col gap-2 list-none">
              {REGLAS.map((r) => (
                <li key={r} className="text-[13.5px] leading-[1.55] text-ink-muted">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
