import Image from "next/image";

export function Contact() {
  return (
    <section
      id="contacto"
      className="contact pt-[60px] pb-10 border-t border-line mt-6 relative z-1"
    >
      <div className="text-center max-w-[560px] mx-auto mb-[40px] border border-blue bg-gradient-to-b from-blue/10 to-panel-2 rounded-2xl p-6 md:p-10">
        <h2 className="text-[clamp(28px,4vw,42px)] mb-4">
          Hablemos de tu negocio
        </h2>
        <p className="text-ink text-base mb-8">
          Cuéntanos sobre tu negocio y te cotizamos tu página web sin
          compromiso — por WhatsApp o por correo.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold transition-all duration-300 ease-out bg-gradient-to-br from-blue-bright to-blue text-white hover:brightness-110 hover:-translate-y-1.5 hover:shadow-[0_10px_24px_-6px_rgba(29,79,216,0.5)]"
          >
            Escríbenos por WhatsApp
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold border border-line text-ink transition-all duration-300 ease-out hover:border-blue hover:bg-blue/8 hover:-translate-y-1.5 hover:shadow-md"
          >
            Enviar mensaje
          </a>
        </div>
      </div>
      <div className="wrap max-w-[1180px] mx-auto px-7">
        <footer className="flex justify-between items-center pt-[30px] border-t border-line text-[13px] text-ink-faint flex-wrap gap-3">
          <span className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="CES"
              width={200}
              height={64}
              unoptimized
              className="h-6 w-auto opacity-70"
            />
            agenciaces.com
          </span>
        </footer>
      </div>
    </section>
  );
}
