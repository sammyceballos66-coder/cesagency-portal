"use client";

import { useEffect, useRef } from "react";

export function useTilt<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    function onMove(e: MouseEvent) {
      const r = card!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rotX = (0.5 - py) * 8;
      const rotY = (px - 0.5) * 10;
      card!.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
      card!.style.setProperty("--mx", `${px * 100}%`);
      card!.style.setProperty("--my", `${py * 100}%`);
    }
    function onLeave() {
      card!.style.transform = "";
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return ref;
}
