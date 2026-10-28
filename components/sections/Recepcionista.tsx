import { RECEPCIONISTA, formatCOP, whatsAppLink } from "@/lib/business";
import { PrimerMesGratis } from "@/components/PrimerMesGratis";

// Recepcionista de llamadas con IA, anunciado el 27 de octubre de 2026.
// Precios y lo que incluye salen de RECEPCIONISTA en lib/business.ts, igual
// que la ficha de Google: el agente de WhatsApp y los términos leen de ahí.
//
// Va después de la tarjeta NFC y antes de las preguntas: es el servicio más
// nuevo, así que no le quita lugar a lo que ya se vende, pero queda antes del
// registro para quien llegó hasta abajo.
//
// La conversación de ejemplo es la de la demo real (restaurante inventado),
// con las respuestas cortas que Samuel pidió. La primera línea dice que es una
// asistente virtual a propósito: es la regla del servicio y aquí se muestra.

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

const LLAMADA: { quien: "ella" | "cliente"; texto: string }[] = [
  { quien: "ella", texto: "Restaurante, muy buenas. Le habla Valentina, la asistente virtual. ¿En qué le puedo ayudar?" },
  { quien: "cliente", texto: "Quiero reservar una mesa para el sábado." },
  { quien: "ella", texto: "Con mucho gusto. ¿Para cuántas personas?" },
  { quien: "cliente", texto: "Somos cuatro, a las ocho de la noche." },
  { quien: "ella", texto: "Listo, ya lo anoté. ¿A nombre de quién?" },
];

const REGLAS = [
  "Dice que es la asistente virtual de tu negocio: nunca se hace pasar por una persona.",
  "Solo dice lo que tú le enseñaste. Si no sabe algo, toma el recado y te avisa.",
  "Si el cliente está molesto o pide hablar con alguien, te pasa el recado de una.",
];

export function Recepcionista() {
  return (
    <section id="recepcionista" className="relative z-1 pb-[72px] md:pb-[104px]">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-11 lg:gap-16 items-start">
        <div>
          <div className="eyebrow mb-5">Nuevo · Recepcionista con IA</div>
          <h2 className="text-[clamp(28px,3.9vw,42px)] leading-[1.1] font-bold mb-5 text-ink text-balance">
            Que ninguna llamada <span className="marker">se quede sin contestar</span>
          </h2>
          <p className="text-[16px] leading-[1.7] text-ink-muted mb-8 max-w-[52ch]">
            Cuando estás atendiendo, cocinando o ya cerraste, el cliente que llama
            y no le contestan llama a otro. Tu recepcionista contesta por ti, con
            una voz natural en español de Colombia: toma reservas y citas,
            responde horarios y precios, y te deja cada recado anotado.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-[460px] mb-3">
            <div className="rounded-[14px] border border-line bg-white px-4 py-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-ink-faint mb-1.5">
                Montaje
              </div>
              <div className="price-now text-[28px] text-ink">
                {RECEPCIONISTA.montaje ? formatCOP(RECEPCIONISTA.montaje) : "Gratis"}
              </div>
              <div className="text-[12.5px] text-ink-faint mt-1">
                {RECEPCIONISTA.montaje ? "pago único" : "no pagas por instalarla"}
              </div>
            </div>
            <div className="rounded-[14px] border border-gold/60 bg-gold-bg px-4 py-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-gold-deep mb-1.5">
                Mensualidad
              </div>
              <div className="price-now text-[28px] text-ink">{formatCOP(RECEPCIONISTA.mensual)}</div>
              <div className="text-[12.5px] text-ink-faint mt-1">al mes</div>
            </div>
          </div>
          <PrimerMesGratis className="mt-1 mb-4" />
          <p className="text-[13px] text-ink-faint mb-8 max-w-[52ch]">
            La mensualidad incluye {RECEPCIONISTA.minutosIncluidos} minutos de
            llamadas; cada minuto
            adicional vale {formatCOP(RECEPCIONISTA.minutoExtra)}. Se contrata
            aparte de la página, y funciona tengas página o no.
          </p>

          <a
            href={whatsAppLink("Hola, me interesa la recepcionista con IA para contestar las llamadas de mi negocio")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Quiero mi recepcionista
          </a>
        </div>

        <div className="rounded-[18px] border border-line bg-white p-7 md:p-8 shadow-[0_24px_50px_-34px_rgba(11,16,32,0.45)]">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-blue-bright mb-3">
            Así contesta
          </div>
          <div className="flex flex-col gap-2 mb-7">
            {LLAMADA.map((l, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-[14px] px-3.5 py-2.5 text-[13.5px] leading-[1.5] ${
                  l.quien === "ella"
                    ? "self-start bg-panel/80 text-ink"
                    : "self-end bg-navy text-white"
                }`}
              >
                {l.texto}
              </div>
            ))}
          </div>

          <h3 className="font-display font-bold text-[18px] text-ink mb-4">El montaje</h3>
          <ul className="flex flex-col gap-2.5 mb-7 list-none">
            {RECEPCIONISTA.montajeIncluye.map((item) => (
              <li key={item} className="flex gap-2.5 text-[14.5px] text-ink">
                <Check />
                {item}
              </li>
            ))}
          </ul>

          <h3 className="font-display font-bold text-[18px] text-ink mb-4">Cada mes</h3>
          <ul className="flex flex-col gap-2.5 mb-7 list-none">
            {RECEPCIONISTA.mesIncluye.map((item) => (
              <li key={item} className="flex gap-2.5 text-[14.5px] text-ink">
                <Check />
                {item}
              </li>
            ))}
          </ul>

          <div className="rounded-[12px] bg-panel/70 px-5 py-4">
            <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-blue-bright mb-2.5">
              Cómo trabaja
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
