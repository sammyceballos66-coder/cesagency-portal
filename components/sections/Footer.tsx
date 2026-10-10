import Image from "next/image";
import Link from "next/link";
import { CONTACTOS_WHATSAPP, formatoCelular } from "@/lib/business";

export function Footer() {
  return (
    <footer className="wrap max-w-[1180px] mx-auto px-7">
      <div className="flex justify-between items-center py-[30px] border-t border-line text-[13px] text-ink-faint flex-wrap gap-x-6 gap-y-3">
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
        <div className="flex items-center gap-x-5 gap-y-2 flex-wrap">
          <span>WhatsApp:</span>
          {CONTACTOS_WHATSAPP.map((c) => (
            <a
              key={c.numero}
              href={`https://wa.me/${c.numero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-bright transition-colors"
            >
              <span className="text-ink-muted font-medium">{formatoCelular(c.numero)}</span> ({c.nombre})
            </a>
          ))}
        </div>
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
