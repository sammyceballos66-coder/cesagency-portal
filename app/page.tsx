import { Header } from "@/components/Header";
import { PromoBar } from "@/components/PromoBar";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Hero } from "@/components/sections/Hero";
import { Showcase } from "@/components/sections/Showcase";
import { Plans } from "@/components/sections/Plans";
import { SignUp } from "@/components/sections/SignUp";
import { Footer } from "@/components/sections/Footer";
import { promoParaLaPagina } from "@/lib/business";

// La portada se regenera cada diez minutos. Hace falta porque las ventanas de
// promoción abren y cierran solas: si la página quedara congelada en el momento
// del build, el descuento seguiría anunciado después de vencido, y peor, una
// ventana nueva no se encendería hasta que alguien redesplegara.
//
// Diez minutos y no una hora porque ABRIR tarde cuesta plata y cerrar tarde
// cuesta credibilidad. Regenerar una página estática tan pequeña no tiene
// ningún costo que justifique esperar más.
export const revalidate = 600;

export default function Home() {
  // Se resuelve UNA vez, aquí en el servidor, y se le pasa a las secciones.
  // Si cada componente de cliente mirara el reloj por su cuenta, el HTML del
  // servidor y el del navegador podrían no coincidir justo en el minuto en que
  // abre o cierra una ventana.
  const promo = promoParaLaPagina();

  return (
    <>
      <SmoothScroll />

      {/* Fondo: resplandores, retícula y grano, todo en CSS (ver .field y
          .drift en globals.css). Antes esto era el componente de blobs
          animados de Aceternity, que además de ser la firma visual de
          cualquier plantilla obligaba a seguir el mouse con JavaScript. */}
      <div className="field" />
      <div className="drift" />

      {/* Explicit positive z-index on the content wrapper, rather than a
          negative one on the background above — negative z-index stacking
          has been unreliable on mobile WebKit in this project (background
          only painted during the overscroll bounce instead of staying
          visible underneath). Stacking everything else forward instead of
          pushing the background back sidesteps that. */}
      <div className="relative z-10">
        {promo && <PromoBar promo={promo} />}
        <Header />
        <main>
          {/* El ancho lo controla cada bloque, no un contenedor único: la
              sección del trabajo va de borde a borde con fondo oscuro, y
              las demás quedan dentro de la caja de 1180 px. */}
          <div className="max-w-[1180px] mx-auto px-7">
            <Hero />
          </div>

          <Showcase />

          <div className="max-w-[1180px] mx-auto px-7">
            <Plans promo={promo} />
            <SignUp />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
