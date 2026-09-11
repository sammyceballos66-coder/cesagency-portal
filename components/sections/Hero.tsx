"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { whatsAppLink } from "@/lib/business";

// Tres datos concretos en vez de adjetivos. Lo específico es lo que hace que
// una página no se lea como plantilla: "lista en minutos" y "el mismo motor
// que corre en Quality Barber Shop" son verificables; "calidad premium" no.
const PROOF = [
  {
    title: "Lista en minutos",
    detail: "Apenas nos pasas los datos de tu negocio, la página queda en línea.",
  },
  {
    title: "Motor de citas propio",
    detail: "El mismo que ya atiende las reservas de Quality Barber Shop.",
  },
  {
    title: "Sin dominio que comprar",
    detail: "Tu página vive en cesagencia.co y nosotros nos encargamos de todo.",
  },
];

export function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", { opacity: 0, y: 16, duration: 0.5 })
        .from(".hero-line", { opacity: 0, y: 28, duration: 0.75, stagger: 0.09 }, "-=0.25")
        // El subrayado dorado se pinta de izquierda a derecha después de que
        // la línea ya está en su sitio, como si alguien pasara el marcador.
        .from(".marker", { backgroundSize: "0% 100%", duration: 0.55, ease: "power2.inOut" }, "-=0.15")
        .from(".hero-copy", { opacity: 0, y: 18, duration: 0.6 }, "-=0.5")
        .from(".hero-actions", { opacity: 0, y: 18, duration: 0.6 }, "-=0.45")
        .from(".hero-proof", { opacity: 0, y: 20, duration: 0.6, stagger: 0.1 }, "-=0.35");
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative z-1 pt-[64px] pb-[52px] md:pt-[96px] md:pb-[80px]">
      <div className="hero-badge eyebrow mb-6">Diseño web · Pereira y Dosquebradas</div>

      <h1 className="text-[clamp(38px,6.6vw,74px)] leading-[1.02] font-bold text-ink max-w-[16ch] mb-7">
        <span className="hero-line block">Tu negocio merece</span>
        <span className="hero-line block">una página web</span>
        <span className="hero-line block">
          <span className="marker">profesional de verdad</span>
        </span>
      </h1>

      <p className="hero-copy text-[17px] md:text-[19px] text-ink-muted max-w-[54ch] leading-[1.65] mb-9">
        Diseñamos páginas web para pequeños negocios de Pereira y Dosquebradas.
        Precio claro, sin letra menuda, y lista en minutos.
      </p>

      <div className="hero-actions flex gap-3 flex-wrap mb-[62px] md:mb-[84px]">
        <a href="#planes" className="btn-primary">
          Ver los planes
        </a>
        <a
          href={whatsAppLink("Hola, quiero cotizar mi página web")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          Escríbenos por WhatsApp
        </a>
      </div>

      {/* Franja de datos. Separadores con borde en vez de tarjetas: mantiene
          la retícula del fondo visible y evita sumar otra caja blanca. */}
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line border-y border-line">
        {PROOF.map((item) => (
          <div key={item.title} className="hero-proof bg-void/70 backdrop-blur-[2px] px-1 py-6 sm:px-6">
            <dt className="font-display font-bold text-[17px] text-ink mb-1.5">{item.title}</dt>
            <dd className="text-[14px] text-ink-muted leading-[1.55]">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
