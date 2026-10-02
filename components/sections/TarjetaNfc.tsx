"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useTilt } from "@/hooks/useTilt";
import { TARJETA_NFC, formatCOP, whatsAppLink } from "@/lib/business";

// La tarjeta está dibujada en código, no es una foto: pesa casi nada, queda
// nítida en cualquier pantalla y se le cambia el texto sin rehacer imágenes.
//
// Dos decisiones que no son de estilo:
//
// - Dice "TU NEGOCIO" y no el nombre de un cliente real. Ningún cliente tiene
//   todavía la tarjeta; ponerle el nombre de Quality Barber Shop haría creer
//   que sí.
// - No lleva el logo de Google. Es una marca de ellos y esto es publicidad de
//   CES: se dice "en Google" con texto, igual que con Renault se nombra al
//   negocio y no se usa el logo del fabricante.

function IconoNfc({ className = "" }: { className?: string }) {
  // El símbolo de "sin contacto": ondas que salen hacia la derecha.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8.5a5 5 0 0 1 0 7" />
      <path d="M9.5 6a9 9 0 0 1 0 12" />
      <path d="M13 3.5a13 13 0 0 1 0 17" />
    </svg>
  );
}

function Estrella({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.8l2.84 5.76 6.36.92-4.6 4.49 1.09 6.33L12 17.31l-5.69 2.99 1.09-6.33-4.6-4.49 6.36-.92z"
      />
    </svg>
  );
}

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

/** La tarjeta de reseñas, de frente. Proporción de tarjeta de crédito real. */
function TarjetaResenas() {
  return (
    <div
      className="nfc-tarjeta relative w-full aspect-[1.586] rounded-[18px] overflow-hidden text-white border border-white/12 shadow-[0_30px_60px_-24px_rgba(10,19,48,0.75)]"
      style={{
        background:
          "radial-gradient(ellipse 120% 90% at 100% 0%, rgba(240,180,41,0.22), transparent 55%), linear-gradient(140deg, #0a1330 0%, #131f47 55%, #0a1330 100%)",
      }}
    >
      {/* Brillo diagonal, como el reflejo del plástico laminado. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.10) 45%, transparent 60%)",
        }}
      />

      <div className="relative h-full flex flex-col justify-between p-[7%]">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display font-bold text-[clamp(13px,3.6cqw,17px)] tracking-[0.18em]">
              TU NEGOCIO
            </div>
            <div className="text-[clamp(9px,2.4cqw,11px)] text-white/55 tracking-[0.12em] uppercase mt-0.5">
              Pereira · Dosquebradas
            </div>
          </div>

          {/* La zona donde se acerca el celular, con ondas que salen. */}
          <div className="relative w-[18%] aspect-square shrink-0">
            <span className="nfc-onda" />
            <span className="nfc-onda nfc-onda--2" />
            <div className="relative w-full h-full rounded-full border border-gold/60 bg-gold/10 grid place-items-center text-gold">
              <IconoNfc className="w-[55%] h-[55%]" />
            </div>
          </div>
        </div>

        <div>
          <div className="font-display font-bold leading-[1.05] text-[clamp(20px,6.4cqw,30px)]">
            Déjanos tu reseña
          </div>
          <div className="font-display text-[clamp(14px,4.2cqw,20px)] text-gold mt-0.5">en Google</div>
          <div className="flex gap-[3%] mt-[4%] text-gold w-[42%]">
            {[0, 1, 2, 3, 4].map((i) => (
              <Estrella key={i} className="w-full h-auto" />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[clamp(9px,2.6cqw,12px)] text-white/70">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[1.1em] h-[1.1em]"
            aria-hidden="true"
          >
            <rect x="6" y="2" width="12" height="20" rx="2.5" />
            <path d="M11 18h2" />
          </svg>
          Acerca tu celular a la tarjeta
        </div>
      </div>
    </div>
  );
}

/** La versión de WhatsApp, asomada detrás para mostrar que hay variantes. */
function TarjetaWhatsApp() {
  return (
    <div
      className="relative w-full aspect-[1.586] rounded-[18px] overflow-hidden text-white border border-white/15 shadow-[0_24px_48px_-24px_rgba(4,40,20,0.7)]"
      style={{ background: "linear-gradient(140deg, #128c4a 0%, #0b6b38 100%)" }}
    >
      <div className="h-full flex flex-col justify-end p-[7%]">
        <div className="font-display font-bold text-[clamp(16px,5cqw,24px)] leading-tight">
          Escríbenos por WhatsApp
        </div>
        <div className="text-[clamp(9px,2.6cqw,12px)] text-white/75 mt-1">Pide sin buscar el número</div>
      </div>
    </div>
  );
}

/** El celular que muestra qué pasa después del toque. Pantalla genérica, no la de Google. */
function Celular() {
  return (
    <div className="w-[124px] aspect-[9/19] rounded-[26px] bg-[#0b1020] p-[6px] shadow-[0_30px_60px_-20px_rgba(11,16,32,0.6)] border border-white/10">
      <div className="h-full w-full rounded-[20px] bg-white overflow-hidden flex flex-col">
        <div className="h-[22px] flex items-center justify-center">
          <div className="w-[38%] h-[7px] rounded-full bg-[#0b1020]" />
        </div>
        <div className="flex-1 px-3 pt-2 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-navy grid place-items-center text-gold text-[9px] font-bold">
              TN
            </div>
            <div className="flex-1">
              <div className="h-[5px] w-[80%] rounded bg-ink/80 mb-1" />
              <div className="h-[4px] w-[50%] rounded bg-ink/25" />
            </div>
          </div>
          <div className="text-[9.5px] font-semibold text-ink leading-tight mb-2">Califica tu experiencia</div>
          <div className="flex gap-[3px] text-gold mb-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Estrella key={i} className="w-[15px] h-[15px]" />
            ))}
          </div>
          <div className="rounded-md border border-ink/15 p-1.5 mb-3 space-y-1">
            <div className="h-[4px] w-full rounded bg-ink/15" />
            <div className="h-[4px] w-[85%] rounded bg-ink/15" />
            <div className="h-[4px] w-[60%] rounded bg-ink/15" />
          </div>
          <div className="mt-auto mb-3 h-[22px] rounded-full bg-blue-bright text-white text-[9px] font-semibold grid place-items-center">
            Publicar
          </div>
        </div>
      </div>
    </div>
  );
}

export function TarjetaNfc() {
  const scope = useRef<HTMLElement>(null);
  const tiltRef = useTilt<HTMLDivElement>();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: scope.current, start: "top 75%" },
      });
      tl.from(".nfc-escena", { opacity: 0, y: 30, duration: 0.8 })
        .from(".nfc-celular", { opacity: 0, x: 30, y: 20, duration: 0.7 }, "-=0.45")
        .from(".nfc-texto > *", { opacity: 0, y: 18, duration: 0.55, stagger: 0.07 }, "-=0.6");
    },
    { scope },
  );

  return (
    <section ref={scope} id="tarjeta-nfc" className="relative z-1 pt-[72px] pb-[56px] md:pt-[104px] md:pb-[72px]">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-12 lg:gap-16 items-center">
        {/* La escena: tarjeta de reseñas al frente, la de WhatsApp asomada
            detrás, y el celular mostrando qué se abre al tocarla. */}
        {/* El espacio de abajo y a la derecha es para el celular: va pegado a
            la esquina inferior de la tarjeta y NO encima de la zona de las
            ondas, que es lo que explica qué hace la tarjeta. Con el celular a
            la altura de la tarjeta, la tapaba entera. */}
        <div className="nfc-escena relative mx-auto w-full max-w-[460px] pb-10 sm:pb-[150px] pr-0 sm:pr-10">
          <div className="absolute left-[10%] top-[-6%] w-[82%] -rotate-[9deg] opacity-90" style={{ containerType: "inline-size" }}>
            <TarjetaWhatsApp />
          </div>

          <div ref={tiltRef} className="tilt relative" style={{ containerType: "inline-size" }}>
            <TarjetaResenas />
          </div>

          <div className="nfc-celular absolute right-0 bottom-0 hidden sm:block rotate-[6deg]">
            <Celular />
          </div>
        </div>

        <div className="nfc-texto">
          <div className="eyebrow mb-5">Servicio adicional</div>
          <h2 className="text-[clamp(28px,3.9vw,42px)] leading-[1.1] font-bold mb-5 text-ink">
            Una reseña en Google,
            <br />
            <span className="marker">con solo acercar el celular</span>
          </h2>
          <p className="text-[16px] leading-[1.7] text-ink-muted mb-7 max-w-[48ch]">
            Una tarjeta para el mostrador de tu negocio. Tus clientes la tocan
            con el celular y se les abre directo, sin buscarte ni escribir nada.
            En la mayoría de celulares no hace falta descargar ninguna app.
          </p>

          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-faint mb-3">
            Tú escoges a dónde lleva
          </div>
          <ul className="flex flex-col gap-2.5 mb-8 list-none">
            {TARJETA_NFC.destinos.map((d) => (
              <li key={d} className="flex gap-2.5 text-[14.5px] text-ink">
                <Check />
                {d}
              </li>
            ))}
          </ul>

          <div className="flex items-baseline gap-2.5 flex-wrap mb-1.5">
            <span className="price-now text-[38px] text-ink">{formatCOP(TARJETA_NFC.precio)}</span>
            <span className="text-[15px] text-ink-muted">pago único</span>
          </div>
          <p className="text-[13px] text-ink-faint mb-8">
            Te la entregamos configurada. Es tuya: no depende de ninguna mensualidad.
          </p>

          <a
            href={whatsAppLink("Hola, me interesa la tarjeta NFC para mi negocio")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Quiero mi tarjeta
          </a>
        </div>
      </div>
    </section>
  );
}
