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

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <Hero />
        <Features />
        <HowItWorks />
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
