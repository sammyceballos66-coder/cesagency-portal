"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

import imgSitio from "@/public/trabajo-quality-barber-shop-movil.webp";
import imgTarjeta from "@/public/tarjeta-nfc-resenas.webp";

// La composición de la derecha del hero (octubre de 2026). Cuenta los tres
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

      // Flotación lenta y desfasada entre piezas para que la escena no se vea
      // congelada. Solo `transform`: lo resuelve la GPU y no mueve el layout.
      gsap.to(".hv-tarjeta-flota", { y: -10, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
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
      className={`${flota} flex items-center gap-3 rounded-[16px] border border-white/70 bg-white/85 px-3 py-2.5 sm:px-3.5 sm:py-3 shadow-[0_18px_40px_-16px_rgba(10,19,48,0.45)] backdrop-blur-md`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]" style={{ background: fondo }}>
        {icono}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[12.5px] sm:text-[13px] font-semibold text-ink">{titulo}</span>
          {/* En celular no cabe: se esconde antes que cortar el título. */}
          <span className="hidden sm:inline shrink-0 text-[11px] text-ink-faint">{cuando}</span>
        </span>
        <span className="block truncate text-[12px] sm:text-[12.5px] text-ink-muted">{detalle}</span>
      </span>
    </div>
  );
}
