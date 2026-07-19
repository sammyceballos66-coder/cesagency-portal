"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useTilt } from "@/hooks/useTilt";

const CHECK_SM = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4">
    <path d="M5 12l5 5L20 6" />
  </svg>
);

const FEATURES = [
  "Diseño profesional a la medida de tu negocio",
  "Adaptada a celular y computador",
  "Botón directo a tu WhatsApp",
  "Hasta 5 secciones (inicio, servicios, contacto, etc.)",
  "Entrega en minutos",
];

function PriceCard() {
  const tiltRef = useTilt<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = cardRef.current;
      if (!el) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 75%" },
      });

      tl.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
      }).from(
        gsap.utils.toArray(".plan-feature", el),
        {
          opacity: 0,
          y: 12,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.08,
        },
        "-=0.3",
      );
    },
    { scope: cardRef },
  );

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
        tiltRef.current = node;
      }}
      className="plan tilt relative flex flex-col rounded-[14px] bg-white/95 backdrop-blur-sm border border-line shadow-sm p-[36px_30px] max-w-[380px] mx-auto"
    >
      <div className="tilt-shine" />
      <div className="self-start inline-flex items-center text-[13px] font-bold uppercase tracking-[0.06em] text-blue-bright border border-line bg-white/90 px-3.5 py-1.5 rounded-full mb-2">
        Página Web
      </div>
      <div className="text-[13.5px] text-ink mb-[22px]">
        Ideal para negocios pequeños que quieren presencia profesional en
        internet
      </div>
      <div className="text-[15px] text-ink mb-0.5">
        <strong className="text-[40px] text-ink font-bold font-display">
          $400.000
        </strong>{" "}
        COP
      </div>
      <div className="text-sm text-ink mb-[22px]">pago único</div>
      <hr className="border-none border-t border-line mb-5" />
      <ul className="flex flex-col gap-3 mb-[26px] flex-1 list-none">
        {FEATURES.map((f) => (
          <li key={f} className="plan-feature flex gap-2.5 text-sm items-start">
            <span className="shrink-0 mt-[3px]">{CHECK_SM}</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href="#contacto"
        className="btn justify-center w-full inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold transition-all duration-300 ease-out bg-gradient-to-br from-blue-bright to-blue text-white hover:brightness-110 hover:-translate-y-1.5 hover:shadow-[0_10px_24px_-6px_rgba(29,79,216,0.5)]"
      >
        Quiero mi página web
      </a>
      <p className="text-center text-xs text-ink-muted mt-4">
        Dominio y hosting incluidos — los administramos nosotros por
        $150.000/mes.
      </p>
    </div>
  );
}

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(ref.current, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
        },
      });
    },
    { scope: ref },
  );

  return (
    <section id="planes" className="pricing py-[40px] pb-[60px] relative z-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[50px] items-center">
        <div
          ref={ref}
          className="rounded-2xl bg-gradient-to-br from-blue-bright to-blue p-6 md:p-8 shadow-lg"
        >
          <span className="block text-[12.5px] font-semibold text-white/80 uppercase tracking-[0.08em] mb-3">
            Precio
          </span>
          <h2 className="text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.15] mb-3.5 text-white">
            Un solo precio, sin letras pequeñas
          </h2>
          <p className="text-white/85 text-base leading-[1.6]">
            Página web profesional para tu negocio, lista en minutos.
          </p>
        </div>
        <PriceCard />
      </div>
    </section>
  );
}
