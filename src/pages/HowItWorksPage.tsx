import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Sparkles, MessageCircle, Rocket, Check } from "lucide-react";

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Tell us about yourself—your niche, your vibe, your goals. Takes less than 5 minutes.",
      icon: UserPlus,
    },
    {
      number: "02",
      title: "Get Matched",
      description: "Our algorithm finds your perfect matches. Swipe right on the ones you like.",
      icon: Sparkles,
    },
    {
      number: "03",
      title: "Connect & Chat",
      description: "When it's mutual, start a conversation. No awkward intros—you already know it's a fit.",
      icon: MessageCircle,
    },
    {
      number: "04",
      title: "Create Together",
      description: "Collaborate on campaigns, track deliverables, and get paid—all in one place.",
      icon: Rocket,
    },
  ];

  const handleCardClick = (index: number) => {
    // Mark previous steps as completed when advancing
    if (index > activeStep) {
      const newCompleted = [...completedSteps];
      for (let i = activeStep; i < index; i++) {
        if (!newCompleted.includes(i)) {
          newCompleted.push(i);
        }
      }
      setCompletedSteps(newCompleted);
    }
    setActiveStep(index);
  };

  const handleCardHover = (index: number) => {
    // Only advance forward on hover, not backward
    if (index > activeStep) {
      const newCompleted = [...completedSteps];
      for (let i = activeStep; i < index; i++) {
        if (!newCompleted.includes(i)) {
          newCompleted.push(i);
        }
      }
      setCompletedSteps(newCompleted);
      setActiveStep(index);
    }
  };

  // Auto-advance through steps for demo effect on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeStep === 0 && completedSteps.length === 0) {
        // Initial subtle pulse on step 1 is already active
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeStep, completedSteps]);

  const progressPercentage = ((activeStep + 1) / steps.length) * 100;

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

        {/* Interactive Cards Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Progress Indicator */}
              <div className="mb-8 px-2">
                <div className="flex items-center justify-between mb-3">
                  {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(index);
                    const isActive = activeStep === index;
                    const isPast = index < activeStep;
                    
                    return (
                      <motion.div
                        key={step.number}
                        className="flex flex-col items-center"
                        initial={false}
                      >
                        <motion.div
                          animate={{
                            scale: isActive ? 1.15 : 1,
                            backgroundColor: isActive || isCompleted || isPast 
                              ? "hsl(var(--primary))" 
                              : "hsl(var(--muted))",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center relative"
                        >
                          {isCompleted || isPast ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 25,
                                delay: 0.1,
                              }}
                            >
                              <Check className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                            </motion.div>
                          ) : (
                            <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                              {index + 1}
                            </span>
                          )}
                          
                          {/* Active pulse ring */}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-primary"
                              initial={{ scale: 1, opacity: 0.8 }}
                              animate={{ scale: 1.5, opacity: 0 }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeOut",
                              }}
                            />
                          )}
                        </motion.div>
                        <span className={`text-[10px] md:text-xs mt-1.5 font-medium transition-colors duration-200 ${
                          isActive ? 'text-primary' : isPast || isCompleted ? 'text-primary/70' : 'text-muted-foreground'
                        }`}>
                          Step {index + 1}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                  {/* Shimmer effect on progress bar */}
                  <motion.div
                    className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "400%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>

              {/* Step Cards */}
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isActive = activeStep === index;
                  const isPast = index < activeStep || completedSteps.includes(index);
                  const isFuture = index > activeStep;
                  const Icon = step.icon;
                  
                  return (
                    <motion.div
                      key={step.number}
                      layout
                      layoutId={`card-${step.number}`}
                      onClick={() => handleCardClick(index)}
                      onMouseEnter={() => handleCardHover(index)}
                      initial={false}
                      animate={{
                        scale: isActive ? 1.02 : 1,
                        y: isActive ? -4 : 0,
                        opacity: isFuture ? 0.6 : 1,
                      }}
                      whileHover={{ 
                        scale: isActive ? 1.02 : 1.01, 
                        y: -2,
                        opacity: 1,
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8,
                      }}
                      className={`
                        relative cursor-pointer rounded-3xl overflow-hidden transition-all duration-300
                        ${isActive 
                          ? 'bg-primary shadow-2xl shadow-primary/25 ring-2 ring-primary/30' 
                          : isPast 
                            ? 'bg-primary/5 shadow-md border border-primary/20' 
                            : 'bg-card shadow-sm hover:shadow-md border border-border/50'
                        }
                      `}
                    >
                      {/* Subtle glow effect for active state */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Card Header - Always Visible */}
                      <div className="relative p-5 md:p-6 flex items-center gap-4">
                        <motion.div
                          animate={{
                            scale: isActive ? 1.1 : 1,
                            rotate: isActive ? 5 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                          }}
                          className={`
                            flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center
                            transition-colors duration-300
                            ${isActive 
                              ? 'bg-primary-foreground/20' 
                              : isPast 
                                ? 'bg-primary/20' 
                                : 'bg-muted'
                            }
                          `}
                        >
                          {isPast && !isActive ? (
                            <Check className="w-5 h-5 text-primary" />
                          ) : (
                            <Icon className={`
                              w-5 h-5 transition-colors duration-200
                              ${isActive ? 'text-primary-foreground' : 'text-primary'}
                            `} />
                          )}
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <motion.span
                            className={`
                              text-[10px] font-bold uppercase tracking-widest mb-0.5 block
                              ${isActive ? 'text-primary-foreground/60' : isPast ? 'text-primary/60' : 'text-muted-foreground/70'}
                            `}
                          >
                            Step {step.number}
                          </motion.span>
                          <h3 className={`
                            text-base md:text-lg font-bold transition-colors duration-200
                            ${isActive ? 'text-primary-foreground' : isPast ? 'text-primary' : 'text-foreground'}
                          `}>
                            {step.title}
                          </h3>
                        </div>

                        {/* Status Indicator */}
                        <motion.div
                          animate={{ 
                            rotate: isActive ? 180 : 0,
                            scale: isActive ? 1.1 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className={`
                            flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                            ${isActive 
                              ? 'bg-primary-foreground/20' 
                              : isPast 
                                ? 'bg-primary/20' 
                                : 'bg-muted'
                            }
                          `}
                        >
                          {isPast && !isActive ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <svg 
                              className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </motion.div>
                      </div>

                      {/* Expandable Description */}
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ 
                              height: "auto", 
                              opacity: 1,
                              transition: {
                                height: {
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 40,
                                  mass: 0.8,
                                },
                                opacity: { duration: 0.25, delay: 0.1 }
                              }
                            }}
                            exit={{ 
                              height: 0, 
                              opacity: 0,
                              transition: {
                                height: {
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 40,
                                },
                                opacity: { duration: 0.15 }
                              }
                            }}
                            className="overflow-hidden"
                          >
                            <motion.div 
                              initial={{ y: -8 }}
                              animate={{ y: 0 }}
                              exit={{ y: -8 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              }}
                              className="px-5 md:px-6 pb-5 md:pb-6 pt-0"
                            >
                              <div className="pl-[3.75rem] md:pl-16">
                                <p className="text-primary-foreground/85 text-sm md:text-base leading-relaxed">
                                  {step.description}
                                </p>
                                
                                {/* Next step hint */}
                                {index < steps.length - 1 && (
                                  <motion.button
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCardClick(index + 1);
                                    }}
                                    className="mt-4 text-xs font-medium text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-1.5 transition-colors"
                                  >
                                    Continue to next step
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
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
