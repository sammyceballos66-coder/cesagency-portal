import Image from "next/image";
import Link from "next/link";
import { CONTACTOS_WHATSAPP, formatoCelular } from "@/lib/business";

function IconoWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0 fill-current">
      <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="wrap max-w-[1180px] mx-auto px-7">
      {/* Los dos WhatsApp que se publican (pedido de Samuel, 10 oct 2026).
          Los botones grandes de la página van solo al de CES. */}
      <div className="border-t border-line pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="font-display font-bold text-ink text-lg">Escríbenos por WhatsApp</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {CONTACTOS_WHATSAPP.map((c) => (
            <a
              key={c.numero}
              href={`https://wa.me/${c.numero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-[var(--radius)] border border-line bg-white/70 px-4 py-2.5 transition-colors hover:border-whatsapp-green-deep focus-visible:outline-2 focus-visible:outline-blue-bright"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-whatsapp-green/15 text-whatsapp-green-deep">
                <IconoWhatsapp />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[12px] text-ink-faint">{c.nombre}</span>
                <span className="font-semibold text-ink tabular-nums group-hover:text-whatsapp-green-deep transition-colors">
                  {formatoCelular(c.numero)}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center py-6 border-t border-line text-[13px] text-ink-faint flex-wrap gap-3">
        <span className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="CES"
            width={642}
            height={205}
            unoptimized
            className="h-6 w-auto opacity-70"
          />
          cesagencia.co
        </span>
        <nav className="flex items-center gap-5">
          <Link href="/terminos" className="hover:text-blue-bright transition-colors">
            Términos de servicio
          </Link>
          <Link href="/privacidad" className="hover:text-blue-bright transition-colors">
            Privacidad
          </Link>
        </nav>
      </div>
    </footer>
  );
}
