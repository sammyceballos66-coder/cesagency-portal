"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

import imgSitio from "@/public/trabajo-quality-barber-shop-movil.webp";
import imgTarjeta from "@/public/tarjeta-nfc-resenas.webp";

// La composición de la derecha del hero (octubre de 2026). Desde el 27 de
// octubre trae además la tarjeta de llamada de la recepcionista con IA, con un
// dibujo en SVG (no una foto: no debe parecer una persona real). Cuenta los tres
// lugares del título sin que haya que leerlo: el celular con la página de
// Quality Barber Shop es "en Google", la tarjeta NFC es "en el mostrador", y el
// aviso de cita muestra que el motor de reservas funciona de verdad.
//
// Se descartó un fondo decorativo: rellenaba el espacio sin decir nada, que es
// justo lo que hacía ver la página como plantilla antes del rediseño.
//
// El aviso dice "Nueva cita", NO "Nueva reseña ★★★★★": eso daría a entender
// que la tarjeta consigue reseñas de cinco estrellas, y Google prohíbe prometer
// eso. Ver la nota de reseñas en lib/business.ts.
//
// `trabajo-quality-barber-shop-movil.webp` es una captura del sitio de la
// barbería en celular tomada el 4 de octubre de 2026: se vuelve a tomar si
// ellos cambian su diseño, igual que la de escritorio de Showcase.

export function HeroVisual() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.35 });
      tl.from(".hv-telefono", { opacity: 0, y: 40, duration: 0.9 })
        .from(".hv-tarjeta", { opacity: 0, x: -40, rotate: -24, duration: 0.8 }, "-=0.55")
        .from(".hv-aviso", { opacity: 0, y: -14, scale: 0.94, duration: 0.55, stagger: 0.18 }, "-=0.3");

      tl.from(".hv-llamada", { opacity: 0, x: 30, scale: 0.94, duration: 0.6 }, "-=0.2");

      // Flotación lenta y desfasada entre piezas para que la escena no se vea
      // congelada. Solo `transform`: lo resuelve la GPU y no mueve el layout.
      gsap.to(".hv-tarjeta-flota", { y: -10, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".hv-flota-4", { y: -5, duration: 2.7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6 });

      // La recepcionista "hablando": barras de voz y un anillo que late
      // alrededor de la foto, como en una llamada en curso.
      gsap.utils.toArray<HTMLElement>(".hv-onda").forEach((barra, i) => {
        gsap.to(barra, {
          scaleY: 0.45 + ((i * 37) % 50) / 100,
          duration: 0.32 + (i % 3) * 0.09,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.06,
        });
      });
      gsap.fromTo(
        ".hv-pulso",
        { scale: 1, opacity: 0.55 },
        { scale: 1.45, opacity: 0, duration: 1.8, ease: "power1.out", repeat: -1 },
      );
      gsap.to(".hv-flota-1", { y: 6, duration: 2.9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.4 });
      gsap.to(".hv-flota-2", { y: 7, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.8 });
      gsap.to(".hv-flota-3", { y: -6, duration: 3.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
    },
    { scope },
  );

  return (
    <div ref={scope} className="relative mx-auto w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] aspect-[10/12] sm:aspect-[10/11]">
      {/* Resplandor detrás: azul de la marca arriba y dorado abajo. Se queda
          dentro de la caja (inset positivo) para no abrir scroll lateral en
          celular, el mismo problema que tuvo el de la tarjeta NFC. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[6%] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 60% 35%, rgba(61,107,255,0.30), transparent 60%), radial-gradient(circle at 30% 80%, rgba(240,180,41,0.22), transparent 55%)",
        }}
      />

      {/* Celular con la página de la barbería. */}
      <div className="hv-telefono absolute right-[6%] top-[2%] w-[54%]">
        {/* Botones laterales: detalle pequeño que hace que se lea como un
            celular de verdad y no como un rectángulo con esquinas. */}
        <span aria-hidden="true" className="absolute -left-[1.6%] top-[17%] h-[6%] w-[1.8%] rounded-l-[3px] bg-[#1a2033]" />
        <span aria-hidden="true" className="absolute -left-[1.6%] top-[25%] h-[9%] w-[1.8%] rounded-l-[3px] bg-[#1a2033]" />
        <span aria-hidden="true" className="absolute -right-[1.6%] top-[21%] h-[12%] w-[1.8%] rounded-r-[3px] bg-[#1a2033]" />
        <div className="relative rounded-[18%/8.5%] bg-[#0b0f1a] p-[3.5%] shadow-[0_40px_80px_-30px_rgba(10,19,48,0.7),inset_0_0_0_1.5px_rgba(255,255,255,0.08)]">
          {/* pt: franja negra arriba, la de la barra de estado de un celular de
              verdad. Sin ella la isla de la cámara tapaba el logo del sitio. */}
          <div className="relative overflow-hidden rounded-[15%/7%] bg-black pt-[11%]">
            <Image
              src={imgSitio}
              alt="La página de Quality Barber Shop en un celular: reservas en línea"
              placeholder="blur"
              loading="eager"
              sizes="(max-width: 640px) 190px, 250px"
              className="block w-full h-auto"
            />
            {/* Isla de la cámara, para que se lea como celular y no como una
                captura suelta. */}
            <div aria-hidden="true" className="absolute left-1/2 top-[1.5%] h-[2.4%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>

      {/* Tarjeta NFC delante del celular, inclinada. */}
      <div className="hv-tarjeta absolute left-[4%] bottom-[15%] sm:bottom-[3%] w-[31%]">
        <div className="hv-tarjeta-flota" style={{ rotate: "-9deg" }}>
          <Image
            src={imgTarjeta}
            alt="Tarjeta NFC de reseñas de Google para el mostrador"
            placeholder="blur"
            sizes="(max-width: 640px) 110px, 145px"
            className="block w-full h-auto rounded-[9px] shadow-[0_28px_50px_-18px_rgba(10,19,48,0.65)]"
          />
        </div>
      </div>

      {/* Un aviso por servicio, como notificaciones del celular: redes
          arriba, la cita del motor de reservas en el medio y la reseña que
          llega por la tarjeta abajo, cerca de ella. */}
      <div className="hv-aviso absolute left-0 top-[4%] w-[78%] sm:w-[66%]">
        <Aviso
          flota="hv-flota-1"
          titulo="Reel publicado"
          detalle="Instagram y TikTok"
          cuando="1 h"
          fondo="linear-gradient(135deg, #7b2ff7, #e1306c 55%, #f77737)"
          icono={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          }
        />
      </div>

      <div className="hv-aviso absolute left-0 top-[26%] sm:top-[30%] w-[78%] sm:w-[66%]">
        <Aviso
          flota="hv-flota-2"
          titulo="Nueva cita agendada"
          detalle="Corte clásico · Hoy, 4:30 p. m."
          cuando="ahora"
          fondo="#0b0b0b"
          icono={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2b84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2.5" />
              <path d="M3 10h18M8 3v4M16 3v4" />
              <path d="m9 15 2 2 4-4" />
            </svg>
          }
        />
      </div>

      {/* La recepcionista con IA (27 oct 2026): una llamada en curso que ella
          contesta. Dice "asistente virtual" a la vista, igual que en la
          llamada de verdad: el servicio nunca la hace pasar por persona. */}
      <div className="hv-llamada absolute right-0 top-[42%] sm:top-[44%] w-[62%]">
        <Llamada />
      </div>

      {/* Sin estrellas ni cantidades A PROPÓSITO: Samuel pidió "recibiste 100
          reseñas hoy" y se cambió por esto. Una cifra así no la logra ningún
          negocio con una tarjeta (publicidad engañosa, Ley 1480), y unas
          estrellas darían a entender que la tarjeta trae reseñas positivas. */}
      <div className="hv-aviso absolute right-0 bottom-0 sm:bottom-[8%] w-[78%] sm:w-[66%]">
        <Aviso
          flota="hv-flota-3"
          titulo="Nueva reseña en Google"
          detalle="Un cliente usó tu tarjeta"
          cuando="5 min"
          fondo="#1b6fe8"
          icono={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z" />
              <path d="M8.5 10.5h7M8.5 13.5h4.5" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

// Dibujo de la recepcionista: cara, pelo recogido y diadema con micrófono,
// hecho en SVG con los colores de la marca para que no parezca una foto de
// banco de imágenes ni una persona real.
function Recepcionista() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="hv-fondo-rec" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d6bff" />
          <stop offset="1" stopColor="#1b3fc4" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#hv-fondo-rec)" />
      {/* hombros y cuello */}
      <path d="M12 64c1.5-11 9.5-17 20-17s18.5 6 20 17Z" fill="#f0b429" />
      <path d="M27 41h10v7a5 5 0 0 1-10 0Z" fill="#c98b62" />
      {/* pelo de atrás */}
      <path d="M17 31c0-12 6.5-19 15-19s15 7 15 19c0 6-2 10-4 12H21c-2-2-4-6-4-12Z" fill="#2a1a12" />
      {/* cara */}
      <ellipse cx="32" cy="31" rx="10.5" ry="12" fill="#e0a77c" />
      {/* flequillo */}
      <path d="M21.5 27c1-7.5 5.5-11.5 10.5-11.5 5.5 0 9.5 4 10.5 10-4.5-.5-9-3-11-6.5-2 4-5.5 6.8-10 8Z" fill="#2a1a12" />
      {/* ojos y sonrisa */}
      <circle cx="28" cy="31.5" r="1.3" fill="#2a1a12" />
      <circle cx="36" cy="31.5" r="1.3" fill="#2a1a12" />
      <path d="M28.5 36.5c2 1.8 5 1.8 7 0" stroke="#8a4b2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* diadema y micrófono */}
      <path d="M19.5 30c0-9 5.5-15 12.5-15s12.5 6 12.5 15" stroke="#0b1020" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <rect x="16.5" y="27.5" width="5.5" height="9" rx="2.6" fill="#0b1020" />
      <rect x="42" y="27.5" width="5.5" height="9" rx="2.6" fill="#0b1020" />
      <path d="M19.5 36c0 4.5 3 6.6 8 6.6" stroke="#0b1020" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="28.5" cy="42.6" r="1.9" fill="#f0b429" />
    </svg>
  );
}

function Llamada() {
  return (
    <div className="hv-flota-4 rounded-[18px] border border-white/10 bg-[#0d1530]/95 px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-[0_24px_48px_-18px_rgba(10,19,48,0.75)] backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="relative h-11 w-11 shrink-0">
          <span aria-hidden="true" className="hv-pulso absolute inset-0 rounded-full border-2 border-[#5b8cff]" />
          <span className="relative block h-full w-full overflow-hidden rounded-full ring-2 ring-white/15">
            <Recepcionista />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-[12.5px] sm:text-[13px] font-semibold text-white">Recepcionista IA</span>
            <span className="hidden sm:inline-flex shrink-0 items-center gap-1 text-[11px] text-[#4ade80]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              0:42
            </span>
          </span>
          <span className="block truncate text-[11.5px] sm:text-[12px] text-white/60">Contestando una llamada</span>
        </span>
      </div>

      {/* Ondas de voz: alturas distintas para que no se vea como un patrón
          repetido; GSAP las hace subir y bajar. */}
      <div aria-hidden="true" className="mt-2.5 flex h-6 items-center justify-between">
        {[0.5, 0.8, 0.4, 1, 0.65, 0.9, 0.35, 0.75, 0.55, 1, 0.45, 0.7, 0.85, 0.4, 0.6, 0.95, 0.5, 0.7, 0.4, 0.8].map((h, i) => (
          <span
            key={i}
            className="hv-onda block w-[3px] origin-center rounded-full bg-gradient-to-t from-[#3d6bff] to-[#8fb0ff]"
            style={{ height: `${Math.round(h * 24)}px` }}
          />
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-2 rounded-[10px] bg-white/[0.06] px-2.5 py-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f0b429" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12l5 5L20 6" />
        </svg>
        <span className="truncate text-[11.5px] sm:text-[12px] text-white/85">Reserva tomada · sábado 8 p. m.</span>
      </div>
    </div>
  );
}

function Aviso({
  flota,
  titulo,
  detalle,
  cuando,
  fondo,
  icono,
}: {
  flota: string;
  titulo: string;
  detalle: string;
  cuando: string;
  fondo: string;
  icono: React.ReactNode;
}) {
  return (
    <div
      className={`${flota} flex items-center gap-3 rounded-[16px] border border-white/70 bg-white/85 px-3 py-2.5 sm:px-3.5 sm:py-3 shadow-[0_18px_40px_-16px_rgba(10,19,48,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md`}
    >
      {/* Ícono con un brillo arriba, como los de las apps de verdad. */}
      <span
        className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[10px] shadow-[0_6px_14px_-6px_rgba(10,19,48,0.5)]"
        style={{ background: fondo }}
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
        <span className="relative">{icono}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[12.5px] sm:text-[13px] font-semibold text-ink">{titulo}</span>
          {/* En celular no cabe: se esconde antes que cortar el título. */}
          <span className="hidden sm:inline-flex items-center gap-1 shrink-0 text-[11px] text-ink-faint">
            {cuando === "ahora" && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />}
            {cuando}
          </span>
        </span>
        <span className="block truncate text-[12px] sm:text-[12.5px] text-ink-muted">{detalle}</span>
      </span>
    </div>
  );
}
