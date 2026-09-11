"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SHOWCASE } from "@/lib/business";

import captura from "@/public/trabajo-quality-barber-shop.webp";

const HECHOS = [
  "Los clientes reservan a cualquier hora, sin que nadie tenga que contestar el teléfono.",
  "El barbero recibe la cita por correo apenas queda agendada.",
  "Al cliente le llega la confirmación, y un recordatorio 3 horas antes de la cita.",
];

export function Showcase() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: scope.current, start: "top 72%" },
      });
      tl.from(".showcase-text > *", { opacity: 0, y: 22, duration: 0.6, stagger: 0.08 }).from(
        ".showcase-frame",
        { opacity: 0, y: 34, duration: 0.85 },
        "-=0.45",
      );
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      className="relative z-1 bg-navy text-white overflow-hidden"
      style={{
        // Bandas de luz muy tenues para que el azul profundo no quede plano.
        backgroundImage:
          "radial-gradient(ellipse 900px 500px at 8% 0%, rgba(61,107,255,0.20), transparent 60%), radial-gradient(ellipse 700px 500px at 100% 100%, rgba(240,180,41,0.13), transparent 60%)",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-7 py-[70px] md:py-[104px]">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-center">
          <div className="showcase-text">
            <div className="eyebrow eyebrow--light mb-5">Un trabajo nuestro, en línea ahora</div>

            <h2 className="text-[clamp(28px,3.9vw,42px)] leading-[1.1] font-bold mb-5">
              Quality Barber Shop,
              <br />
              en {SHOWCASE.city}
            </h2>

            <p className="text-[15.5px] leading-[1.7] text-white/70 mb-7">
              No es una maqueta ni un ejemplo de muestra: es el sitio de un
              cliente real, con su motor de reservas funcionando. Esto es lo que
              incluye el Plan Reservas.
            </p>

            <ul className="flex flex-col gap-3.5 mb-9 list-none">
              {HECHOS.map((hecho) => (
                <li key={hecho} className="flex gap-3 text-[14.5px] leading-[1.55] text-white/85">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 mt-[3px]"
                    aria-hidden="true"
                  >
                    <path d="M5 12l5 5L20 6" />
                  </svg>
                  {hecho}
                </li>
              ))}
            </ul>

            <a href={SHOWCASE.url} target="_blank" rel="noopener noreferrer" className="btn-gold">
              Abrir el sitio
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>

          {/* Marco de navegador con una captura del sitio.
              Se probó primero con un <iframe> del sitio en vivo, que tenía la
              ventaja de no quedar nunca desactualizado, pero se descartó: el
              sitio de la barbería anima su fondo de forma continua y tenerlo
              corriendo dentro de la portada dejaba al visitante renderizando
              dos páginas a la vez. En celulares de gama media eso se nota.
              La contra es que esta imagen hay que volver a tomarla cuando la
              barbería cambie su diseño. */}
          <a
            href={SHOWCASE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="showcase-frame browser-frame block group"
          >
            <div className="browser-bar" aria-hidden="true">
              <span className="browser-dot" style={{ background: "#ff5f57" }} />
              <span className="browser-dot" style={{ background: "#febc2e" }} />
              <span className="browser-dot" style={{ background: "#28c840" }} />
              <span className="browser-url">{SHOWCASE.url.replace("https://", "")}</span>
            </div>
            <Image
              src={captura}
              alt={`Portada del sitio de ${SHOWCASE.clientName}, con su botón de reservar cita`}
              placeholder="blur"
              sizes="(max-width: 1023px) 100vw, 600px"
              className="block w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
