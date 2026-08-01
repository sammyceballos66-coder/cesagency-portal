"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useTilt } from "@/hooks/useTilt";
import { PLANS, BUSINESS, type Plan } from "@/lib/business";

const CHECK_SM = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4">
    <path d="M5 12l5 5L20 6" />
  </svg>
);

// Dorado en vez de verde para el plan destacado — contrasta mejor sobre el
// fondo azul y da un toque "premium" en vez del combo azul+blanco plano.
const CHECK_SM_GOLD = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.6">
    <path d="M5 12l5 5L20 6" />
  </svg>
);

function PlanCard({ plan, featured }: { plan: Plan; featured?: boolean }) {
  const tiltRef = useTilt<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = cardRef.current;
      if (!el) return;

      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%" } });
      tl.from(el, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" }).from(
        gsap.utils.toArray(".plan-feature", el),
        { opacity: 0, y: 12, duration: 0.4, ease: "power2.out", stagger: 0.08 },
        "-=0.3",
      );
    },
    { scope: cardRef },
  );

  const [setupAmount, ...setupRest] = plan.setupPrice.split(" ");

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
        tiltRef.current = node;
      }}
      className={`plan tilt relative flex flex-col overflow-hidden rounded-[14px] backdrop-blur-sm shadow-sm p-[36px_30px] ${
        featured
          ? "bg-gradient-to-br from-blue-deep via-blue-bright to-blue text-white border border-blue-bright shadow-[0_20px_50px_-15px_rgba(15,30,82,0.55)] md:scale-[1.03]"
          : "bg-white/95 border border-line"
      }`}
    >
      {featured && (
        // Franja diagonal de brillo — efecto "metálico"/premium sobre el
        // degradado azul, en vez de un azul plano.
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.22) 48%, transparent 62%)",
          }}
        />
      )}
      <div className="tilt-shine" />
      {featured && (
        <div className="self-start inline-flex items-center text-[12px] font-bold uppercase tracking-[0.06em] text-blue-deep bg-gradient-to-r from-amber-300 to-yellow-200 px-3.5 py-1.5 rounded-full mb-3">
          Recomendado para citas y reservas
        </div>
      )}
      <h3 className={`text-[22px] font-bold font-display mb-2 ${featured ? "text-white" : "text-ink"}`}>
        {plan.name}
      </h3>
      <p className={`text-[13.5px] mb-[22px] ${featured ? "text-white/85" : "text-ink-muted"}`}>
        {plan.description}
      </p>
      <div className={`text-[15px] mb-0.5 ${featured ? "text-white" : "text-ink"}`}>
        <strong className="text-[36px] font-bold font-display">{setupAmount}</strong>{" "}
        {setupRest.join(" ")}
      </div>
      <div className={`text-[15px] ${featured ? "text-white/85" : "text-ink-muted"}`}>
        + {plan.maintenancePrice} de mantenimiento ({BUSINESS.maintenanceIncludes})
      </div>
      {BUSINESS.firstMonthFree && (
        <div
          className={`self-start inline-flex items-center gap-1.5 mt-2.5 mb-[22px] text-[12.5px] font-bold uppercase tracking-[0.03em] px-3 py-1.5 rounded-full ${
            featured ? "bg-white text-blue-deep" : "bg-accent-green-bg text-accent-green"
          }`}
        >
          🎁 Primer mes de mantenimiento gratis
        </div>
      )}
      <hr className={`border-none border-t mb-5 ${featured ? "border-white/25" : "border-line"}`} />
      <ul className="flex flex-col gap-3 mb-[26px] flex-1 list-none">
        {plan.features.map((f) => (
          <li
            key={f}
            className={`plan-feature flex gap-2.5 text-sm items-start ${featured ? "text-white/95" : "text-ink"}`}
          >
            <span className="shrink-0 mt-[3px]">{featured ? CHECK_SM_GOLD : CHECK_SM}</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href="#registro"
        className={`btn justify-center w-full inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-1.5 ${
          featured
            ? "bg-white text-blue-bright hover:shadow-[0_10px_24px_-6px_rgba(255,255,255,0.5)]"
            : "bg-gradient-to-br from-blue-bright to-blue text-white hover:brightness-110 hover:shadow-[0_10px_24px_-6px_rgba(29,79,216,0.5)]"
        }`}
      >
        Elegir {plan.name}
      </a>
    </div>
  );
}

export function Plans() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(ref.current, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    },
    { scope: ref },
  );

  return (
    <section id="planes" className="pricing py-[40px] pb-[60px] relative z-1">
      <div
        ref={ref}
        className="text-center max-w-[640px] mx-auto mb-[44px] bg-white/35 backdrop-blur-sm border border-line rounded-2xl px-6 py-8 md:px-10 md:py-9"
      >
        <span className="block text-[12.5px] font-semibold text-blue-bright uppercase tracking-[0.08em] mb-3">
          Planes
        </span>
        <h2 className="text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.15] mb-3.5 text-ink">
          Un plan para cada tipo de negocio
        </h2>
        <p className="text-ink-muted text-base leading-[1.6]">
          Elige según lo que necesites: un sitio informativo, o un sitio con reservas automáticas.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[34px] items-stretch max-w-[880px] mx-auto">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} featured={plan.id === "reservas"} />
        ))}
      </div>
    </section>
  );
}
