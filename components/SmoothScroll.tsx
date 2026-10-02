"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // `anchors: true` es obligatorio. Sin él, Lenis no atiende los clics en
    // enlaces internos (#planes, #preguntas...) y además no deja que el
    // navegador haga el salto solo: la dirección cambiaba pero la página se
    // quedaba quieta en todos los botones de "Ver" y en el menú. Lenis, al
    // manejarlos, respeta el `scroll-margin-top` de las secciones, así que el
    // header fijo no tapa el título.
    const lenis = new Lenis({ autoRaf: false, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
