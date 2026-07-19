"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useTilt } from "@/hooks/useTilt";

const CARDS = [
  {
    title: "Diseño profesional",
    desc: "Tu página se ve tan bien como la de cualquier empresa grande — sin el precio de una.",
    chipClass: "bg-blue/12",
    cardClass: "bg-gradient-to-b from-[#c7d9ff] to-[#eaf1ff]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D6BFF" strokeWidth="1.7">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M3 9h18M8 21h8" />
      </svg>
    ),
  },
  {
    title: "$400.000, pago único",
    desc: "Sin mensualidades ni letras pequeñas. Pagas una vez y la página es tuya.",
    chipClass: "bg-accent-green-bg",
    cardClass: "bg-gradient-to-b from-[#bbf7d0] to-[#e9fdf1]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.7">
        <path d="M20.6 12.4 12.4 20.6a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1 0-2.8L11.6 3.4A2 2 0 0 1 13 2.8h6a2 2 0 0 1 2 2v6a2 2 0 0 1-.4 1.6Z" />
        <circle cx="16.5" cy="7.5" r="1.5" fill="#16A34A" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Hecho en Pereira",
    desc: "Conocemos tu mercado porque somos de acá — Pereira y Dosquebradas.",
    chipClass: "bg-accent-amber-bg",
    cardClass: "bg-gradient-to-b from-[#fde68a] to-[#fff6df]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.7">
        <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.3" />
      </svg>
    ),
  },
];

function TrioCard({ title, desc, icon, chipClass, cardClass }: (typeof CARDS)[number]) {
  const tiltRef = useTilt<HTMLDivElement>();
  return (
    <div
      ref={tiltRef}
      className={`card tilt relative overflow-hidden rounded-[14px] border border-line p-7 transition-all duration-300 ease-out hover:border-blue-bright/40 hover:shadow-[0_14px_30px_-10px_rgba(29,79,216,0.35)] ${cardClass}`}
    >
      <div className="tilt-shine" />
      <div className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center mb-[18px] ${chipClass}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2.5">{title}</h3>
      <p className="text-[14.5px] text-ink-muted leading-[1.6]">{desc}</p>
    </div>
  );
}

export function Trio() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".card", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-1 py-5 pb-[60px] grid grid-cols-1 md:grid-cols-3 gap-5"
    >
      {CARDS.map((card) => (
        <TrioCard key={card.title} {...card} />
      ))}
    </section>
  );
}
