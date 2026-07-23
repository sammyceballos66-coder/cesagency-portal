import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
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
        <BackgroundGradientAnimation
          gradientBackgroundStart="rgb(201, 217, 245)"
          gradientBackgroundEnd="rgb(255, 255, 255)"
          firstColor="61, 107, 255"
          secondColor="143, 176, 255"
          thirdColor="29, 79, 216"
          fourthColor="61, 107, 255"
          fifthColor="143, 176, 255"
          pointerColor="29, 79, 216"
          size="60%"
          blendingValue="soft-light"
          containerClassName="!h-full !w-full"
        />
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
