import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="wrap max-w-[1180px] mx-auto px-7">
      <div className="flex justify-between items-center py-[30px] border-t border-line text-[13px] text-ink-faint flex-wrap gap-3">
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
