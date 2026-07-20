import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#servicios", label: "Qué incluye" },
  { href: "#planes", label: "Precio" },
  { href: "#nosotros", label: "Nosotros" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-void/72 backdrop-blur-md border-b border-line">
      <nav className="flex items-center justify-between px-7 py-[18px] max-w-[1180px] mx-auto">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-[17px]">
          {/* unoptimized: Next's image optimizer re-encodes this lossily,
              which showed up as visible compression fringing under the
              letters. Serving the raw PNG lets the browser scale it
              instead. Full-res source (not a pre-shrunk one) matters too —
              downscaling from a size close to the display size (e.g. 64px
              tall to 36px) makes the browser's own bilinear filtering ring
              on this logo's hard gradient edges; a bigger source gives it
              enough headroom to downscale cleanly. */}
          <Image
            src="/logo.png"
            alt="CES"
            width={642}
            height={205}
            priority
            unoptimized
            className="h-9 w-auto"
          />
          <span className="text-ink-muted font-medium text-sm">Agencia</span>
        </Link>
        <div className="hidden min-[760px]:flex gap-8 text-sm text-ink-muted">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>
        <a
          href="#contacto"
          className="inline-flex items-center gap-2 rounded-full px-5 py-[11px] text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-out bg-gradient-to-br from-blue-bright to-blue text-white hover:brightness-110 hover:-translate-y-1.5 hover:shadow-[0_10px_24px_-6px_rgba(29,79,216,0.5)]"
        >
          Cotiza tu página
        </a>
      </nav>
    </header>
  );
}
