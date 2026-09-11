"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useTilt } from "@/hooks/useTilt";
import { PLANS, BUSINESS, PROMO, formatCOP, pricingFor, type Plan } from "@/lib/business";

function Check({ featured }: { featured?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={featured ? "var(--gold)" : "var(--accent-green)"}
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

/**
 * Una línea de precio: etiqueta, el precio anterior tachado si hay descuento,
 * y la cifra vigente. El precio viejo va ANTES del nuevo y más pequeño para
 * que se lea "de esto, a esto" y no al revés.
 */
function PriceRow({
  label,
  now,
  was,
  discounted,
  suffix,
  featured,
}: {
  label: string;
  now: number;
  was: number;
  discounted: boolean;
  suffix?: string;
  featured?: boolean;
}) {
  return (
    <div>
      <div
        className={`text-[11.5px] font-semibold uppercase tracking-[0.11em] mb-1.5 ${
          featured ? "text-white/50" : "text-ink-faint"
        }`}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-2.5 flex-wrap">
        {discounted && (
          <s className={`text-[17px] price-was ${featured ? "price-was--light" : ""}`}>
            <span className="sr-only">Antes: </span>
            {formatCOP(was)}
          </s>
        )}
        <span
          className={`price-now text-[34px] md:text-[38px] ${featured ? "text-white" : "text-ink"}`}
        >
          {formatCOP(now)}
        </span>
        {suffix && (
          <span className={`text-[15px] ${featured ? "text-white/70" : "text-ink-muted"}`}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  featured,
  promoLive,
}: {
  plan: Plan;
  featured?: boolean;
  promoLive: boolean;
}) {
  const tiltRef = useTilt<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement>(null);
  const price = pricingFor(plan, promoLive);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = cardRef.current;
      if (!el) return;

      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%" } });
      tl.from(el, { opacity: 0, y: 26, duration: 0.7, ease: "power3.out" }).from(
        gsap.utils.toArray(".plan-feature", el),
        { opacity: 0, y: 10, duration: 0.4, ease: "power2.out", stagger: 0.06 },
        "-=0.35",
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
      className={`plan tilt relative flex flex-col overflow-hidden rounded-[16px] p-[34px_28px] md:p-[40px_34px] ${
        featured
          ? "bg-navy text-white border border-white/12 shadow-[0_34px_70px_-28px_rgba(10,19,48,0.85)] lg:scale-[1.025]"
          : "bg-white border border-line shadow-[0_18px_40px_-28px_rgba(11,16,32,0.45)]"
      }`}
    >
      {featured && (
        <>
          {/* Resplandor dorado en la esquina — es lo que separa la tarjeta
              destacada de la otra sin recurrir a otro degradado azul. */}
          <div
            className="pointer-events-none absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(240,180,41,0.20), transparent 68%)",
            }}
          />
          <div className="tilt-shine tilt-shine--gold" />
        </>
      )}
      {!featured && <div className="tilt-shine" />}

      <div className="relative flex flex-col flex-1">
        {featured && (
          <div className="self-start inline-flex items-center text-[11px] font-bold uppercase tracking-[0.1em] text-[#1b1300] bg-gradient-to-r from-gold-soft to-gold px-3 py-1.5 rounded-full mb-5">
            Recomendado para citas
          </div>
        )}

        {/* La frase en lenguaje llano va primero y el nombre del plan después:
            "Página informativa" le dice algo a cualquiera, "Plan Esencial" no. */}
        <div
          className={`text-[12px] font-semibold uppercase tracking-[0.13em] mb-2 ${
            featured ? "text-gold" : "text-blue-bright"
          }`}
        >
          {plan.tagline}
        </div>
        <h3
          className={`text-[24px] font-bold font-display mb-2.5 ${featured ? "text-white" : "text-ink"}`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-[13.5px] leading-[1.6] mb-7 ${featured ? "text-white/65" : "text-ink-muted"}`}
        >
          {plan.description}
        </p>

        <div className="flex flex-col gap-5 mb-6">
          <PriceRow
            label="Pago único"
            now={price.setup}
            was={price.setupList}
            discounted={price.setupDiscounted}
            featured={featured}
          />
          <PriceRow
            label="Mensualidad"
            now={price.monthly}
            was={price.monthlyList}
            discounted={price.monthlyDiscounted}
            suffix="/mes"
            featured={featured}
          />
        </div>

        <p className={`text-[12.5px] leading-[1.5] mb-6 ${featured ? "text-white/55" : "text-ink-faint"}`}>
          La mensualidad cubre {BUSINESS.maintenanceIncludes}.
        </p>

        {BUSINESS.firstMonthFree && (
          <div
            className={`self-start inline-flex items-center gap-1.5 mb-7 text-[12.5px] font-bold px-3 py-1.5 rounded-full ${
              featured ? "bg-white/12 text-white" : "bg-accent-green-bg text-accent-green"
            }`}
          >
            🎁 Primer mes de mantenimiento gratis
          </div>
        )}

        <hr className={`border-none border-t mb-6 ${featured ? "border-white/15" : "border-line"}`} />

        <ul className="flex flex-col gap-3 mb-8 flex-1 list-none">
          {plan.features.map((f) => (
            <li
              key={f}
              className={`plan-feature flex gap-2.5 text-[14px] leading-[1.5] items-start ${
                featured ? "text-white/90" : "text-ink"
              }`}
            >
              <Check featured={featured} />
              {f}
            </li>
          ))}
        </ul>

        <a href="#registro" className={featured ? "btn-gold w-full" : "btn-primary w-full"}>
          Elegir {plan.name}
        </a>
      </div>
    </div>
  );
}

export function Plans({
  promoLive,
  promoDeadline,
}: {
  promoLive: boolean;
  promoDeadline: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(ref.current, {
        opacity: 0,
        y: 22,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 82%" },
      });
    },
    { scope: ref },
  );

  return (
    <section id="planes" className="pricing pt-[72px] pb-[80px] md:pt-[104px] md:pb-[104px] relative z-1">
      <div
        ref={ref}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-11 md:mb-14"
      >
        <div>
          <div className="eyebrow mb-5">Planes</div>
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.08] mb-4 text-ink max-w-[15ch]">
            Un plan para cada tipo de negocio
          </h2>
          <p className="text-ink-muted text-[16px] leading-[1.65] max-w-[46ch]">
            Un sitio informativo, o un sitio que además agenda las citas solo.
            El precio es el mismo para todos: no cotizamos por cliente.
          </p>
        </div>

        {promoLive && (
          <div className="shrink-0 rounded-[14px] border border-gold/45 bg-gold-bg px-5 py-4 max-w-[300px]">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-gold-deep mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              {PROMO.label}
            </div>
            <p className="text-[13.5px] leading-[1.5] text-ink">
              {promoDeadline ? (
                <>
                  Los precios tachados vuelven el <strong>{promoDeadline}</strong>.
                </>
              ) : (
                <>Precios de promoción por tiempo limitado.</>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-9 items-stretch">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            featured={plan.id === "reservas"}
            promoLive={promoLive}
          />
        ))}
      </div>
    </section>
  );
}
