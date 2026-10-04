import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

// Títulos. Reemplazó a Space Grotesk el 4 de octubre de 2026: Samuel la
// escogió entre cuatro con sus títulos reales, y Space Grotesk es de las
// letras que más se repiten en páginas hechas con plantilla. Va como fuente
// variable con el eje de tamaño óptico (opsz): a 60 px se dibuja más cerrada
// y con más contraste que a 20, sin cargar un archivo por tamaño.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  // Es lo que sale en la pestaña del navegador y en el resultado de Google.
  // Va en línea con el título de la portada: nombra los tres servicios.
  title: "CES Agencia — Páginas web, contenido y tarjetas NFC en Pereira",
  description:
    "Páginas web, contenido para redes y tarjetas NFC para negocios de Pereira y Dosquebradas. Precio claro y sin letra menuda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-ink">
        {children}
      </body>
    </html>
  );
}
