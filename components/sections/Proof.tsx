"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export function Proof() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(ref.current, {
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
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
    <div
      ref={ref}
      className="relative z-1 mb-[60px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#4ade80] to-accent-green px-6 py-10 md:px-12 md:py-14 text-center shadow-lg"
    >
      <span className="block text-[12.5px] font-semibold text-white/80 uppercase tracking-[0.08em] mb-3">
        La evidencia está aquí mismo
      </span>
      <h2 className="text-[clamp(24px,3.4vw,34px)] font-bold leading-[1.2] mb-4 text-white max-w-[640px] mx-auto">
        Esta misma página que estás viendo — el diseño, las animaciones,
        todo — la hicimos nosotros
      </h2>
      <p className="text-white/85 text-base md:text-lg leading-[1.6] max-w-[560px] mx-auto mb-8">
        Así de profesional te armamos también la tuya. Por{" "}
        <strong className="font-bold">$400.000</strong> (diseño, pago único) más{" "}
        <strong className="font-bold">$150.000/mes</strong> de mantenimiento.
      </p>
      <a
        href="#contacto"
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-white text-accent-green transition-all duration-300 ease-out hover:brightness-95 hover:-translate-y-1.5 hover:shadow-[0_10px_24px_-6px_rgba(0,0,0,0.25)]"
      >
        Quiero una página así →
      </a>
    </div>
  );
}
