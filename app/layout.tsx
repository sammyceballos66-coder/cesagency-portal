import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-ink">
        {children}
      </body>
    </html>
  );
}
