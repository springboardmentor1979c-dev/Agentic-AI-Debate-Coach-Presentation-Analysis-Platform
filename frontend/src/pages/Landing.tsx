import TrustedBy from "../components/TrustedBy";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">

      <Navbar />

      <Reveal>
        <Hero />
      </Reveal>

      <Reveal delay={80}>
        <TrustedBy />
      </Reveal>

      <Reveal delay={100}>
        <Features />
      </Reveal>

      <Reveal delay={100}>
        <HowItWorks />
      </Reveal>

      <Reveal delay={100}>
        <Testimonials />
      </Reveal>

      <Reveal delay={120}>
        <CTA />
      </Reveal>

      <Reveal delay={80}>
        <Footer />
      </Reveal>

    </div>
  );
}