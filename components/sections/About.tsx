"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const FOUNDERS = [
  {
    initial: "S",
    name: "Samuel Ceballos",
    role: "Co-fundador",
    avatarClass: "bg-gradient-to-br from-blue-bright to-blue-deep",
  },
  {
    initial: "E",
    name: "Emmanuel Castañeda",
    role: "Co-fundador",
    avatarClass: "bg-gradient-to-br from-accent-purple to-accent-purple-deep",
  },
];

export function About() {
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
    <section id="nosotros" className="about py-5 pb-[60px] relative z-1">
      <div
        ref={ref}
        className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-6 md:gap-[50px] items-center bg-white/95 backdrop-blur-sm rounded-2xl border border-line shadow-sm p-6 md:p-10"
      >
        <div className="flex flex-col gap-3.5">
          {FOUNDERS.map((f) => (
            <div key={f.name} className="flex items-center gap-3.5">
              <div
                className={`w-[52px] h-[52px] rounded-full flex items-center justify-center font-display font-bold text-[17px] text-white ${f.avatarClass}`}
              >
                {f.initial}
              </div>
              <div>
                <div className="font-semibold text-[15px]">{f.name}</div>
                <div className="text-[13px] text-ink">{f.role}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <span className="block text-[12.5px] font-semibold text-blue-bright uppercase tracking-[0.08em] mb-3">
            Quiénes somos
          </span>
          <h2 className="hero-gradient-text text-[clamp(30px,4.4vw,46px)] leading-[1.1] font-bold mb-[18px]">
            La unión de dos apellidos, un solo objetivo
          </h2>
          <p className="text-ink text-base leading-[1.7] mb-[18px]">
            CES Agencia nace de la unión de Samuel Ceballos y Emmanuel
            Castañeda — de ahí viene nuestro nombre. Somos de Pereira, y
            creemos que toda pyme merece una página web profesional, sin
            importar su tamaño.
          </p>
          <p className="text-ink text-base leading-[1.7] mb-[18px]">
            Trabajamos con negocios de Pereira y Dosquebradas que quieren
            presencia digital seria, a un precio justo y sin complicaciones.
          </p>
        </div>
      </div>
    </section>
  );
}
