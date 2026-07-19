"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2">
    <path d="M5 12l5 5L20 6" />
  </svg>
);

function Reveal({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
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
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

type ChatMessage = { type: "in" | "out"; text: string };

function ChatDemo({ messages }: { messages: ChatMessage[] }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const box = boxRef.current;
      if (!box) return;

      const bubbles = gsap.utils.toArray<HTMLElement>(".bubble", box);
      const dots = box.querySelector<HTMLElement>(".typing-dots");

      gsap.set(box, { opacity: 0, y: 24 });
      bubbles.forEach((b) => {
        const fromLeft = b.classList.contains("in");
        gsap.set(b, { opacity: 0, y: 10, x: fromLeft ? -16 : 16, scale: 0.9 });
      });
      if (dots) gsap.set(dots, { opacity: 0, y: 10, x: -16, scale: 0.9 });

      // Only reveal once the whole box has scrolled fully into view, and fade
      // it back out if the user scrolls back up past that point.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: box,
          start: "bottom bottom",
          toggleActions: "play none none reverse",
        },
      });

      tl.to(box, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      tl.to(
        bubbles[0],
        { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
        "-=0.2",
      );
      if (dots) {
        tl.to(
          dots,
          { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
          "+=0.2",
        ).to(dots, { opacity: 0, scale: 0.9, duration: 0.2, ease: "power1.out" }, "+=0.7");
      }
      tl.to(
        bubbles[1],
        { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
        dots ? "+=0.05" : "+=0.2",
      );
      tl.to(
        bubbles[2],
        { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
        "+=0.25",
      );
    },
    { scope: boxRef, dependencies: [messages] },
  );

  return (
    <div
      ref={boxRef}
      className="visual-box aspect-[4/3] rounded-2xl border border-blue bg-gradient-to-b from-blue/10 to-panel-2 relative overflow-hidden flex items-center justify-center p-8"
    >
      <div className="chat-demo w-[88%] max-w-[280px] flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <Fragment key={i}>
            {i === 1 && (
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
            )}
            <div className={`bubble ${m.type}`}>{m.text}</div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

const WEB_CHAT: ChatMessage[] = [
  { type: "in", text: "Necesito una página web para mi negocio, ¿cuánto cuesta?" },
  {
    type: "out",
    text: "$400.000 pago único — diseño profesional, lista en minutos 🙌",
  },
  { type: "in", text: "¡Perfecto! ¿Cómo arrancamos?" },
];

export function Services() {
  return (
    <section id="servicios" className="services py-[40px] pb-[60px] relative z-1">
      <Reveal className="max-w-[600px] mx-auto mb-[36px] rounded-2xl bg-gradient-to-br from-accent-purple to-accent-purple-deep p-6 md:p-8 shadow-lg">
        <span className="inline-flex items-center text-[12.5px] font-semibold text-accent-purple uppercase tracking-[0.08em] border border-line bg-white/90 px-3.5 py-1.5 rounded-full mb-3">
          Qué incluye
        </span>
        <h2 className="text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.15] mb-3.5 text-white">
          Una página web que representa bien tu negocio
        </h2>
        <p className="text-white/85 text-base leading-[1.6]">
          Un solo servicio, hecho bien — sin paquetes confusos ni costos
          escondidos.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-[50px] items-center py-10 border-t border-b border-line">
        <Reveal className="bg-white/95 backdrop-blur-sm rounded-2xl border border-line shadow-sm p-6 md:p-8">
          <span className="block text-xs font-semibold text-blue-bright uppercase tracking-[0.06em] mb-3.5">
            Tu página web
          </span>
          <h3 className="hero-gradient-text-green text-[clamp(28px,3.8vw,40px)] leading-[1.1] font-bold mb-4">
            Todo lo que necesitas, sin complicaciones
          </h3>
          <p className="text-ink text-base leading-[1.65] mb-[22px]">
            Diseñamos tu página web profesional, adaptada a celular y
            computador, con la información de tu negocio siempre a la mano
            para tus clientes.
          </p>
          <ul className="flex flex-col gap-[11px] mb-[26px] list-none">
            {[
              "Diseño profesional a la medida de tu negocio",
              "Adaptada a celular y computador",
              "Botón directo a tu WhatsApp",
              "Entrega en minutos",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-[14.5px] items-start">
                <span className="shrink-0 mt-[3px]">{CHECK}</span>
                {item}
              </li>
            ))}
          </ul>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold border border-line text-ink transition-all duration-300 ease-out hover:border-blue hover:bg-blue/8 hover:-translate-y-1.5 hover:shadow-md"
          >
            Cotiza tu página web →
          </a>
        </Reveal>
        <ChatDemo messages={WEB_CHAT} />
      </div>

      <Reveal className="mt-6 bg-white/95 backdrop-blur-sm border border-line shadow-sm rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <span className="inline-flex items-center text-xs font-semibold text-accent-purple uppercase tracking-[0.06em] border border-accent-purple/25 bg-accent-purple-bg px-3 py-1 rounded-full mb-2">
            Servicio adicional · IA
          </span>
          <h3 className="text-lg font-semibold mb-1.5">
            ¿Quieres ir un paso más allá?
          </h3>
          <p className="text-ink-muted text-[14.5px] leading-[1.6] max-w-[480px]">
            Más adelante también podemos crear contenido para tus redes
            sociales con IA — es un servicio aparte, no hace parte del
            paquete base.
          </p>
        </div>
        <a
          href="#contacto"
          className="shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold border border-accent-purple bg-gradient-to-b from-accent-purple/10 to-accent-purple-bg text-ink transition-all duration-300 ease-out hover:bg-accent-purple/15 hover:-translate-y-1.5 hover:shadow-md whitespace-nowrap"
        >
          Pregúntanos →
        </a>
      </Reveal>
    </section>
  );
}
