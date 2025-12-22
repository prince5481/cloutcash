import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/cloutcash-logo.png";
import { HeroAnimation } from "./HeroAnimation";
export const Hero = () => {
  const navigate = useNavigate();
  return <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Text content */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="flex flex-col text-center lg:text-left items-center lg:items-start">
            <img src={logo} alt="CloutCash Logo" className="h-16 md:h-20 mb-6 lg:mb-8" />
            
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }}>Where Micro-Influencers meet Brand Opportunities
            <br />
              Meet Brand Opportunities
            </motion.h1>
            
            <motion.p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mb-8 lg:mb-12" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.4
          }}>Transparent, data-backed brand collaborations with consistent earnings and real results.</motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 mb-12 lg:mb-16 w-full sm:w-auto" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.6
          }}>
              <Button variant="hero" size="lg" className="text-base lg:text-lg px-8 lg:px-10 py-5 lg:py-6 h-auto group" onClick={() => navigate("/login?mode=signup")}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline-hero" size="lg" className="text-base lg:text-lg px-8 lg:px-10 py-5 lg:py-6 h-auto" onClick={() => navigate("/login")}>
                Book a Demo
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div className="grid grid-cols-3 gap-4 lg:gap-6 w-full max-w-2xl" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.8
          }}>
              <StatCard number="10K+" label="Active Creators" />
              <StatCard number="500+" label="Brand Partners" />
              <StatCard number="95%" label="Match Success" />
            </motion.div>
          </motion.div>

          {/* Right side - Animation */}
          <div className="hidden lg:block">
            <HeroAnimation />
          </div>

          {/* Mobile animation - centered below text */}
          <motion.div className="lg:hidden -mx-4" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }}>
            <HeroAnimation />
          </motion.div>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-float" style={{
        animationDelay: "1.5s"
      }}></div>
      </div>
    </section>;
};
const StatCard = ({
  number,
  label
}: {
  number: string;
  label: string;
}) => <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>;