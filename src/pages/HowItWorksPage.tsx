import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const footerRef = useRef<HTMLDivElement | null>(null);

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Tell us about yourself—your niche, your vibe, your goals. Takes less than 5 minutes.",
    },
    {
      number: "02",
      title: "Get Matched",
      description: "Our algorithm finds your perfect matches. Swipe right on the ones you like.",
    },
    {
      number: "03",
      title: "Connect & Chat",
      description: "When it's mutual, start a conversation. No awkward intros—you already know it's a fit.",
    },
    {
      number: "04",
      title: "Create Together",
      description: "Collaborate on campaigns, track deliverables, and get paid—all in one place.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full">
                How It Works
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Collabs made{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ridiculously simple
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Whether you're a creator looking for brand deals or a brand hunting for authentic voices—we've got you.
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div 
                  key={step.number}
                  className="flex gap-6 md:gap-8 mb-12 last:mb-0"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg md:text-xl">
                        {step.number}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mx-auto mt-4" />
                    )}
                  </div>
                  <div className="pt-2 md:pt-4">
                    <h3 className="text-xl md:text-2xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of creators and brands already making magic happen.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate("/login?mode=signup")}
            >
              Join Free
            </Button>
          </div>
        </section>
      </main>
      <Footer ref={footerRef} />
    </>
  );
};

export default HowItWorksPage;
