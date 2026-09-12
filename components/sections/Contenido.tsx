"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { CONTENIDO, formatCOP, whatsAppLink } from "@/lib/business";

// Por qué esto es un servicio aparte y no un plan más: una página convierte a
// quien ya te está buscando; las redes traen a quien todavía no sabe que
// existes. Son dos trabajos distintos, y por eso se venden separados.
const PIEZAS = [
  {
    titulo: "Reels",
    detalle: "Video corto para Instagram y TikTok, que es donde hoy aparece un negocio nuevo.",
  },
  {
    titulo: "Piezas gráficas",
    detalle: "Publicaciones para el feed: promociones, servicios, novedades del negocio.",
  },
  {
    titulo: "Cantidad a convenir",
    detalle: "Cuánto se publica cada mes se acuerda contigo, según lo que tu negocio necesite.",
  },
];

export function Contenido() {
  const scope = useRef<HTMLElement>(null);
  const { cliente } = CONTENIDO;

  const redes = [
    { nombre: "Instagram", url: cliente.instagram },
    { nombre: "TikTok", url: cliente.tiktok },
    { nombre: "Facebook", url: cliente.facebook },
  ].filter((r) => r.url);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: scope.current, start: "top 75%" },
      });
      tl.from(".contenido-texto > *", { opacity: 0, y: 20, duration: 0.6, stagger: 0.07 })
        .from(".contenido-pieza", { opacity: 0, y: 16, duration: 0.5, stagger: 0.08 }, "-=0.35")
        .from(".contenido-cliente", { opacity: 0, y: 24, duration: 0.7 }, "-=0.3");
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="contenido"
      className="relative z-1 bg-navy text-white overflow-hidden"
      style={{
        // Dominante dorada, al revés que la sección del trabajo web, que tira
        // a azul. Son dos bandas oscuras seguidas y tienen que distinguirse.
        backgroundImage:
          "radial-gradient(ellipse 820px 520px at 88% 0%, rgba(240,180,41,0.20), transparent 62%), radial-gradient(ellipse 900px 520px at 0% 100%, rgba(61,107,255,0.16), transparent 60%)",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-7 py-[70px] md:py-[104px]">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-11 lg:gap-16 items-start">
          <div>
            <div className="contenido-texto">
              <div className="eyebrow eyebrow--light mb-5">Servicio adicional</div>

              <h2 className="text-[clamp(28px,3.9vw,42px)] leading-[1.1] font-bold mb-5">
                Tu página convence a quien ya te busca.
                <br />
                Las redes traen a quien no te conoce.
              </h2>

              <p className="text-[15.5px] leading-[1.7] text-white/70 mb-8">
                Creamos el contenido de tus redes con inteligencia artificial:
                reels y piezas gráficas cada mes, para que tu negocio aparezca
                donde la gente de Pereira y Dosquebradas está mirando. Se
                contrata aparte de la página, y funciona tengas página o no.
              </p>

              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.13em] text-white/50">
                  Desde
                </span>
                <span className="price-now text-[38px] md:text-[42px] text-white">
                  {formatCOP(CONTENIDO.desde)}
                </span>
                <span className="text-[15px] text-white/70">/mes</span>
              </div>
              <p className="text-[13px] text-white/55 mb-9">
                El valor final depende de cuánto contenido publiques al mes.
              </p>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/12 border-y border-white/12 mb-10 lg:mb-0">
              {PIEZAS.map((p) => (
                <div key={p.titulo} className="contenido-pieza bg-navy/80 px-1 py-5 sm:px-5">
                  <dt className="font-display font-bold text-[16px] text-gold mb-1.5">{p.titulo}</dt>
                  <dd className="text-[13.5px] text-white/70 leading-[1.55]">{p.detalle}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* La prueba. Mismo criterio que la sección de la página web: un
              cliente real con nombre, no un testimonio anónimo. Ellos
              autorizaron que se les nombre. */}
          <div className="contenido-cliente rounded-[16px] border border-white/12 bg-white/[0.04] backdrop-blur-sm p-7 md:p-9">
            <div className="text-[11.5px] font-bold uppercase tracking-[0.13em] text-gold mb-4">
              Cliente de contenido
            </div>

            <h3 className="font-display font-bold text-[26px] leading-[1.15] mb-2">
              {cliente.nombre}
            </h3>
            <p className="text-[14px] text-white/60 mb-6">{cliente.que}</p>

            <p className="text-[14.5px] leading-[1.65] text-white/85 mb-7">
              Nosotros hacemos el contenido que publican cada mes en sus redes.
              No es una maqueta ni un ejemplo: es trabajo que está saliendo
              ahora, y ellos autorizaron que los nombremos.
            </p>

            {redes.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-6">
                {redes.map((r) => (
                  <a
                    key={r.nombre}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full border border-white/20 px-3.5 py-2 text-white/90 transition-colors hover:border-gold hover:text-gold"
                  >
                    {r.nombre}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                ))}
              </div>
            )}

            <a
              href={whatsAppLink(
                "Hola, me interesa el servicio de contenido para redes",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full"
            >
              Preguntar por el contenido
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
