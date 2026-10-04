import { BUSINESS, TARJETA_NFC, formatCOP } from "@/lib/business";

// Preguntas frecuentes. Cada respuesta dice lo mismo que /terminos o que
// lib/business.ts — no hay aquí ninguna promesa que no esté escrita allá. Si
// los términos cambian, esto tiene que cambiar igual: un "sí" aquí y un "no"
// en los términos es exactamente lo que no se puede tener.
//
// Usa <details> nativo y no un acordeón con JavaScript: funciona sin cargar
// nada, se abre con teclado y los lectores de pantalla lo entienden solos.

const PREGUNTAS: { p: string; r: string }[] = [
  {
    p: "¿El dominio y la página quedan a mi nombre?",
    r: "No. Tu página vive en una dirección de cesagencia.co, como tunegocio.cesagencia.co, y nosotros conservamos el código. Lo tuyo es tu contenido: textos, fotos, logo, precios y los datos de tu negocio. Si más adelante quieres un dominio propio, se puede conversar aparte.",
  },
  {
    p: "¿Qué incluye la mensualidad?",
    r: `Cubre ${BUSINESS.maintenanceIncludes}. ${BUSINESS.firstMonthFree ? "El primer mes no se cobra: la mensualidad empieza a correr desde el segundo." : ""}`.trim(),
  },
  {
    p: "¿Cuánto se demora?",
    r: "La página queda lista en minutos una vez nos das la información de tu negocio. Lo que más se demora suele ser reunir las fotos y los precios.",
  },
  {
    p: "¿Qué pasa si quiero cancelar?",
    r: "Nos avisas por escrito y el servicio sigue hasta el final del mes que ya pagaste. El pago inicial no se devuelve, porque corresponde a un trabajo ya hecho. Al cancelar, la página deja de estar disponible.",
  },
  {
    p: "Si contrato en promoción, ¿después me suben el precio?",
    r: "No. El precio que rige es el que estaba publicado el día que contrataste, y se te respeta aunque la promoción ya haya terminado.",
  },
  {
    p: "¿Puedo contratar solo la tarjeta o solo el contenido?",
    r: `Sí. Se contratan aparte de la página, y también sin ella. La tarjeta es un pago único: ${formatCOP(TARJETA_NFC.precio)} una, o ${formatCOP(TARJETA_NFC.precioDos)} dos del mismo diseño. Si son de diseños distintos, cada una vale ${formatCOP(TARJETA_NFC.precio)}. Es tuya: sigue funcionando aunque no tengas ningún otro servicio con nosotros, y si cambias de enlace la actualizamos sin cambiar la tarjeta.`,
  },
];

export function Preguntas() {
  return (
    <section id="preguntas" className="relative z-1 pt-[24px] pb-[72px] md:pb-[96px]">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-8 lg:gap-14">
        <div>
          <div className="eyebrow mb-5">Preguntas</div>
          <h2 className="text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.1] text-ink mb-4">
            Lo que todos preguntan antes de arrancar
          </h2>
          <p className="text-[15px] leading-[1.65] text-ink-muted">
            El detalle completo está en los{" "}
            <a href="/terminos" className="text-blue-bright underline underline-offset-2 hover:no-underline">
              términos de servicio
            </a>
            , escritos en lenguaje corriente.
          </p>
        </div>

        <div className="border-t border-line">
          {PREGUNTAS.map((q) => (
            <details key={q.p} className="faq group border-b border-line">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-5 text-[16px] font-semibold text-ink">
                {q.p}
                <span
                  aria-hidden="true"
                  className="shrink-0 w-7 h-7 rounded-full border border-line-strong grid place-items-center text-ink-muted transition-transform duration-200 group-open:rotate-45"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="pb-5 pr-11 text-[15px] leading-[1.7] text-ink-muted">{q.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
