import { BUSINESS } from "@/lib/business";

// Los tres pasos para arrancar con una página. Va justo después de los planes
// porque responde la pregunta que queda al ver un precio: "¿y después qué?".
//
// Cada paso describe lo que de verdad pasa, sacado de los términos: el pago
// inicial va antes de empezar, la página vive en un subdominio de
// cesagencia.co, y la mensualidad arranca desde el segundo mes cuando el
// primero es gratis. Si algo de eso cambia en /terminos, cambia aquí.

const PASOS = [
  {
    titulo: "Nos cuentas de tu negocio",
    texto: "Por WhatsApp o con el formulario. Servicios, precios, horarios, fotos y dónde quedas. Con eso basta.",
  },
  {
    titulo: "Armamos tu página",
    texto: "Pagas el montaje y la dejamos lista en minutos con lo que nos contaste, con tu información y tus fotos.",
  },
  {
    titulo: "Queda en línea y la cuidamos",
    texto: BUSINESS.firstMonthFree
      ? "Vive en tunegocio.cesagencia.co. Cambios, actualizaciones y dominio corren por nuestra cuenta, y el primer mes de mantenimiento no se cobra."
      : "Vive en tunegocio.cesagencia.co. Cambios, actualizaciones y dominio corren por nuestra cuenta con la mensualidad.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="relative z-1 pb-[72px] md:pb-[104px]">
      <div className="eyebrow mb-5">Cómo funciona</div>
      <h2 className="text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.1] text-ink mb-10 md:mb-12 max-w-[22ch]">
        De la primera conversación a tu página en línea
      </h2>

      {/* Lista ordenada de verdad: un lector de pantalla anuncia "paso 1 de 3".
          Los números grandes son decoración, por eso van con aria-hidden. */}
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border-y border-line list-none">
        {PASOS.map((p, i) => (
          <li key={p.titulo} className="bg-void/70 backdrop-blur-[2px] py-7 px-1 md:px-7">
            <div aria-hidden="true" className="price-now text-[44px] text-gold mb-4">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="font-display font-bold text-[19px] text-ink mb-2">{p.titulo}</h3>
            <p className="text-[14.5px] leading-[1.6] text-ink-muted">{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
