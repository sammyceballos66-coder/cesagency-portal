import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { LiquidGradient } from "@/components/three/LiquidGradient";
import { Hero } from "@/components/sections/Hero";
import { Trio } from "@/components/sections/Trio";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { Pricing } from "@/components/sections/Pricing";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <div className="fixed inset-0 -z-10">
        <LiquidGradient />
      </div>
      <div className="field" />
      <Header />
      <main className="wrap max-w-[1180px] mx-auto px-7">
        <Hero />
        <Trio />
        <Proof />
        <Services />
        <Pricing />
        <About />
        <Contact />
      </main>
    </>
  );
}
