"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export function Hero() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.from([".hero-badge", ".hero-line", ".hero-copy", ".hero-actions"], {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
      });
    },
    { scope },
  );

  return (
    <section className="relative z-1 py-[60px] md:py-[80px]">
      <div
        ref={scope}
        className="bg-white/95 backdrop-blur-sm border border-line shadow-sm rounded-2xl p-6 md:p-10"
      >
        <div className="hero-badge inline-flex items-center gap-2 text-[12.5px] text-blue-bright font-semibold uppercase tracking-[0.06em] border border-line bg-white/90 px-3.5 py-1.5 rounded-full mb-[22px]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-bright shadow-[0_0_8px_#6E93FF]" />
          Diseño web · Pereira y Dosquebradas
        </div>
        <h1 className="text-[clamp(34px,5.2vw,58px)] leading-[1.05] font-bold mb-[22px]">
          <span className="hero-line hero-gradient-text block">
            Tu negocio merece una página web
          </span>
          <span className="hero-line hero-gradient-text block">
            profesional de verdad
          </span>
        </h1>
        <p className="hero-copy text-lg text-ink-muted max-w-[640px] leading-[1.6] mb-8">
          Diseñamos páginas web profesionales para pequeños negocios de
          Pereira y Dosquebradas. Precio claro, lista en minutos.
        </p>
        <div className="hero-actions flex gap-3.5 flex-wrap">
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold transition-all duration-300 ease-out bg-gradient-to-br from-blue-bright to-blue text-white hover:brightness-110 hover:-translate-y-1.5 hover:shadow-[0_10px_24px_-6px_rgba(29,79,216,0.5)]"
          >
            Cotiza tu página web
          </a>
          <a
            href="#planes"
            className="inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold border border-line text-ink transition-all duration-300 ease-out hover:border-blue hover:bg-blue/8 hover:-translate-y-1.5 hover:shadow-md"
          >
            Ver el precio
          </a>
        </div>
      </div>
    </section>
  );
}
