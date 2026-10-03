"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useTilt } from "@/hooks/useTilt";
import { TARJETA_NFC, formatCOP, whatsAppLink } from "@/lib/business";

import imgResenas from "@/public/tarjeta-nfc-resenas.webp";
import imgWhatsapp from "@/public/tarjeta-nfc-whatsapp.webp";
import imgFacebook from "@/public/tarjeta-nfc-facebook.webp";
import imgInstagram from "@/public/tarjeta-nfc-instagram.webp";
import imgTiktok from "@/public/tarjeta-nfc-tiktok.webp";

// Los cinco diseños que Samuel escogió para las tarjetas (octubre de 2026),
// recortados del fondo blanco que traían. Se muestra uno grande y los demás
// como miniaturas para cambiar entre ellos: cinco tarjetas apiladas habrían
// alargado la sección el triple.
//
// Reemplazaron a una tarjeta dibujada en código que no llevaba logos. Estos sí
// los llevan —Google, WhatsApp, Facebook, Instagram, TikTok—, por decisión de
// Samuel: es como se ven estas tarjetas en el mercado y como se van a ver las
// suyas. Los logos son marcas de esas empresas; si algún día hay reclamo, el
// cambio es volver a muestras sin ellos.
//
// Todos tienen el MISMO precio: el de TARJETA_NFC vale para cualquier diseño.
//
// Son CUADRADOS. Las tarjetas de PVC con chip que se consiguen en blanco son del
// tamaño de una tarjeta de crédito (85 x 54 mm), así que para imprimirlas este
// diseño hay que adaptarlo a ese formato. Lo cuadrado es lo de los soportes
// de mostrador y los adhesivos.

const DISENOS = [
  {
    id: "resenas",
    nombre: "Google",
    img: imgResenas,
    alt: "Tarjeta de reseñas: ¡Tu opinión nos ayuda! Déjanos tu reseña en Google. Acerca tu celular aquí.",
  },
  {
    id: "whatsapp",
    nombre: "WhatsApp",
    img: imgWhatsapp,
    alt: "Tarjeta de WhatsApp: ¡Escríbenos por WhatsApp! Te atendemos rápido y con gusto.",
  },
  {
    id: "facebook",
    nombre: "Facebook",
    img: imgFacebook,
    alt: "Tarjeta de Facebook: ¡Síguenos en Facebook! Contenido, noticias y más.",
  },
  {
    id: "instagram",
    nombre: "Instagram",
    img: imgInstagram,
    alt: "Tarjeta de Instagram: ¡Síguenos en Instagram! No te pierdas de nuestras novedades.",
  },
  {
    id: "tiktok",
    nombre: "TikTok",
    img: imgTiktok,
    alt: "Tarjeta de TikTok: ¡Síguenos en TikTok! Contenido, tendencias y más.",
  },
];

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent-green)"
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

export function TarjetaNfc() {
  const scope = useRef<HTMLElement>(null);
  const tiltRef = useTilt<HTMLDivElement>();
  const [activo, setActivo] = useState(0);
  const diseno = DISENOS[activo];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: scope.current, start: "top 75%" },
      });
      tl.from(".nfc-escena", { opacity: 0, y: 30, rotate: -2, duration: 0.8 }).from(
        ".nfc-texto > *",
        { opacity: 0, y: 18, duration: 0.55, stagger: 0.07 },
        "-=0.5",
      );
    },
    { scope },
  );

  return (
    <section ref={scope} id="tarjeta-nfc" className="relative z-1 pt-[72px] pb-[56px] md:pt-[104px] md:pb-[72px]">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
        <div className="nfc-escena relative mx-auto w-full max-w-[420px]">
          {/* Resplandor detrás para que la tarjeta no quede plana sobre el fondo.
              En celular se abre menos hacia los lados: con 40 px a cada lado se
              salía de la pantalla y la página se podía arrastrar de lado. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-4 -inset-y-10 sm:-inset-10 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(61,107,255,0.18), transparent 65%)" }}
          />
          <div
            ref={tiltRef}
            className="tilt relative rounded-[8%] overflow-hidden shadow-[0_34px_70px_-28px_rgba(10,19,48,0.65)]"
          >
            {/* `key` hace que la imagen se monte de nuevo al cambiar de diseño,
                y con eso corre la animación de entrada de .nfc-aparece. */}
            <Image
              key={diseno.id}
              src={diseno.img}
              alt={diseno.alt}
              placeholder="blur"
              sizes="(max-width: 1023px) 90vw, 420px"
              className="nfc-aparece block w-full h-auto"
            />
            <div className="tilt-shine" />
          </div>

          <div className="relative mt-7">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint text-center mb-3">
              Diseños · mismo precio
            </div>
            <div className="flex justify-center gap-2 sm:gap-2.5" role="group" aria-label="Diseños de la tarjeta">
              {DISENOS.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActivo(i)}
                  aria-pressed={i === activo}
                  aria-label={`Ver la tarjeta de ${d.nombre}`}
                  title={d.nombre}
                  className={`w-[52px] sm:w-[60px] rounded-[10px] overflow-hidden border-2 transition-[transform,border-color,opacity] duration-200 ease-out hover:-translate-y-0.5 ${
                    i === activo ? "border-blue-bright opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={d.img} alt="" sizes="60px" className="block w-full h-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="nfc-texto">
          <div className="eyebrow mb-5">Servicio adicional</div>
          <h2 className="text-[clamp(28px,3.9vw,42px)] leading-[1.1] font-bold mb-5 text-ink">
            Una reseña en Google,
            <br />
            <span className="marker">con solo acercar el celular</span>
          </h2>
          <p className="text-[16px] leading-[1.7] text-ink-muted mb-7 max-w-[48ch]">
            Una tarjeta para el mostrador de tu negocio. Tus clientes la tocan
            con el celular y se les abre directo, sin buscarte ni escribir nada.
            En la mayoría de celulares no hace falta descargar ninguna app.
          </p>

          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-faint mb-3">
            Tú escoges a dónde lleva
          </div>
          <ul className="flex flex-col gap-2.5 mb-8 list-none">
            {TARJETA_NFC.destinos.map((d) => (
              <li key={d} className="flex gap-2.5 text-[14.5px] text-ink">
                <Check />
                {d}
              </li>
            ))}
          </ul>

          {/* Dos opciones lado a lado. El ahorro se calcula de los dos precios y
              no se escribe a mano: si cambia uno, la etiqueta no queda mintiendo. */}
          <div className="grid grid-cols-2 gap-3 max-w-[420px] mb-3">
            <div className="rounded-[14px] border border-line bg-white px-4 py-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-ink-faint mb-1.5">
                1 tarjeta
              </div>
              <div className="price-now text-[28px] text-ink">{formatCOP(TARJETA_NFC.precio)}</div>
            </div>
            <div className="relative rounded-[14px] border border-gold/60 bg-gold-bg px-4 py-4">
              <span className="absolute -top-2.5 right-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#1b1300] bg-gradient-to-r from-gold-soft to-gold rounded-full px-2.5 py-0.5">
                Ahorras {formatCOP(TARJETA_NFC.precio * 2 - TARJETA_NFC.precioDos)}
              </span>
              <div className="text-[12px] font-semibold uppercase tracking-[0.11em] text-gold-deep mb-1.5">
                2 tarjetas
              </div>
              <div className="price-now text-[28px] text-ink">{formatCOP(TARJETA_NFC.precioDos)}</div>
            </div>
          </div>
          <p className="text-[13px] text-ink-faint mb-8">
            Pago único, y el mismo precio para cualquier diseño: Google, WhatsApp,
            Facebook, Instagram o TikTok. Te las entregamos configuradas, y son
            tuyas: no dependen de ninguna mensualidad.
          </p>

          <a
            href={whatsAppLink("Hola, me interesa la tarjeta NFC para mi negocio")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Quiero mi tarjeta
          </a>
        </div>
      </div>
    </section>
  );
}
