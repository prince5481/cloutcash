import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { motion, Variants } from "framer-motion";

const CreatorsPage = () => {
  const navigate = useNavigate();
  const footerRef = useRef<HTMLDivElement | null>(null);

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full"
              >
                For Creators
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                Turn your content into{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  real income
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto"
              >
                Connect with brands that match your vibe. No cold DMs, no awkward negotiations — just collaborations that feel right.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-sm text-muted-foreground/70 mb-8 max-w-xl mx-auto"
              >
                We bring the right opportunities to you — so you can focus on creating, not chasing.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button 
                  size="lg" 
                  className="text-lg px-8 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/25"
                  onClick={() => navigate("/login?mode=signup")}
                >
                  Join Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 transition-all duration-200 hover:scale-[1.02] hover:bg-muted/50"
                  onClick={() => navigate("/how-it-works")}
                >
                  See How It Works
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <motion.div 
                className="text-center p-6 rounded-xl transition-colors hover:bg-muted/50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={0}
                variants={fadeUpVariants}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Get Matched</h3>
                <p className="text-muted-foreground text-sm mb-1.5">
                  Our algorithm finds brands that actually fit your niche and audience.
                </p>
                <p className="text-muted-foreground/60 text-xs">
                  Relevance over volume — every match is intentional.
                </p>
              </motion.div>
              <motion.div 
                className="text-center p-6 rounded-xl transition-colors hover:bg-muted/50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={0.1}
                variants={fadeUpVariants}
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Get Paid</h3>
                <p className="text-muted-foreground text-sm mb-1.5">
                  Transparent rates, secure payments. No more chasing invoices.
                </p>
                <p className="text-muted-foreground/60 text-xs">
                  Know what you're earning upfront — always.
                </p>
              </motion.div>
              <motion.div 
                className="text-center p-6 rounded-xl transition-colors hover:bg-muted/50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={0.2}
                variants={fadeUpVariants}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Grow Your Brand</h3>
                <p className="text-muted-foreground text-sm mb-1.5">
                  Build long-term partnerships that help you level up.
                </p>
                <p className="text-muted-foreground/60 text-xs">
                  Turn one-off gigs into lasting creator relationships.
                </p>
              </motion.div>
            </div>
            
            {/* Confidence Anchor */}
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center text-muted-foreground/60 text-sm mt-10 max-w-md mx-auto"
            >
              Clarity, relevance, and long-term growth — that's the creator promise.
            </motion.p>
          </div>
        </section>
      </main>
      <Footer ref={footerRef} />
    </>
  );
};

export default CreatorsPage;
