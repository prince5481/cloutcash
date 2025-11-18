import React, { useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { ForInfluencers } from "@/components/ForInfluencers";
import { ForBrands } from "@/components/ForBrands";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  const footerRef = useRef<HTMLDivElement | null>(null);
  const howItWorksRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar
        onHomeClick={scrollToHero}
        onAboutClick={scrollToHowItWorks}
        onContactClick={scrollToFooter}
      />

      <main className="min-h-screen">
        {/* Attach ref to Hero */}
        <div ref={heroRef}>
          <Hero />
        </div>
        <Features />
        <div ref={howItWorksRef}>
          <HowItWorks />
        </div>
        <ForInfluencers />
        <ForBrands />
        <Testimonials />
        <CTA />
        <Footer ref={footerRef} />
      </main>
    </>
  );
};

export default Index;
